from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import hashlib
import json
import os
import time


ROOT = Path(__file__).parent
DB_PATH = ROOT / "study_boss_db.json"


def load_db():
    if not DB_PATH.exists():
        return {"accounts": {}}
    try:
        return json.loads(DB_PATH.read_text())
    except json.JSONDecodeError:
        return {"accounts": {}}


def save_db(db):
    DB_PATH.write_text(json.dumps(db, indent=2))


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
    return {"color": "#52d1a8", "heroClass": "knight"}


def player_payload(account):
    player = account.get("player", {})
    avatar = default_avatar()
    avatar.update(player.get("avatar", {}))
    player["avatar"] = avatar
    player["username"] = account.get("username", player.get("username", ""))
    player["coins"] = int(player.get("coins", 0))
    player["damageBoost"] = int(player.get("damageBoost", 0))
    player["hpBoost"] = int(player.get("hpBoost", 0))
    player["coinBoost"] = int(player.get("coinBoost", 0))
    player["shieldBoost"] = int(player.get("shieldBoost", 0))
    player["bossesDefeated"] = int(player.get("bossesDefeated", 0))
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

        db = load_db()
        account = find_account_by_login(db, login)
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

        db = load_db()
        key = username.lower()
        if key in db["accounts"]:
            self.send_json(409, {"ok": False, "error": "That username already exists. Sign in instead."})
            return
        if email_exists(db, email):
            self.send_json(409, {"ok": False, "error": "That email is already attached to an account. Sign in with it instead."})
            return

        account = {
            "username": username,
            "email": email,
            "passwordHash": hash_password(username, password),
            "createdAt": int(time.time()),
            "player": {
                "username": username,
                "coins": 0,
                "damageBoost": 0,
                "hpBoost": 0,
                "coinBoost": 0,
                "shieldBoost": 0,
                "bossesDefeated": 0,
                "avatar": default_avatar(),
            },
        }
        db["accounts"][key] = account
        save_db(db)

        self.send_json(200, {"ok": True, "player": account["player"]})

    def handle_save(self):
        data = self.read_json()
        username = str(data.get("username", "")).strip()
        player = data.get("player", {})
        db = load_db()
        key = username.lower()
        account = db["accounts"].get(key)

        if not account:
            self.send_json(404, {"ok": False, "error": "Profile not found."})
            return

        account["player"] = {
            "username": account["username"],
            "coins": int(player.get("coins", 0)),
            "damageBoost": int(player.get("damageBoost", 0)),
            "hpBoost": int(player.get("hpBoost", 0)),
            "coinBoost": int(player.get("coinBoost", 0)),
            "shieldBoost": int(player.get("shieldBoost", 0)),
            "bossesDefeated": int(player.get("bossesDefeated", 0)),
            "avatar": {
                "color": str(player.get("avatar", {}).get("color", default_avatar()["color"])),
                "heroClass": str(player.get("avatar", {}).get("heroClass", default_avatar()["heroClass"])),
            },
        }
        save_db(db)
        self.send_json(200, {"ok": True, "player": account["player"]})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8002"))
    host = os.environ.get("HOST", "127.0.0.1")
    server = ThreadingHTTPServer((host, port), StudyBossHandler)
    print(f"Study Boss server running at http://{host}:{port}/")
    server.serve_forever()
