# Vishnu Poojala - Portfolio

Personal portfolio website of **Vishnu Poojala**, Full Stack Developer and Computer Science Engineering student (2024 - 2028) at Aurora's Scientific and Technological Institute.

## About

A single-page portfolio built with plain HTML5, CSS3 and vanilla JavaScript — no frameworks, no build step and no backend. It showcases who I am, the technologies I work with, the projects I have built and a contact form that prepares an email directly in the visitor's mail client.

> Full walkthrough of every file, path and feature: **[DOCUMENTATION.md](DOCUMENTATION.md)**

## Technologies

- HTML5
- CSS3
- JavaScript (vanilla, ES6+)

## Sections

- Hero / Intro
- About
- Skills
- Projects
- Contact

## Features

- Sticky navigation with active link highlighting
- Mobile hamburger menu (keyboard accessible, closes on Escape / outside click / link click)
- Smooth scrolling to sections
- Scroll reveal animations (disabled automatically for reduced-motion users)
- Client-side contact form validation with clear error messages
- Fully responsive layout: mobile (320px+), tablet (768px) and desktop (1280px+)
- Semantic HTML, accessible labels, focus states and ARIA attributes
- Dark professional theme driven by CSS variables

## Projects

| Project | Description | Technologies |
| --- | --- | --- |
| Smart Farmer Advisor | A smart agriculture application that helps farmers identify crop-related diseases and provides fertilizer recommendations. | Java, Spring Boot, MySQL |
| Hybrid RAG Knowledge Assistant | An AI-powered document knowledge assistant that lets users upload PDF documents and ask questions about the content, using hybrid retrieval and grounded answers with page-level citations. | Python, FastAPI, Qdrant, BM25, Sentence Transformers, Groq |
| LocalWala | A Flutter-based local delivery application designed to connect customers with local services and delivery functionality. | Flutter, Dart, REST APIs, Backend |

> Repository and live-demo links are shown as **Coming Soon** because no public URLs exist yet. Replace the disabled buttons in `index.html` with real links once the repositories are published.

## Project Structure

```
portfolio/
├── index.html
├── style.css
├── script.js
├── README.md
└── DOCUMENTATION.md
```

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/collegecoders2/Backend-Course.git
   ```

2. Open the project folder and go to the `portfolio` directory.

3. Open `index.html` in your browser — either double-click it, or (recommended) use the **Live Server** extension in VS Code:
   - Right-click `index.html` → **Open with Live Server**.

No installation or build step is required.

## Deployment (GitHub Pages)

Two options:

**Option A — GitHub Actions (already configured)**

1. Push these changes to GitHub.
2. Open the repository **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to the `main` branch — the workflow in `.github/workflows/deploy-portfolio.yml` builds and publishes the `portfolio` folder automatically.

**Option B — Deploy from a branch (manual)**

1. Copy the contents of `portfolio/` into a `docs/` folder at the repository root (or to the root itself).
2. Open **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**, select `main` and the `/docs` (or `/`) folder, then save.

The site will be published at `https://<username>.github.io/<repository>/`.

---

# Portfolio Backend API — WA-2

CRUD REST API with JWT user authentication, built for the **Valentius Kryptix WA-2 internship task** and added **inside this existing portfolio project**. The frontend above is unchanged — plain HTML, CSS and vanilla JavaScript still work exactly as before, with no build step and no framework.

## Technology stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Web framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT (`jsonwebtoken`) + `bcryptjs` password hashing |
| Validation | `express-validator` |
| Configuration | `dotenv` |
| CORS | `cors` |
| Dev server | `nodemon` |

## Prerequisites

- **Node.js 18+** (tested with Node.js 24) and npm
- **MongoDB** running locally on `127.0.0.1:27017`, or a MongoDB Atlas account
- **Postman** (or any HTTP client / curl) for testing

## Backend file structure

```
portfolio/
├── index.html                 # existing frontend (unchanged design)
├── style.css                  # existing frontend (unchanged)
├── script.js                  # existing frontend (unchanged)
├── projects-loader.js         # optional: live project cards, static fallback if API is down
├── server.js                  # backend entry point
├── package.json
├── .env                       # local secrets — NEVER committed
├── .env.example               # placeholder values only
├── .gitignore
├── tests/
│   └── api.test.js            # automated API test suite
└── src/
    ├── config/
    │   └── db.js              # Mongoose connection
    ├── models/
    │   ├── User.js            # name, email, hashed password
    │   └── Project.js         # owner, title, description, technologies, ...
    ├── controllers/
    │   ├── authController.js  # register + login
    │   └── projectController.js
    ├── middleware/
    │   ├── authMiddleware.js  # JWT verification
    │   ├── validateMiddleware.js
    │   └── errorMiddleware.js # 404 + central error handler
    └── routes/
        ├── authRoutes.js
        ├── projectRoutes.js
        └── publicProjectRoutes.js
```

## Installation

```bash
git clone https://github.com/collegecoders2/Backend-Course.git
cd Backend-Course/portfolio
npm install
```

## Environment setup

Copy the placeholder file and fill in your own values:

```bash
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
```

`.env` (already git-ignored):

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio_backend
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=http://127.0.0.1:5500
```

| Variable | Meaning |
| --- | --- |
| `PORT` | Port the API listens on (default `5000`) |
| `MONGODB_URI` | Local MongoDB URI **or** MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign tokens — **never commit it** |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d`, `12h`, `7d` |
| `CLIENT_ORIGIN` | Allowed CORS origin (Live Server runs on port `5500`). Comma-separate several origins. |

**Local MongoDB:** install MongoDB Community, start the service, and keep `MONGODB_URI=mongodb://127.0.0.1:27017/portfolio_backend`.

**MongoDB Atlas:** create a free cluster, copy the `mongodb+srv://...` connection string into `MONGODB_URI`, and add your IP to the network access list.

**Generate a JWT secret (Windows PowerShell):**

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> Never hardcode secrets. If `JWT_SECRET` or `MONGODB_URI` is wrong the server exits at startup and prints the exact configuration problem instead of pretending to work.

## Running the backend

```bash
npm start        # production: node server.js
npm run dev      # development: nodemon server.js (auto-restart)
npm test         # automated API test suite
```

Expected startup output:

```
[db] MongoDB connected: 127.0.0.1/portfolio_backend
[server] Portfolio API listening on http://127.0.0.1:5000
[server] Health check: GET http://127.0.0.1:5000/api/health
```

The server only starts listening **after** the MongoDB connection succeeds.

Health check:

```http
GET http://127.0.0.1:5000/api/health
```

```json
{ "success": true, "status": "ok", "message": "Portfolio API is running", "uptime": 12.3, "timestamp": "2026-10-09T10:00:00.000Z" }
```

The static frontend is independent: open `index.html` with Live Server (port `5500`) whenever you like, with or without the backend running.

## Endpoint reference

| Method | Endpoint | Auth | Description | Success |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | — | Server health check | 200 |
| POST | `/api/auth/register` | — | Create an account | 201 |
| POST | `/api/auth/login` | — | Log in, receive JWT | 200 |
| POST | `/api/projects` | Bearer | Create a project | 201 |
| GET | `/api/projects` | Bearer | List own projects | 200 |
| GET | `/api/projects/:id` | Bearer | Get one own project | 200 |
| PUT | `/api/projects/:id` | Bearer | Update own project | 200 |
| DELETE | `/api/projects/:id` | Bearer | Delete own project | 200 |
| GET | `/api/public/projects` | — | Public, read-only portfolio list | 200 |

**Required headers for every API call:**

```
Content-Type: application/json
```

**Required header for authenticated routes:**

```
Authorization: Bearer <token>
```

## Authentication

### Register — `POST /api/auth/register`

```json
{
  "name": "Vishnu",
  "email": "vishnu@example.com",
  "password": "StrongPassword123"
}
```

Success — **201 Created** (no password is ever returned):

```json
{
  "success": true,
  "message": "Account created successfully",
  "user": { "id": "650f...", "name": "Vishnu", "email": "vishnu@example.com" }
}
```

Rules: name 2–60 characters, valid email, password at least 8 characters, unique email.

### Login — `POST /api/auth/login`

```json
{ "email": "vishnu@example.com", "password": "StrongPassword123" }
```

Success — **200 OK**:

```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": "1d",
  "user": { "id": "650f...", "name": "Vishnu", "email": "vishnu@example.com" }
}
```

The token payload contains the user id (`userId`) plus `iat`/`exp`. Its lifetime comes from `JWT_EXPIRES_IN`.

### Using the token

Every protected call needs the header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Store it client-side, send it with each request, and log in again when it expires.

## Projects API (authenticated)

Each project:

```json
{
  "_id": "650f...",
  "owner": "<authenticated user id>",
  "title": "Smart Farmer Advisor",
  "description": "A smart agriculture application that helps farmers identify crop-related diseases and provides fertilizer recommendations.",
  "technologies": ["Java", "Spring Boot", "MySQL"],
  "githubUrl": "https://github.com/username/repo",
  "liveUrl": "https://example.com",
  "featured": true,
  "createdAt": "2026-10-09T10:00:00.000Z",
  "updatedAt": "2026-10-09T10:00:00.000Z"
}
```

`owner` is always taken from the JWT — an `owner` value sent by the client is ignored.

### Create — `POST /api/projects`

```json
{
  "title": "Smart Farmer Advisor",
  "description": "A smart agriculture application that helps farmers identify crop-related diseases.",
  "technologies": ["Java", "Spring Boot", "MySQL"],
  "githubUrl": "https://github.com/username/smart-farmer-advisor",
  "liveUrl": "https://example.com",
  "featured": true
}
```

Success — **201 Created** with the saved `project`.

### List — `GET /api/projects`

```json
{ "success": true, "count": 2, "projects": [ { "title": "...", "featured": true } ] }
```

Featured projects are sorted first.

### Read one — `GET /api/projects/:id`

Success — **200 OK** with `project`. Wrong/foreign id → **404**, malformed id → **400**.

### Update — `PUT /api/projects/:id`

Send only the fields to change (at least one is required):

```json
{ "title": "Smart Farmer Advisor v2", "featured": true }
```

Success — **200 OK** with the updated `project`.

### Delete — `DELETE /api/projects/:id`

```json
{ "success": true, "message": "Project deleted", "project": { "...": "..." } }
```

### Validation rules

- `title`: required on create, 2–120 characters
- `description`: required on create, 10–2000 characters
- `technologies`: required on create, non-empty array of strings
- `githubUrl` / `liveUrl`: optional, must be a valid `http(s)` URL
- `featured`: optional boolean
- `:id`: must be a valid MongoDB ObjectId

## Public portfolio endpoint

### `GET /api/public/projects`

No authentication. Returns only:

```json
{
  "success": true,
  "count": 1,
  "projects": [
    {
      "_id": "650f...",
      "title": "Featured project",
      "description": "...",
      "technologies": ["Node.js", "Express"],
      "githubUrl": "https://github.com/username/repo",
      "liveUrl": "https://example.com",
      "featured": true,
      "createdAt": "2026-10-09T10:00:00.000Z"
    }
  ]
}
```

Featured projects come first. Owner IDs, emails, password hashes and all other user data are **never** exposed, and there are no create/update/delete routes on this path.

### Frontend connection (`projects-loader.js`)

The static project cards in `index.html` are the permanent fallback. `projects-loader.js` (loaded with `defer` after `script.js`) fetches `/api/public/projects` and, **only when the API returns at least one valid project**, rebuilds the cards with the same markup using DOM APIs — server data is inserted via `textContent`, never `innerHTML`. If the API is down, times out after 4 seconds, errors, or returns an empty list, the script does nothing and the hardcoded cards stay exactly as they are, so the site keeps working on GitHub Pages or any host without the backend.

- API base URL: default `http://127.0.0.1:5000`; override with `window.PORTFOLIO_API_URL = "https://api.example.com"` or `<script src="projects-loader.js" data-api-base="https://api.example.com">`.
- Cards with empty `githubUrl` / `liveUrl` render the same disabled "Coming Soon" buttons as the static design.
- To go live with real data: start the backend, create projects through `/api/projects`, reload the page.

## HTTP status codes

| Code | Meaning | When |
| --- | --- | --- |
| 200 | OK | Successful read, update, delete, login, health |
| 201 | Created | Successful registration and project creation |
| 400 | Bad Request | Validation failure, malformed JSON, invalid id |
| 401 | Unauthorized | Missing/invalid/expired token, wrong credentials |
| 404 | Not Found | Unknown route, missing or foreign project |
| 409 | Conflict | Duplicate email on registration |
| 500 | Internal Server Error | Unexpected server/database failure |

## Error response format

```json
{ "success": false, "message": "Validation failed", "errors": [ { "field": "email", "message": "A valid email address is required" } ] }
```

Examples:

```json
{ "success": false, "message": "Invalid email or password" }                       // 401 login
{ "success": false, "message": "Authentication required. Send 'Authorization: Bearer <token>'." }  // 401 no token
{ "success": false, "message": "An account with this email already exists" }        // 409 register
{ "success": false, "message": "Project not found" }                                // 404
{ "success": false, "message": "Route not found: GET /api/whatever" }               // 404 unknown route
```

## Testing with Postman

1. Start the API: `npm run dev`.
2. `GET http://127.0.0.1:5000/api/health` → **200**.
3. Create a **POST** request to `http://127.0.0.1:5000/api/auth/register` → Body → raw → JSON:

   ```json
   { "name": "Vishnu", "email": "vishnu@example.com", "password": "StrongPassword123" }
   ```

   Expected **201**. Register the same email again → **409**.
4. **POST** `http://127.0.0.1:5000/api/auth/login` with the same body → **200**, copy `token`.
5. Open the **Projects** request → Headers → add `Authorization` = `Bearer <token>`; Body → raw → JSON with `title`, `description`, `technologies` → send → **201**.
6. **GET** `http://127.0.0.1:5000/api/projects` with the same header → **200**, list of your projects.
7. **GET/PUT/DELETE** `http://127.0.0.1:5000/api/projects/<id>` with the header → **200**.
8. Repeat the CRUD calls **without** the header → **401**; with a garbage or expired token → **401**.
9. Log in as a second user and try to read/delete the first user's project id → **404**.
10. **GET** `http://127.0.0.1:5000/api/public/projects` in a new request **without** any header → **200**.

Automated equivalent: `npm test` runs all of the above (33 assertions) against an isolated `portfolio_backend_test` database and drops it afterwards.

## Security

- Passwords hashed with `bcryptjs` (cost factor 10) — plain text is never stored or returned
- JWT signed with `JWT_SECRET` from `.env`, expiring after `JWT_EXPIRES_IN`
- Ownership checks on every project read/update/delete (`owner` + `_id` query)
- `owner` always comes from the authenticated token, never from the request body
- Input validation on every write route via `express-validator`
- Central error handler with safe messages — no stack traces or secrets leak to clients
- `.env` is listed in `.gitignore`; `.env.example` contains placeholders only
- CORS restricted to `CLIENT_ORIGIN`

## Pushing to GitHub

```bash
git status                 # review changes
git add index.html style.css script.js README.md DOCUMENTATION.md package.json package-lock.json server.js .env.example .gitignore src tests
git status                 # confirm .env is NOT staged
git commit -m "Add WA-2 backend API with JWT authentication and project CRUD"
git push origin main
```

**Never commit `.env`** — it holds your `JWT_SECRET` and database URI. Verify with `git status` before pushing; if `.env` ever appears, run `git rm --cached .env` and commit the removal.

## Contact

- Email: vishnupoojala0@gmail.com
- LinkedIn: [linkedin.com/in/vishnu-poojala-04815734a](https://linkedin.com/in/vishnu-poojala-04815734a)
