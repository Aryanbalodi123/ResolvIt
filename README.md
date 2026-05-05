# Complaint Us

Complaint Us is a small full-stack web application for filing and managing complaints and lost-&-found reports. It uses an Express + Mongoose JSON API backend and a React + Vite client (client-side rendered).

**Tech stack**
- **Backend:** Node.js, Express, Mongoose (MongoDB), JWT auth
- **Frontend:** React 19, Vite, Tailwind CSS (CSR via `createRoot`)
- **Dev tooling:** Vite, ESLint, concurrently

**Quick overview**
- The API server lives in `server/` and is started from [server/index.js](server/index.js). It mounts REST routes under `/api/*` (auth, users, complaints, admin, lost-found).
- The client is a Vite React app with entry at [src/main.jsx](src/main.jsx) and `index.html`. The frontend is rendered client-side (CSR) via `createRoot` in the browser.

Architecture notes
- Rendering: Client-side rendering (CSR). There is no server-side React rendering (no `ReactDOMServer` usage). `index.html` loads the module `/src/main.jsx` and the app mounts in the browser.
- API: Express app in `server/app.js` provides JSON endpoints and error handling. Database connections are handled via `server/config/db.js` using Mongoose.

Getting started (development)

Prerequisites
- Node.js (16+ recommended)
- MongoDB instance (local or cloud)

Install

```bash
npm install
```

Environment
- Copy and edit `.env.local` or set env vars directly. Important vars used by the project:
	- `API_PORT` (optional, default 4000)
	- `MONGODB_URI` (MongoDB connection string)
	- `JWT_SECRET` (auth signing key)
	- `VITE_API_BASE_URL` (used by the frontend; e.g. `http://localhost:4000/api`)

Run (development)

Start backend only:

```bash
npm run dev:api
```

Start frontend only (Vite):

```bash
npm run dev
```

Start both (concurrently):

```bash
npm run dev:all
```

Build & preview

```bash
npm run build
npm run preview
```

Available npm scripts
- `dev` — start Vite dev server
- `dev:api` — start API server (`node server/index.js`)
- `dev:all` — run both API and Vite concurrently
- `build` — build client for production
- `preview` — preview production build

API surface (high level)
- `GET /api/health` — health check
- `/api/auth/*` — authentication endpoints (login/register, token flow)
- `/api/users/*` — user CRUD/profile
- `/api/complaints/*` — create/list/manage complaints
- `/api/admin/*` — admin scoped endpoints
- `/api/lost-found/*` — lost & found reports

For a complete list, see the route files in `server/routes/`.

Notes & recommendations
- This project uses CSR; if you need SEO-critical pages or initial HTML rendering, consider adding an SSR layer or prerendering specific pages.
- Secrets (like `JWT_SECRET` and DB URIs) must not be committed — keep them in `.env.local` or secret manager.

Next steps I can help with
- Generate a detailed list of API endpoints and model fields by scanning `server/routes/` and `server/models/`.
- Add a basic Postman/OpenAPI spec for the API.

License
- See project root for licensing or add a LICENSE file.

----
Generated README for Complaint Us — let me know if you want extra sections (API docs, deployment steps, or contributor guide).
