# Project Documentation — Vishnu Poojala Portfolio

> A complete written walkthrough of this project: what it is, every file and where it lives, and how each part works.

---

## 1. Overview

**Project:** Personal portfolio website for the internship task "Portfolio Website".
**Author:** Vishnu Poojala — Full Stack Developer, B.Tech CSE (2024 - 2028), Aurora's Scientific and Technological Institute.
**Stack:** HTML5 + CSS3 + vanilla JavaScript only. No frameworks, no CSS libraries, no build step, no backend, no external dependencies (no CDN fonts, no icon packages, no stock images).

The site is a single scrolling page with five sections — Hero, About, Skills, Projects and Contact — built to be responsive from 320px phones up to 1440px+ desktops, accessible by keyboard, and free of console errors and broken links.

---

## 2. Project file paths

Repository root: `C:\Users\Vishnu\Backend-Course` (GitHub: `collegecoders2/Backend-Course`)

```
Backend-Course/
│
├── README.md                                   # repo readme, links to the portfolio
│
├── .github/
│   └── workflows/
│       └── deploy-portfolio.yml                # optional GitHub Pages deployment workflow
│
└── portfolio/                                  # ← the entire website + WA-2 backend live here
    ├── index.html                              # page structure + all content (semantic markup)
    ├── style.css                               # complete design system and responsive layout
    ├── script.js                               # all JavaScript interactions
    ├── projects-loader.js                      # optional: live project cards from the backend API
    ├── server.js                               # WA-2 backend entry point (Express)
    ├── package.json                            # backend dependencies + start/dev/test scripts
    ├── .env.example                            # environment placeholders (real .env is git-ignored)
    ├── .gitignore
    ├── tests/
    │   └── api.test.js                         # automated API test suite (33 assertions)
    ├── src/
    │   ├── config/db.js                        # Mongoose connection
    │   ├── models/                             # User.js, Project.js
    │   ├── controllers/                        # authController.js, projectController.js
    │   ├── middleware/                         # auth, validation, error handling
    │   └── routes/                             # authRoutes, projectRoutes, publicProjectRoutes
    ├── README.md                               # project readme (frontend + backend API docs)
    └── DOCUMENTATION.md                        # this file
```

| Purpose | Path |
| --- | --- |
| Entry point / home page | `portfolio/index.html` |
| Styles | `portfolio/style.css` |
| JavaScript | `portfolio/script.js` |
| Live projects loader (optional) | `portfolio/projects-loader.js` |
| Backend entry point | `portfolio/server.js` |
| Backend source | `portfolio/src/` |
| API tests | `portfolio/tests/api.test.js` |
| Project readme | `portfolio/README.md` |
| This documentation | `portfolio/DOCUMENTATION.md` |
| GitHub Pages workflow | `.github/workflows/deploy-portfolio.yml` |
| Repo readme | `README.md` |

Notes:

- There is **no `assets/images/` folder** on purpose. The hero visual is drawn with HTML + CSS (a decorative code window and a grid backdrop), so there are no image files that could break and no alt text to maintain. The favicon is an inline SVG data URI inside `index.html`, so it also requires no file.
- Everything is linked with **relative paths** (`style.css`, `script.js`), so the folder can be moved, renamed, served from a sub-folder or published on GitHub Pages without changing a single link.

---

## 3. File-by-file explanation

### 3.1 `portfolio/index.html` — structure and content

The document uses semantic landmarks rather than generic `<div>` wrappers:

```html
<a class="skip-link">        → keyboard users can jump straight to content
<header>                     → sticky navigation bar
  <nav aria-label="Primary"> → brand, hamburger button, nav list
<main id="main">             → the five page sections
  <section id="home">        → Hero
  <section id="about">       → About
  <section id="skills">      → Skills
  <section id="projects">    → Projects
  <section id="contact">     → Contact
<footer>                     → brand, footer links, copyright
```

Head section contents:

- `<title>Vishnu Poojala | Full Stack Developer</title>` — required SEO title.
- `meta description`, `meta author`, `meta theme-color` — basic SEO and browser chrome.
- Inline SVG **favicon** (data URI) — no image file, therefore no broken image.
- `<link rel="stylesheet" href="style.css">`, `<script src="script.js" defer>` and `<script src="projects-loader.js" defer>` (the latter is optional — it only swaps in live project cards when the backend API answers, otherwise it does nothing).
- A `<noscript>` block with a small `<style>` fallback: if JavaScript is disabled, reveal animations are skipped and the navigation menu is rendered as a plain static list, so the page stays fully usable.

Heading hierarchy is strict: one `<h1>` in the Hero, one `<h2>` per section, `<h3>` for cards inside a section.

Section contents:

| Section | What it contains |
| --- | --- |
| **Hero** (`#home`) | `h1` "Hi, I'm Vishnu Poojala", role "Full Stack Developer", the required introduction line, CTA buttons "View My Projects" / "Contact Me", quick facts (B.Tech CSE, 2024 - 2028, CGPA 7.8), and the decorative code window (`aria-hidden="true"` because it repeats information already in text). |
| **About** (`#about`) | Two-column layout: career/interest text (backend, AI, real-world apps, continuous learning) plus an education card with Aurora's Scientific and Technological Institute, 2024 - 2028 and CGPA 7.8. |
| **Skills** (`#skills`) | Six cards — Frontend (HTML5, CSS3, JavaScript), Backend (Java, Spring Boot, REST APIs), Database (MySQL, SQL), Programming (Java, Python, Dart), Mobile (Flutter, Dart), Tools (Git, GitHub). All 13 required skills appear; skill levels are shown as badges, **never** as fake percentages. |
| **Projects** (`#projects`) | Three `<article>` cards: Smart Farmer Advisor, Hybrid RAG Knowledge Assistant, LocalWala — each with name, description, technology badges, and **disabled** "GitHub — Coming Soon" / "Live Demo — Coming Soon" buttons, because no public URLs exist yet (no invented links). These static cards are the permanent fallback; when the WA-2 backend is running, `projects-loader.js` replaces them with the live list from `GET /api/public/projects` using exactly the same markup. |
| **Contact** (`#contact`) | Contact list (mailto link, LinkedIn profile, source-code link) and a `novalidate` form with Name / Email / Message + "Prepare Message" button and a live status area (`role="status"`). |

### 3.2 `portfolio/style.css` — design system and layout

Organised top to bottom in labelled blocks:

1. **`:root` design tokens** — every reusable value lives here:

   ```css
   :root {
       --background: #0a0d12;   --surface: #131a23;
       --text: #e8eef5;         --muted: #9fb0c3;
       --accent: #2dd4bf;       --border: #232c38;
       --radius: 14px;          --nav-height: 68px;
       --font-sans: ...;        --font-mono: ...;
   }
   ```

   Changing the whole theme means editing only this block.

2. **Base** — resets, typography, container helper (`width: min(100% - 2.5rem, 1120px)`), visible `:focus-visible` rings, skip link, and `scroll-margin-top` on `#main`, `.section` and `.hero` so anchor jumps never land underneath the sticky header.

3. **Buttons** — `.btn`, `.btn--primary`, `.btn--ghost`, `:disabled` state, and the small "Coming Soon" note.

4. **Header / navigation** — `position: sticky` header with blur, `.nav__link` states, hamburger icon that morphs into an X via `aria-expanded` attribute selectors.

5. **Sections** — shared `.section`, `.section__eyebrow`, `.section__title`, `.section__lead` rules used by About, Skills, Projects and Contact (no duplicated heading CSS).

6. **Per-section blocks** — `.hero` (grid + grid backdrop + code window + syntax token colours), `.about`, `.skills`, `.projects`, `.contact` + form, `.footer`.

7. **`.reveal`** — scroll-reveal initial state and `.is-visible` end state, with per-card `nth-child` delays for a subtle stagger.

8. **Media queries** (in descending order):

   | Breakpoint | Purpose |
   | --- | --- |
   | `max-width: 900px` | Hero / About / Contact collapse from 2 columns to 1 |
   | `max-width: 860px` | Hamburger appears; nav becomes an absolute dropdown panel |
   | `max-width: 600px` | Buttons go full width, education facts reflow to 2 columns, tighter gutters |
   | `max-width: 380px` | Smaller code-window font for very narrow phones |
   | `prefers-reduced-motion` | Disables smooth scrolling, transitions and reveal offsets |

   Grids use `repeat(auto-fit, minmax(min(<size>, 100%), 1fr))` — 260px for skill cards, 300px for project cards, 210px for form fields. The `min(..., 100%)` guard is what prevents horizontal overflow at 320px.

9. **No `overflow-x: hidden` hacks** — the layout is built so nothing escapes the viewport (verified by automated checks at 320/375/480/768/1024/1280/1440px).

### 3.3 `portfolio/script.js` — the JavaScript interactions

One `DOMContentLoaded` wrapper, five clearly numbered blocks, `"use strict"`, no globals leaked, no `console.log`:

1. **Sticky header + mobile menu**
   - `.is-scrolled` border appears after 8px of scrolling.
   - `openMenu()` / `closeMenu()` toggle the `.is-open` class and keep `aria-expanded` and `aria-label` in sync.
   - Closes on: nav link click, click outside `.nav`, `Escape` (returns focus to the hamburger), and window resize past the 860px breakpoint.

2. **Smooth scrolling**
   - Delegated listener on every `a[href^="#"]`.
   - `preventDefault()` → `scrollIntoView({ behavior: "smooth" })` (falls back to `"auto"` when the user prefers reduced motion) → `history.pushState` updates the hash → `target.focus({ preventScroll: true })` so keyboard and screen-reader users land on the opened section.
   - Sections carry `tabindex="-1"` in the HTML to make that focus possible.

3. **Active navigation link**
   - A scroll handler throttled with `requestAnimationFrame` compares each section's `offsetTop` against `window.scrollY + innerHeight * 0.35`.
   - The matching link gets `.is-active` and `aria-current="true"`.

4. **Scroll reveal**
   - `IntersectionObserver` (`threshold: 0.1`, small negative bottom margin) adds `.is-visible` once and then unobserves the element.
   - Graceful fallbacks: if `IntersectionObserver` is missing, everything is revealed immediately; `prefers-reduced-motion` forces the visible state from CSS; the `<noscript>` style does the same when JavaScript is off.

5. **Contact form validation**
   - `novalidate` on the form so custom messages replace the browser defaults.
   - Per-field `validate()` functions: name (required, ≥ 2 chars), email (required + regex), message (required, ≥ 10 chars).
   - Errors are written into `#name-error` / `#email-error` / `#message-error`, the input gets `.is-invalid` and `aria-invalid="true"`, and focus jumps to the first invalid field.
   - Re-validates on `input` once a field is invalid, so errors clear as the visitor fixes them.
   - On success: builds a `mailto:vishnupoojala0@gmail.com` URL (subject + body URL-encoded from the visitor's own input, inserted via `textContent` — never `innerHTML`), shows the status message *"Thanks! Your message has been prepared. Please send it through your email client."* with an "Open email client" link, focuses the status region, and resets the form.
   - `event.preventDefault()` guarantees **no page reload** and nothing is ever sent to a server.

### 3.4 `portfolio/README.md`

Short project readme: about, technologies, sections, features, project table, file tree, run-locally steps (clone → open `portfolio/` → Live Server), two GitHub Pages deployment options, contact links.

### 3.5 `.github/workflows/deploy-portfolio.yml`

Optional GitHub Actions workflow that publishes the `portfolio/` folder to GitHub Pages on every push to `main` that touches it (also manually runnable). Uses only GitHub's official `checkout`, `configure-pages`, `upload-pages-artifact` and `deploy-pages` actions. It requires one repository setting: **Settings → Pages → Source = GitHub Actions**. If you prefer not to use Actions, `portfolio/README.md` documents the manual "Deploy from a branch" alternative instead.

---

## 4. Data used in the site

| Item | Value | Source |
| --- | --- | --- |
| Name / role | Vishnu Poojala, Full Stack Developer | provided |
| College | Aurora's Scientific and Technological Institute | provided |
| Period / CGPA | 2024 - 2028 / 7.8 | provided |
| Email | `vishnupoojala0@gmail.com` | confirmed from local git configuration |
| LinkedIn | `https://linkedin.com/in/vishnu-poojala-04815734a` | provided |
| Source-code link | `https://github.com/collegecoders2/Backend-Course` | confirmed from `git remote -v` |
| Personal GitHub profile | **intentionally omitted** | username could not be confirmed — no link was invented |
| Project GitHub / Live Demo links | **disabled "Coming Soon" buttons** | no real URLs exist yet — no links were invented |

---

## 5. How the requirements were verified

Testing was done in headless Chrome against the real files, not by eye alone.

| Check | Result |
| --- | --- |
| Horizontal page scroll at 320 / 375 / 480 / 768 / 1024 / 1280 / 1440px | none |
| Any element escaping the viewport | none |
| Hero/About/Contact column collapse at the right breakpoints | correct |
| Project cards side-by-side on desktop, stacked on mobile | correct |
| Mobile menu opens, closes on link / outside click / Escape, stays inside viewport | pass |
| Smooth scroll + hash update + active link tracking | pass |
| Anchor targets clear the sticky header on mobile **and** desktop | pass |
| Form: empty submit, invalid email, valid submit, reset, no reload | pass |
| Skip link + focus outlines via real keyboard Tab | pass |
| Content readable with JavaScript disabled (`<noscript>` fallback) | pass |
| `prefers-reduced-motion` users see content immediately | pass |
| WCAG AA contrast (34 colour pairs, alpha-composited) | all ≥ 4.5:1 (large text ≥ 3:1) |
| Tap targets ≥ 40px on mobile | pass |
| Console errors / warnings / failed resources | 0 |
| HTML tag balance, duplicate ids, broken anchors, missing `aria-*` targets, heading jumps | 0 issues |
| External links (LinkedIn, GitHub repository) | HTTP 200 |

---

## 6. How to run and test it yourself

1. **Run:** open `portfolio/index.html` directly in a browser, or use VS Code **Live Server** on that file (recommended, so relative paths behave exactly as in production).
2. **Console check:** DevTools → Console must stay empty while you browse and submit the form.
3. **Responsive check:** DevTools device toolbar at 375px, 768px and 1280px — no horizontal scrollbar, cards stack, hamburger works.
4. **Interaction check:** navigate with the menu, submit the form empty → invalid email → valid data (expect the "prepared" message and the "Open email client" link).
5. **Accessibility check:** press `Tab` from the top — the skip link appears first, every control shows a visible focus ring.
6. **Publish:** push to GitHub, set **Settings → Pages → Source = GitHub Actions**, and the workflow in `.github/workflows/deploy-portfolio.yml` deploys `portfolio/`.

---

## 7. Extending the project

- **Add a real project link:** in `portfolio/index.html`, replace a `<button ... disabled>GitHub <span class="btn__note">Coming Soon</span></button>` with `<a class="btn btn--ghost" href="REPOSITORY_URL" target="_blank" rel="noopener noreferrer">GitHub</a>`.
- **Add a GitHub profile:** in the Contact section, add another `<li>` entry modelled on the existing LinkedIn one, then update `portfolio/README.md`.
- **Change the theme:** edit only the `:root` tokens at the top of `portfolio/style.css`.
- **Add a section:** copy the pattern — `<section class="section" id="your-id" aria-labelledby="..." tabindex="-1">`, add a matching nav link, and the scroll-spy logic picks it up automatically.

---

## 8. WA-2 backend API (added on top of the static site)

The portfolio now also contains a **Node.js + Express + MongoDB REST API** with JWT authentication (Valentius Kryptix WA-2 task). It lives in the same `portfolio/` folder; the frontend above is untouched except for one extra `<script>` tag. Full endpoint reference, request/response examples and Postman steps are in [README.md](README.md#portfolio-backend-api--wa-2).

### 8.1 What it exposes

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | — | liveness check |
| POST | `/api/auth/register` | — | create account (bcrypt-hashed password, 201, 409 on duplicate email) |
| POST | `/api/auth/login` | — | get a JWT containing the user id |
| POST/GET/PUT/DELETE | `/api/projects[/:id]` | Bearer | full CRUD, scoped to the authenticated owner only |
| GET | `/api/public/projects` | — | read-only list (featured first), never exposes owner or user data |

### 8.2 How the pieces fit together

- `server.js` loads `.env`, verifies `JWT_SECRET`, connects Mongoose and **only then** listens on port `5000`; unknown routes get a JSON 404 and all errors flow through one central error handler with safe messages.
- `src/middleware/authMiddleware.js` verifies the `Authorization: Bearer <token>` header, rejects missing/garbage/expired tokens with 401, and attaches `req.user` — project ownership always comes from the token, never from the request body.
- `src/routes/projectRoutes.js` validates every write with `express-validator` (title, description, `technologies` as a non-empty string array, optional http(s) URLs, valid MongoDB ids).
- `tests/api.test.js` (`npm test`) starts the real server against an isolated `portfolio_backend_test` database, exercises every endpoint above, then drops the database.

### 8.3 Running it

```bash
cd portfolio
copy .env.example .env     # then set your own JWT_SECRET and MONGODB_URI
npm install
npm start                  # or npm run dev (nodemon) / npm test
```

### 8.4 The frontend connection (`projects-loader.js`)

`projects-loader.js` is deliberately **optional and additive**:

1. It fetches `GET /api/public/projects` from the backend (base URL configurable via `window.PORTFOLIO_API_URL` or a `data-api-base` attribute; default `http://127.0.0.1:5000`).
2. **Only** if the request succeeds and at least one valid project comes back does it replace the cards inside `.projects__grid`, building the exact same `.project-card` markup with DOM APIs (`textContent` only — server data is never interpolated into HTML).
3. If the API is down, times out (4s), returns an error, or returns an empty list, it silently does nothing and the hardcoded cards stay on screen.

So the site works identically with the backend stopped — which is exactly what happens on GitHub Pages, where no API is available.

To verify it yourself: start the backend, log in, create a project through `/api/projects`, then reload the portfolio page — the new project appears as a card (featured ones first) with working GitHub / Live Demo buttons, or "Coming Soon" disabled buttons when a URL is empty.
