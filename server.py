from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import hashlib
import json
import os
import random
import re
import time
from urllib import error, request

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
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
ANSWER_STOPWORDS = {
    "the", "and", "that", "this", "with", "from", "into", "where", "what",
    "which", "their", "there", "about", "have", "has", "are", "was", "were",
    "they", "them", "then", "than", "for", "use", "uses", "used", "using",
    "your", "you", "can", "will", "more", "most", "does", "help", "make",
}


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


def important_answer_words(text):
    words = re.findall(r"[a-z0-9]+", text.lower())
    return [word for word in words if len(word) > 2 and word not in ANSWER_STOPWORDS]


def answer_is_supported(answer, proof):
    answer_words = important_answer_words(answer)
    if not answer_words:
        return False
    proof_text = proof.lower()
    hits = sum(1 for word in answer_words if word in proof_text)
    return hits >= max(1, min(2, len(answer_words)))


def polish_text(text):
    text = " ".join(str(text).strip().split())
    if not text:
        return ""
    first_alpha = re.search(r"[A-Za-z]", text)
    if not first_alpha:
        return text
    index = first_alpha.start()
    return f"{text[:index]}{text[index].upper()}{text[index + 1:]}"


def clamp_score(value):
    try:
        score = float(value)
    except (TypeError, ValueError):
        return 0
    return max(0, min(1, score))


def groq_json(messages, temperature=0.35, timeout=25):
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set.")

    payload = {
        "model": GROQ_MODEL,
        "temperature": temperature,
        "response_format": {"type": "json_object"},
        "messages": messages,
    }
    body = json.dumps(payload).encode()
    req = request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "StudyBoss/1.0",
        },
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=timeout) as response:
            result = json.loads(response.read().decode())
    except error.HTTPError as exc:
        details = exc.read().decode(errors="ignore")[:500]
        raise RuntimeError(f"Groq returned {exc.code}: {details}") from exc

    content = result["choices"][0]["message"]["content"]
    return json.loads(content)


def clean_question(item, index):
    question_type = str(item.get("type", "choice")).strip().lower()
    topic = str(item.get("topic", "Study notes")).strip()[:80] or "Study notes"
    prompt = str(item.get("prompt") or item.get("question") or "").strip()
    answer = str(item.get("answer") or item.get("correct_answer") or item.get("ideal_answer") or "").strip()
    source = str(item.get("source") or item.get("source_quote") or item.get("explanation") or "").strip()
    hint = str(item.get("hint") or item.get("explanation") or f"Review the note about {topic}.").strip()

    options = item.get("options") or item.get("choices") or []
    if question_type in {"multiple_choice", "choice"} and not answer and isinstance(item.get("correct_choice_index"), int):
        index = item["correct_choice_index"]
        if isinstance(options, list) and 0 <= index < len(options):
            answer = str(options[index]).strip()

    if not prompt or not answer:
        return None
    if source and not answer_is_supported(answer, f"{source} {hint}"):
        return None
    prompt = polish_text(prompt)
    answer = polish_text(answer)
    source = polish_text(source)
    hint = polish_text(hint)
    topic = polish_text(topic)

    if question_type in {"multiple_choice", "choice"}:
        options = [polish_text(option) for option in options if str(option).strip()]
        seen = set()
        unique_options = [answer]
        seen.add(answer.lower())
        for option in options:
            key = option.lower()
            if key in seen:
                continue
            seen.add(key)
            unique_options.append(option)
        if len(unique_options) < 4:
            return None
        cleaned_options = [answer, *unique_options[1:4]]
        random.shuffle(cleaned_options)
        return {
            "type": "choice",
            "prompt": prompt,
            "answer": answer,
            "options": cleaned_options,
            "source": source or hint,
            "hint": hint,
            "topic": topic,
        }

    accepted = item.get("accepted_answers") or []
    if isinstance(accepted, list) and accepted:
        answer = str(accepted[0]).strip() or answer
    return {
        "type": "typed",
        "prompt": prompt,
        "answer": answer,
        "source": source or hint,
        "hint": hint,
        "topic": topic,
    }


def generate_questions_with_groq(notes, count):
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set.")

    prompt = f"""
Create exactly {count} study game questions from the notes for a middle/high school student.
Return only valid JSON. No markdown.
Use this shape:
{{"questions":[{{"type":"choice","topic":"...","prompt":"...","options":["...","...","...","..."],"answer":"...","hint":"...","source":"short quote from notes","explanation":"..."}}]}}

Rules:
- Make about 60 percent multiple-choice questions and about 40 percent open-response questions.
- Multiple-choice questions must include exactly 4 options and exactly one correct answer.
- Open-response questions must use type "typed", include answer as a short ideal answer of 2 to 12 words, and include hint/source.
- If the notes are short, make different question styles from the same note facts instead of inventing new facts.
- The answer must directly answer the prompt. If the prompt asks "where", use the specific place from the notes, not a bigger category.
- Make distractors believable but clearly wrong.
- Write prompts like a helpful study buddy, not a textbook or test-prep robot.
- Keep wording short and conversational. Good: "What job does chlorophyll do?" Bad: "What is the primary function..."
- Make answers sound human too. Good: "it absorbs light energy" or "in the chloroplasts". Bad: "A green pigment that absorbs light energy for photosynthesis."
- Multiple-choice options should be short, natural phrases, not stiff dictionary definitions.
- Typed ideal answers should sound like something a student would actually type.
- Use correct capitalization for prompts, answers, hints, topics, and answer choices. Keep acronyms like ATP and NADPH uppercase.
- Use normal kid-friendly phrasing like "why does this matter?", "what is going on here?", or "what would happen if..."
- Ask about meaning, cause/effect, location, purpose, and relationships, not just copied definitions.
- Include some questions that ask the player to explain the idea in their own words.
- Use class-note language from the notes, but do not copy an entire sentence as the question.
- Avoid repeating the same concept unless the notes are very short.
- Use only facts found in the notes.
- source must be a short quote from the notes, and it should contain the answer or the answer's main words.
- For location questions, choose the most specific location in the source sentence.
- explanation should briefly explain why the answer is correct in friendly language.
- Hints should nudge without giving away the answer.
- No "all of the above" or joke answers.
- Do not make the correct option much longer or more detailed than every distractor.
- Do not include duplicate options or options that are basically the same.
- Do not ask vague questions like "What should you remember?"
- Do not invent facts or use outside knowledge, even if the answer seems obvious.

Notes:
{notes[:12000]}
""".strip()

    parsed = groq_json(
        [
            {
                "role": "system",
                "content": "You write reliable, human-sounding quiz cards for a student study game. Return compact valid JSON only.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.55,
    )
    raw_questions = parsed.get("questions", parsed if isinstance(parsed, list) else [])
    questions = []
    for index, item in enumerate(raw_questions):
        if not isinstance(item, dict):
            continue
        question = clean_question(item, index)
        if question:
            questions.append(question)
    if not questions:
        raise RuntimeError("Groq did not return usable questions.")
    return questions[:count]


def grade_typed_answer_with_groq(question, user_answer):
    prompt = f"""
Grade this student's open-response answer for a Study Boss battle.
Return only valid JSON with this shape:
{{"score":0.0,"summary":"friendly one sentence","matched_ideas":["..."],"missing_ideas":["..."]}}

Scoring rules:
- 1.0 = fully correct, even if worded differently from the ideal answer.
- 0.75 = mostly correct but missing one useful detail.
- 0.5 = partly correct; understands the main topic but misses important pieces.
- 0.25 = tiny bit related, but not enough for a solid answer.
- 0.0 = blank, completely off topic, or says the opposite of the notes.
- Do not give a minimum score. If it is off topic, score 0.
- Be fair about synonyms and normal student wording.
- Do not lower the score just because the student used different words from the ideal answer.
- If the student's answer clearly means the same thing as the ideal answer, score it 1.0.
- Use the source note as the truth. Do not require facts that are not in the source.
- If the source clearly supports the student's answer, give full credit even when the ideal answer is less specific or slightly off.
- For "where" questions, a more specific correct place should beat a broader category from the ideal answer.
- Keep the summary short, specific, and encouraging.

Question: {question.get("prompt", "")}
Ideal answer: {question.get("answer", "")}
Hint: {question.get("hint", "")}
Source note: {question.get("source", "")}
Student answer: {user_answer}
""".strip()

    parsed = groq_json(
        [
            {
                "role": "system",
                "content": "You are a fair study-game grader. You grade only from the provided source note and return JSON only.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.15,
    )
    score = clamp_score(parsed.get("score", 0))
    summary = str(parsed.get("summary", "")).strip()
    if not summary:
        percent = round(score * 100)
        summary = f"{percent}% spot on."
    return {
        "score": score,
        "summary": summary[:300],
        "matchedIdeas": parsed.get("matched_ideas", [])[:5] if isinstance(parsed.get("matched_ideas"), list) else [],
        "missingIdeas": parsed.get("missing_ideas", [])[:5] if isinstance(parsed.get("missing_ideas"), list) else [],
    }


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
        if self.path == "/api/generate-questions":
            self.handle_generate_questions()
            return
        if self.path == "/api/grade-answer":
            self.handle_grade_answer()
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

    def handle_generate_questions(self):
        data = self.read_json()
        notes = " ".join(str(data.get("notes", "")).strip().split())
        count = int(data.get("count", 15) or 15)
        count = min(50, max(1, count))
        if len(notes) < 80:
            self.send_json(400, {"ok": False, "error": "Add more notes first."})
            return
        try:
            questions = []
            used = set()
            for _ in range(3):
                if len(questions) >= count:
                    break
                batch = generate_questions_with_groq(notes, count + 4)
                for question in batch:
                    key = f"{question.get('prompt', '').lower()} {question.get('answer', '').lower()}"
                    if key in used:
                        continue
                    used.add(key)
                    questions.append(question)
                    if len(questions) >= count:
                        break
            if len(questions) < count:
                raise RuntimeError("Groq did not return enough unique questions.")
        except Exception as exc:
            print(f"Groq question generation failed: {exc}", flush=True)
            self.send_json(503, {"ok": False, "error": "AI question generation failed."})
            return
        self.send_json(200, {"ok": True, "questions": questions, "model": GROQ_MODEL})

    def handle_grade_answer(self):
        data = self.read_json()
        question = data.get("question", {})
        user_answer = " ".join(str(data.get("answer", "")).strip().split())
        if not isinstance(question, dict):
            self.send_json(400, {"ok": False, "error": "Missing question."})
            return
        if len(user_answer) < 1:
            self.send_json(400, {"ok": False, "error": "Type an answer first."})
            return
        try:
            grade = grade_typed_answer_with_groq(question, user_answer)
        except Exception as exc:
            print(f"Groq answer grading failed: {exc}", flush=True)
            self.send_json(503, {"ok": False, "error": "AI grading failed."})
            return
        self.send_json(200, {"ok": True, "grade": grade, "model": GROQ_MODEL})


if __name__ == "__main__":
    init_postgres()
    port = int(os.environ.get("PORT", "8002"))
    host = os.environ.get("HOST", "127.0.0.1")
    server = ThreadingHTTPServer((host, port), StudyBossHandler)
    print(f"Study Boss server running at http://{host}:{port}/")
    server.serve_forever()
