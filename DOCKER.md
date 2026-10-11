# DAVOPS Agent AI – Docker guide

Two containers, one compose file:

| Container      | Source folder           | Port | What it is                                   |
|----------------|-------------------------|------|----------------------------------------------|
| `demo-service` | `backend/demo-service/` | 5001 | Express "orders-api" (the service to investigate) |
| `ops-agent`    | `ops-agent/`            | 3000 | Next.js UI + OpenAI agent                    |

```
Browser ──> :3000 ops-agent ──(http://demo-service:5001)──> demo-service ──> MongoDB Atlas
```

Inside the compose network the agent reaches the backend by its **service name**
(`demo-service`), never `localhost`. `compose.yml` sets `DEMO_SERVICE_URL` for you.

## Files

```
compose.yml
backend/demo-service/Dockerfile   .dockerignore   .env (yours, git-ignored)   .env.example
ops-agent/Dockerfile              .dockerignore   .env (yours, git-ignored)   .env.example
```

Secrets are **never** copied into an image (`.env` is in `.dockerignore`); they are passed at runtime.

## 0. Prerequisites (once)

```bash
open -a Docker                 # start Docker Desktop, wait for the whale icon to settle
docker --version
docker compose version
```

Stop anything already using the ports (local `npm start` / `npm run dev`):

```bash
lsof -i :3000 -i :5001         # shows what is listening
```

Make sure both `.env` files exist (copy from `.env.example` if not):

- `backend/demo-service/.env` → `PORT=5001`, `FAULT=on`, `MONGODB_URI=...`
- `ops-agent/.env` → `OPENAI_API_KEY=...` (needs API credits)

## 1. Run with compose (recommended)

```bash
cd /Users/idan_a/Desktop/Python/DAVOPS-Agent-AI
docker compose up --build -d        # build both images and start them
docker compose ps                   # both should become "healthy"
```

Verify:

```bash
curl -s localhost:5001/health                              # {"status":"ok"}
curl -s -o /dev/null -w "%{http_code}\n" localhost:5001/api/orders   # 500 while FAULT=on
curl -s localhost:5001/logs | head -c 300
open http://localhost:3000                                 # click "Investigate"
curl -N -X POST localhost:3000/api/investigation           # same thing from the CLI
```

Daily commands:

```bash
docker compose logs -f                    # live logs of both (Ctrl+C to leave)
docker compose logs -f ops-agent          # one service
docker compose restart demo-service
docker compose down                       # stop and remove containers
docker compose up --build -d              # after changing code or a Dockerfile
```

Change the fault (the incident the agent investigates):

```bash
# edit backend/demo-service/.env  ->  FAULT=off   (or on)
docker compose up -d --force-recreate demo-service    # .env is read only at container creation
```

Debug inside a container:

```bash
docker compose exec demo-service sh
docker compose exec ops-agent sh
```

## 2. Run the two containers by hand (without compose)

Both containers must share a network so the agent can resolve `demo-service`.

```bash
cd /Users/idan_a/Desktop/Python/DAVOPS-Agent-AI
docker network create davops-net

# --- container 1: demo-service ---
docker build -t davops/demo-service:1.0 ./backend/demo-service
docker run -d --name demo-service --network davops-net \
  --env-file ./backend/demo-service/.env -e PORT=5001 \
  -p 5001:5001 davops/demo-service:1.0

# --- container 2: ops-agent ---
docker build -t davops/ops-agent:1.0 ./ops-agent
docker run -d --name ops-agent --network davops-net \
  --env-file ./ops-agent/.env -e DEMO_SERVICE_URL=http://demo-service:5001 \
  -p 3000:3000 davops/ops-agent:1.0

docker ps
docker logs -f ops-agent

# cleanup
docker rm -f ops-agent demo-service
docker network rm davops-net
```

## 3. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `port is already allocated` / `address already in use` | A local `npm start` / `npm run dev` still runs. `lsof -i :3000 -i :5001`, stop it, retry. |
| `docker: command not found` / `Cannot connect to the Docker daemon` | Docker Desktop is not installed or not running: `open -a Docker`. |
| `ops-agent` never starts, `demo-service` is `unhealthy` | `docker compose logs demo-service`. Check the `.env` file and the Atlas connection. |
| `/logs` shows only "worker running on port 5001" | MongoDB is not reachable → Atlas **Network Access** must allow your public IP (containers leave through your Mac's IP). |
| `/api/orders` returns 200 although `FAULT=on` | Container was created before you edited `.env`: `docker compose up -d --force-recreate demo-service`. |
| Report says `You have no credits remaining` | OpenAI billing, not Docker. Add credits / use a key from a funded account, then `docker compose up -d --force-recreate ops-agent`. |
| Agent tools fail with `fetch failed` | `DEMO_SERVICE_URL` is `localhost`. In Docker it must be `http://demo-service:5001` (compose sets this; for `docker run` pass `-e`). |
| Code change not visible | Images are built, not mounted: `docker compose up --build -d`. |
| Need a clean start | `docker compose down --rmi local` then `docker compose up --build -d`. |

## 4. Notes

- `ops-agent/next.config.mjs` uses `output: "standalone"` (needed by the Dockerfile). `npm run dev` still works as before; use Docker instead of `npm start`.
- Never commit `.env` (git-ignored). `.env.example` files are safe templates and are committed.
- Both images run as the unprivileged `node` user and define a `HEALTHCHECK`; compose uses it so `ops-agent` starts only after `demo-service` is healthy.
