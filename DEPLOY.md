# Study Boss Deployment

This app can be deployed as one small Python web service.

## Free Demo Hosting: Render

1. Create a GitHub repository and upload these files.
2. Do not upload `study_boss_db.json`; it is ignored because it contains local account data.
3. Create a free Render account.
4. Choose **New Web Service** and connect the GitHub repo.
5. Render should detect `render.yaml`.
6. Deploy.

The public URL Render gives you is the website URL.

## Important

The current database is a JSON file. That is okay for demos and testing, but it is not ideal for a real public app with lots of users. For a real version, replace `study_boss_db.json` with Supabase, Firebase, or another hosted database so accounts survive restarts and deploys reliably.

## Local Run

```bash
python3 -B server.py
```

Then open:

```text
http://127.0.0.1:8002
```
