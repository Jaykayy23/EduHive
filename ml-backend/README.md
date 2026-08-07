# HiveQ API

This is the lightweight question-generation backend for HiveQ/BrainForge. It
parses PDF, DOCX, and text uploads locally, cleans their text, and asks Gemini
for validated quiz JSON. It does not download or run PyTorch, spaCy,
Transformers, Questgen, NLTK models, or Hugging Face models.

## Run locally

Use Python 3.10 or newer (Python 3.12 is recommended):

```powershell
cd ml-backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
# Put your real GEMINI_API_KEY in .env
.\setup.ps1
.\.venv\Scripts\python -m uvicorn app.main:app --reload --env-file .env
```

Open `http://localhost:8000/health`. The API can start and pass health checks
without an API key, but generation requests return HTTP 503 until
`GEMINI_API_KEY` is set.

## Deploy on Render

The repository-root `render.yaml` is ready for a Render Blueprint deployment.
It uses `ml-backend` as the Docker build context, so the frontend, `node_modules`,
local virtual environments, and old model files are never uploaded to the Docker
builder.

1. Create a new Render Blueprint from this repository.
2. Enter `GEMINI_API_KEY` when prompted.
3. Set `CORS_ORIGINS` to the deployed frontend origin, for example
   `https://your-hiveq-app.vercel.app`. Separate multiple origins with commas.
4. After Render deploys, set the frontend's
   `NEXT_PUBLIC_QUESTGEN_API_URL` to the Render service URL and redeploy the
   frontend.

Render supplies `PORT`; the container binds to it on `0.0.0.0` and exposes
`/health` for readiness checks.

## Build with Docker

Run these commands from `ml-backend` so the small `.dockerignore` context is
used:

```bash
docker build -t hiveq-api .
docker run --rm -p 8000:8000 --env-file .env hiveq-api
```

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | none | Server-side Gemini credential; required for generation |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model used for structured quiz output |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed frontend origins |
| `MAX_UPLOAD_MB` | `10` | Maximum in-memory upload size |
| `MAX_CONTEXT_CHARS` | `60000` | Maximum cleaned source length sent per request |
| `SUMMARY_MAX_WORDS` | `3500` | Extractive reduction target for long PDFs |
| `PORT` | `8000` | HTTP listen port |

Keep `GEMINI_API_KEY` only on the backend. Never use a `NEXT_PUBLIC_` variable
for that key.

## Test

With the environment installed:

```powershell
.\.venv\Scripts\python -m unittest discover -s tests -v
```
