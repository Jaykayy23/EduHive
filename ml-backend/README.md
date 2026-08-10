# HiveQ API

This is the lightweight question-generation backend for HiveQ. It
parses PDF, DOCX, and text uploads locally, cleans their text, and asks Gemini
for validated quiz JSON. It does not download or run PyTorch, spaCy,
Transformers, Questgen, NLTK models, or Hugging Face models.

## Run locally

Use Python 3.10 or newer (Python 3.12 is recommended):

```powershell
cd ml-backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
# Put your real GEMINI_API_KEY and HIVEQ_INTERNAL_API_KEY in .env
.\setup.ps1
.\.venv\Scripts\python -m uvicorn app.main:app --reload --env-file .env
```

Open `http://localhost:8000/health`. The API can start and pass health checks
without a Gemini key, but generation requests fail closed unless both
`GEMINI_API_KEY` and a 32+ character `HIVEQ_INTERNAL_API_KEY` are configured.

## Deploy on Render

The repository-root `render.yaml` is ready for a Render Blueprint deployment.
It uses `ml-backend` as the Docker build context, so the frontend, `node_modules`,
local virtual environments, and old model files are never uploaded to the Docker
builder.

1. Create a new Render Blueprint from this repository.
2. Enter `GEMINI_API_KEY` and a randomly generated `HIVEQ_INTERNAL_API_KEY`.
3. After Render deploys, set the Next.js server's `QUESTGEN_API_URL` to the
   Render service URL and configure the same `HIVEQ_INTERNAL_API_KEY` there.
4. Never use a `NEXT_PUBLIC_` prefix for either value. Browsers call EduHive's
   authenticated `/api/hiveq/*` proxy; they do not call Render directly.

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
| `HIVEQ_INTERNAL_API_KEY` | none | Shared 32+ character key required from the Next.js proxy |
| `ENVIRONMENT` | `development` | Set to `production` to disable API documentation routes |
| `MAX_UPLOAD_MB` | `10` | Maximum in-memory upload size |
| `MAX_CONTEXT_CHARS` | `60000` | Maximum cleaned source length sent per request |
| `MAX_PDF_PAGES` | `100` | Maximum pages parsed from one PDF |
| `MAX_DOCX_UNCOMPRESSED_MB` | `40` | Maximum expanded DOCX archive size |
| `FILE_PARSE_TIMEOUT_SECONDS` | `15` | Wall-clock limit for a parser task |
| `FILE_PARSE_MEMORY_LIMIT_MB` | `256` | Per-parser address-space cap in Linux containers |
| `MAX_CONCURRENT_FILE_PARSES` | `2` | Per-instance parser concurrency cap |
| `SUMMARY_MAX_WORDS` | `3500` | Extractive reduction target for long PDFs |
| `PORT` | `8000` | HTTP listen port |

Keep `GEMINI_API_KEY` and `HIVEQ_INTERNAL_API_KEY` server-side. Rotate the
shared key immediately if it is ever exposed.

## Test

With the environment installed:

```powershell
.\.venv\Scripts\python -m unittest discover -s tests -v
```
