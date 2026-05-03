from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import hashlib
import json
import os
import time

try:
    import psycopg2
    from psycopg2.extras import Json, RealDictCursor
except ImportError:
    psycopg2 = None
    Json = None
    RealDictCursor = None


ROOT = Path(__file__).parent
DB_PATH = ROOT / "study_boss_db.json"
DATABASE_URL = os.environ.get("DATABASE_URL", "")
DEFAULT_AVATAR_COLORS = ["#52d1a8", "#2d8cff", "#f5c451", "#ff5f6d", "#b987ff", "#ff8f3d", "#ffffff", "#111111"]


def use_postgres():
    return bool(DATABASE_URL)


def get_connection():
    if not use_postgres():
        return None
    if psycopg2 is None:
        raise RuntimeError("DATABASE_URL is set, but psycopg2 is not installed.")
    return psycopg2.connect(DATABASE_URL)


def init_postgres():
    if not use_postgres():
        print("Study Boss storage: local JSON", flush=True)
        return
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS accounts (
                    username_key TEXT PRIMARY KEY,
                    email_key TEXT UNIQUE,
                    account JSONB NOT NULL,
                    created_at INTEGER NOT NULL
                )
                """
            )
    print("Study Boss storage: postgres", flush=True)


def load_db():
    if not DB_PATH.exists():
        return {"accounts": {}}
    try:
        return json.loads(DB_PATH.read_text())
    except json.JSONDecodeError:
        return {"accounts": {}}


def save_db(db):
    DB_PATH.write_text(json.dumps(db, indent=2))


def get_account(username):
    key = username.lower()
    if use_postgres():
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT account FROM accounts WHERE username_key = %s", (key,))
                row = cur.fetchone()
                return row["account"] if row else None
    db = load_db()
    return db["accounts"].get(key)


def find_account(login):
    login_key = login.lower()
    if use_postgres():
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT account FROM accounts WHERE username_key = %s OR email_key = %s",
                    (login_key, login_key),
                )
                row = cur.fetchone()
                return row["account"] if row else None
    return find_account_by_login(load_db(), login)


def account_email_exists(email):
    if not email:
        return False
    email_key = email.lower()
    if use_postgres():
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM accounts WHERE email_key = %s", (email_key,))
                return cur.fetchone() is not None
    return email_exists(load_db(), email)


def create_account(account):
    key = account["username"].lower()
    if use_postgres():
        email_key = account.get("email", "").lower() or None
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO accounts (username_key, email_key, account, created_at)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (key, email_key, Json(account), account["createdAt"]),
                )
        return
    db = load_db()
    db["accounts"][key] = account
    save_db(db)


def save_account(account):
    key = account["username"].lower()
    if use_postgres():
        email_key = account.get("email", "").lower() or None
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE accounts
                    SET email_key = %s, account = %s
                    WHERE username_key = %s
                    """,
                    (email_key, Json(account), key),
                )
        return
    db = load_db()
    db["accounts"][key] = account
    save_db(db)


def hash_password(username, password):
    salted = f"{username.lower()}:study-boss:{password}".encode()
    return hashlib.sha256(salted).hexdigest()


def find_account_by_login(db, login):
    login_key = login.lower()
    if login_key in db["accounts"]:
        return db["accounts"][login_key]
    for account in db["accounts"].values():
        if account.get("email", "").lower() == login_key:
            return account
    return None


def email_exists(db, email):
    if not email:
        return False
    email_key = email.lower()
    return any(account.get("email", "").lower() == email_key for account in db["accounts"].values())


def default_avatar():
    return {"color": "#52d1a8", "heroClass": "knight", "accessory": "none"}


def player_payload(account):
    player = account.get("player", {})
    avatar = default_avatar()
    avatar.update(player.get("avatar", {}))
    player["avatar"] = avatar
    player["username"] = account.get("username", player.get("username", ""))
    player["xp"] = int(player.get("xp", 0))
    player["coins"] = int(player.get("coins", 0))
    player["damageBoost"] = int(player.get("damageBoost", 0))
    player["coinBoost"] = int(player.get("coinBoost", 0))
    player["shieldBoost"] = int(player.get("shieldBoost", 0))
    player["bossesDefeated"] = int(player.get("bossesDefeated", 0))
    player["unlockedAvatarColors"] = player.get("unlockedAvatarColors", DEFAULT_AVATAR_COLORS)
    player["unlockedAccessories"] = player.get("unlockedAccessories", ["none"])
    account["player"] = player
    return player


class StudyBossHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0:
            return {}
        return json.loads(self.rfile.read(length).decode())

    def send_json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path == "/api/signup":
            self.handle_signup()
            return
        if self.path == "/api/login":
            self.handle_login()
            return
        if self.path == "/api/save":
            self.handle_save()
            return
        self.send_json(404, {"ok": False, "error": "Unknown endpoint"})

    def do_GET(self):
        if self.path == "/api/status":
            self.send_json(200, {"ok": True, "storage": "postgres" if use_postgres() else "json"})
            return
        super().do_GET()

    def handle_login(self):
        data = self.read_json()
        login = " ".join(str(data.get("login", "")).strip().split())
        password = str(data.get("password", ""))

        if len(login) < 3:
            self.send_json(400, {"ok": False, "error": "Enter your username or email."})
            return
        if len(password) < 4:
            self.send_json(400, {"ok": False, "error": "Enter your password."})
            return

        account = find_account(login)
        if not account:
            self.send_json(404, {"ok": False, "error": "No account found. Sign up first."})
            return

        password_hash = hash_password(account["username"], password)
        if account["passwordHash"] != password_hash:
            self.send_json(403, {"ok": False, "error": "Password did not match."})
            return

        self.send_json(200, {"ok": True, "player": player_payload(account)})

    def handle_signup(self):
        data = self.read_json()
        username = " ".join(str(data.get("username", "")).strip().split())
        email = str(data.get("email", "")).strip()
        password = str(data.get("password", ""))

        if len(username) < 3:
            self.send_json(400, {"ok": False, "error": "Pick a username with at least 3 characters."})
            return
        if len(password) < 4:
            self.send_json(400, {"ok": False, "error": "Use at least 4 characters for the password."})
            return

        if get_account(username):
            self.send_json(409, {"ok": False, "error": "That username already exists. Sign in instead."})
            return
        if account_email_exists(email):
            self.send_json(409, {"ok": False, "error": "That email is already attached to an account. Sign in with it instead."})
            return

        account = {
            "username": username,
            "email": email,
            "passwordHash": hash_password(username, password),
            "createdAt": int(time.time()),
            "player": {
                "username": username,
                "xp": 0,
                "coins": 0,
                "damageBoost": 0,
                "coinBoost": 0,
                "shieldBoost": 0,
                "bossesDefeated": 0,
                "avatar": default_avatar(),
                "unlockedAvatarColors": DEFAULT_AVATAR_COLORS,
                "unlockedAccessories": ["none"],
            },
        }
        create_account(account)

        self.send_json(200, {"ok": True, "player": account["player"]})

    def handle_save(self):
        data = self.read_json()
        username = str(data.get("username", "")).strip()
        player = data.get("player", {})
        account = get_account(username)

        if not account:
            self.send_json(404, {"ok": False, "error": "Profile not found."})
            return

        account["player"] = {
            "username": account["username"],
            "xp": int(player.get("xp", 0)),
            "coins": int(player.get("coins", 0)),
            "damageBoost": int(player.get("damageBoost", 0)),
            "coinBoost": int(player.get("coinBoost", 0)),
            "shieldBoost": int(player.get("shieldBoost", 0)),
            "bossesDefeated": int(player.get("bossesDefeated", 0)),
            "avatar": {
                "color": str(player.get("avatar", {}).get("color", default_avatar()["color"])),
                "heroClass": str(player.get("avatar", {}).get("heroClass", default_avatar()["heroClass"])),
                "accessory": str(player.get("avatar", {}).get("accessory", default_avatar()["accessory"])),
            },
            "unlockedAvatarColors": list(player.get("unlockedAvatarColors", DEFAULT_AVATAR_COLORS)),
            "unlockedAccessories": list(player.get("unlockedAccessories", ["none"])),
        }
        save_account(account)
        self.send_json(200, {"ok": True, "player": account["player"]})


if __name__ == "__main__":
    init_postgres()
    port = int(os.environ.get("PORT", "8002"))
    host = os.environ.get("HOST", "127.0.0.1")
    server = ThreadingHTTPServer((host, port), StudyBossHandler)
    print(f"Study Boss server running at http://{host}:{port}/")
    server.serve_forever()
