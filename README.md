# DMI — Developer Market Intelligence

DMI is a full-stack developer job intelligence workspace. It separates **illustrative market analysis** from a **stored job snapshot**, then gives a candidate a private, human-controlled workflow to compare skills, save roles, and track applications.

## Engineering highlights

- React/Vite frontend with an editorial, responsive UI
- FastAPI backend with OpenAPI documentation at `/docs`
- SQLAlchemy ORM + Alembic migrations
- PostgreSQL persistence with SQLite support for local tests
- Redis-backed analytics cache with graceful fallback
- Separate ingestion worker so scraping does not block HTTP requests
- Deduplicated job ingestion and source labeling (`scraped` vs `demo`)
- JWT authentication with Argon2 password hashing
- Per-user application tracker with status, notes, ownership checks, and deletion
- Explainable skill overlap scoring rather than an opaque hiring prediction
- Optional local AI cover-letter drafting through Ollama; human review is required
- Docker Compose for API, worker, PostgreSQL, Redis, and an unprivileged Nginx frontend
- GitHub Actions for migrations, backend tests, frontend lint, and production build

## Product boundaries

DMI **does not automatically apply to jobs**, impersonate a candidate, or submit applications. The user chooses every application and reviews every AI draft.

The dashboard's salary and demand pages intentionally use an **illustrative dataset**. The `/jobs` workspace uses the persisted job snapshot and labels demo records clearly.

## Architecture

```text
React/Vite + Nginx
        │ same-origin /api proxy
        ▼
FastAPI API ───── Redis cache
    │                 │
    ▼                 │
PostgreSQL ◄── worker ┘
    │
    └── jobs, users, applications, migrations

Optional: FastAPI ──HTTP──> local Ollama (cover-letter draft only)
```

The scraper is based on [JobSpy](https://github.com/speedyapply/JobSpy), an MIT-licensed open-source job aggregation library. Use it responsibly, respect each source's terms, and avoid aggressive scrape intervals.

## Local development without Docker

### Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r Backend/requirements.txt pytest httpx

cd Backend
export DATABASE_URL=sqlite:///./dmi.db
alembic upgrade head
python -m dmi.demo                 # optional, clearly labeled demo listings
uvicorn app:app --reload --port 8000
```

In a second terminal, from the repository root:

```bash
source .venv/bin/activate
export DATABASE_URL=sqlite:///./dmi.db
python -m Backend.dmi.worker       # optional background ingestion worker
```

If running the backend from `Backend/`, use `python -m dmi.worker` instead.

### Frontend

```bash
cd Frontend
npm ci
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/api` and `/health` to `http://127.0.0.1:8000` during development.

### Tests

```bash
cd Backend
DATABASE_URL=sqlite:///./ci.db alembic upgrade head
DATABASE_URL=sqlite:///./ci.db alembic check
pytest -q

cd ../Frontend
npm run lint
npm run build
```

## Optional local AI drafting (₹0 API cost)

The core application and explainable skill matching work without AI. To enable cover-letter drafts, run Ollama locally, pull a small model, and configure the backend:

```bash
ollama run gemma3:1b
export OLLAMA_URL=http://127.0.0.1:11434
export OLLAMA_MODEL=gemma3:1b
```

The API calls Ollama's non-streaming `/api/generate` endpoint. Drafts are not stored automatically and are labeled as requiring human review. If `OLLAMA_URL` is absent, the endpoint returns a truthful offline structured draft with placeholders.

## Docker deployment

Requires Docker Engine and Compose.

```bash
cp .env.example .env
# Replace POSTGRES_PASSWORD and SECRET_KEY with independent random values.
# Example: openssl rand -hex 32

docker compose up --build -d

docker compose ps
```

Open <http://127.0.0.1:8080>. The API docs are at <http://127.0.0.1:8080/docs> only if the frontend proxy is extended; the direct API is available inside the Compose network on port 8000. For a public deployment, put the frontend behind an HTTPS reverse proxy and set `DMI_BIND`/`DMI_PORT` as needed.

Compose starts:

- `db`: PostgreSQL with a persistent named volume
- `redis`: bounded-memory cache
- `api`: runs Alembic migrations before starting FastAPI
- `worker`: periodic ingestion, preserving the last successful snapshot on failure
- `frontend`: production React build served by non-root Nginx on port 8080

The default bind address is `127.0.0.1`, so the service is not accidentally exposed to the network. Do not commit `.env`.

## API highlights

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Database-aware health check |
| `GET /api/jobs?q=&country=&limit=` | Search stored jobs |
| `GET /api/data-status` | Snapshot freshness and demo count |
| `POST /api/auth/register` | Create an account |
| `POST /api/auth/login` | Start a JWT session |
| `PATCH /api/me` | Store candidate skills |
| `GET /api/jobs/{id}/match` | Explainable skill overlap |
| `POST /api/applications` | Save a job for the current user |
| `PATCH /api/applications/{id}` | Change status or notes |
| `POST /api/jobs/{id}/draft-cover-letter` | Optional local AI draft; human review required |

## Production checklist

- Use a unique `SECRET_KEY` with at least 32 characters.
- Use PostgreSQL and Redis, not SQLite, for multi-user deployment.
- Put HTTPS in front of the frontend.
- Restrict `CORS_ORIGINS` to the real frontend origin.
- Set a realistic scrape interval and respect source terms.
- Configure log aggregation and backups for PostgreSQL.
- Rotate secrets and remove demo records before presenting real data.
- Add an email verification/password-reset workflow before public launch.

## License

This repository is a portfolio project. Review the licenses and terms of all external data sources before operating a public scraper.

## Authentication and email verification

Password accounts must verify ownership of the email address before login. Registration sends a six-digit code that expires after 10 minutes and is limited to five attempts. The database stores only a hash of the code.

For local development, leave `EMAIL_PROVIDER=log`; the code is written to the API log and no email service is needed. For real inbox delivery, Resend currently offers a free transactional tier of 3,000 emails per month with a 100-email daily limit. Brevo is another free option with 300 transactional sends per day. Set one provider in `.env`; never commit the API key.

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=DMI <verified-sender@example.com>
```

An email syntax validator cannot prove that a person owns an address. DMI uses an OTP for ownership verification; provider-side email validation is not a substitute.

### Google sign-in

Create a Google Web application OAuth client and add this authorized redirect URI:

```text
http://localhost:8080/api/auth/google/callback
```

For a public deployment, add the HTTPS equivalent. Set `OAUTH_BACKEND_URL` to the public API origin (for example `https://dmi-api.example.com`) so callback URLs do not depend on forwarded host headers. Then set:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

DMI requests only `openid email profile` and requires Google's verified-email claim.
OAuth will not silently attach a provider to an existing password account with the same email; sign in with email first before any future account-linking flow.

### GitHub sign-in

Create a GitHub OAuth App under **Settings → Developer settings → OAuth Apps**. Set the callback URL to:

```text
http://localhost:8080/api/auth/github/callback
```

Then set:

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

DMI requests only `read:user user:email`, selects a verified GitHub email, and does not request repository access. If either provider is not configured, its button returns a clear configuration error rather than pretending sign-in is available.

OAuth callback tickets are short-lived, single-use, and exchanged for the same DMI JWT session used by password accounts.

## Scheduled production ingestion

The public deployment uses a one-shot GitHub Actions job instead of an always-on worker. The workflow in `.github/workflows/ingest.yml` runs every six hours and can also be started manually from the Actions tab. It checks out `main`, installs the backend dependencies, scrapes the configured countries, and writes the successful snapshot to Supabase. If a scrape returns no rows, the existing database snapshot is preserved.

The `.github/workflows/keepalive.yml` workflow pings the production health endpoint every ten minutes to reduce cold starts on Render's free tier. Free Render services can still sleep or wake slowly occasionally; a paid always-on instance is required for a guaranteed sub-five-second first request.

Before running it, add these repository Actions secrets in GitHub under **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `DATABASE_URL` | The private `postgresql+psycopg://...` Supabase session-pooler URL |
| `SECRET_KEY` | The same strong production secret used by Render |
| `REDIS_URL` | Optional Upstash Redis URL; leave the workflow secret empty if Redis is not configured |

Never commit these values. Use **Actions → scheduled-ingestion → Run workflow** for the first manual refresh, then check `/api/data-status` on the deployed API.
