# TripSplit

Split expenses with friends during trips. Spring Boot backend + React frontend.

## Live

- Frontend: https://tripsplit-dev.netlify.app
- Backend API: https://tripsplit-springboot.onrender.com (`GET /api/health` → `{"status":"UP"}`)

## Architecture

| Part     | Hosting          | Config                          |
|----------|------------------|---------------------------------|
| Frontend | Netlify          | `netlify.toml`, `VITE_API_URL`  |
| Backend  | Render (Java 21) | `render.yaml`, env vars below   |
| Database | MongoDB Atlas    | connection string via `MONGODB_URI` |

## Quick Start (local)

### Prerequisites
- Java 21+
- MongoDB (local or Atlas)

### Run

```bash
# Start backend (make sure MongoDB is running on localhost:27017)
./gradlew bootRun

# Start frontend dev server (separate terminal)
cd frontend && npm install && npm run dev

# Open http://localhost:5173
```

To run the backend against Atlas locally:

```bash
export MONGODB_URI='mongodb+srv://<user>:<password>@<cluster>.mongodb.net/tripsplit?retryWrites=true&w=majority'
./gradlew bootRun
```

## Deploy

Both platforms deploy straight from git (`main` branch) — configs are in the repo.

### Backend (Render)

`render.yaml` is auto-detected: build `chmod +x gradlew && ./gradlew build -x test`,
start `java -jar build/libs/tripsplit-0.0.1-SNAPSHOT.jar`, health check `/api/health`.

Required env vars on Render:

| Key                    | Value                                                        |
|------------------------|--------------------------------------------------------------|
| `JAVA_VERSION`         | `21` (from blueprint)                                        |
| `MONGODB_URI`          | Atlas connection string with `/tripsplit` db name            |
| `JWT_SECRET`           | Random 256-bit key — `openssl rand -hex 32`                  |
| `CORS_ALLOWED_ORIGINS` | `https://tripsplit-dev.netlify.app`                          |

Do not set `PORT` (Render injects it). Free tier sleeps when idle — first request takes ~50s.

### Frontend (Netlify)

`netlify.toml` is auto-detected: base `frontend`, build `npm ci && npm run build`,
publish `dist`, SPA fallback `/* → /index.html`.

Required env var on Netlify:

| Key            | Value                                        |
|----------------|----------------------------------------------|
| `VITE_API_URL` | `https://tripsplit-springboot.onrender.com`  |

### Database (MongoDB Atlas, free M0)

1. Create cluster in a region near the Render service.
2. Database Access → user with `readWrite` on `tripsplit` (URL-encode `@ / : ? #` in the password).
3. Network Access → allow `0.0.0.0/0` (Render IPs are dynamic).
4. Connect → Drivers → Java → copy string, insert `/tripsplit` before the `?`.
5. Verify data anytime: Database → Browse Collections → `tripsplit` → `users`, `trips`, `expenses`, `members`, `settlements`.

### Legacy monolith bundle

```bash
cd frontend && ./deploy.sh
java -jar build/libs/tripsplit-0.0.1-SNAPSHOT.jar
```

## Project structure

Monolith with clean domain packages ready to split into microservices:

```
com.tripsplit
├── config/       # Security, JWT, Web
├── common/       # Shared DTOs, exceptions, health
├── user/         # Auth, users
├── trip/         # Trips, members
├── expense/      # Expenses, splits
└── settlement/   # Balance calculation, settlements
```
