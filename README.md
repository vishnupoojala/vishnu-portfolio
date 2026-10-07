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

## Contact

- Email: vishnupoojala0@gmail.com
- LinkedIn: [linkedin.com/in/vishnu-poojala-04815734a](https://linkedin.com/in/vishnu-poojala-04815734a)
