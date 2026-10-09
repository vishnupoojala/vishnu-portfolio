/**
 * Portfolio — optional live projects loader.
 *
 * Fetches GET /api/public/projects from the WA-2 backend and, only when the
 * API returns at least one valid project, replaces the static project cards
 * with live data.
 *
 * Fallback behaviour (the page never breaks):
 *   - API unreachable / CORS blocked / timed out  -> static cards stay
 *   - non-200 response or success !== true        -> static cards stay
 *   - empty project list                          -> static cards stay
 *   - any parsing problem                         -> static cards stay
 *
 * Configuration (optional, in order of precedence):
 *   1. window.PORTFOLIO_API_URL = "https://api.example.com"
 *   2. <script src="projects-loader.js" data-api-base="https://api.example.com">
 *   3. default: http://127.0.0.1:5000
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".projects__grid");
    if (!grid) return;

    const DEFAULT_BASE = "http://127.0.0.1:5000";
    const TIMEOUT_MS = 4000;

    const scriptTag = document.querySelector('script[src="projects-loader.js"]');
    const API_BASE =
        (typeof window.PORTFOLIO_API_URL === "string" && window.PORTFOLIO_API_URL) ||
        (scriptTag && scriptTag.dataset.apiBase) ||
        DEFAULT_BASE;

    const pad = (n) => String(n).padStart(2, "0");

    const makeAction = (label, url) => {
        if (url) {
            const link = document.createElement("a");
            link.className = "btn btn--ghost";
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = label;
            return link;
        }

        const button = document.createElement("button");
        button.className = "btn btn--ghost";
        button.type = "button";
        button.disabled = true;

        const note = document.createElement("span");
        note.className = "btn__note";
        note.textContent = "Coming Soon";

        button.append(document.createTextNode(label + " "), note);
        return button;
    };

    const makeCard = (project, index) => {
        const card = document.createElement("article");
        card.className = "project-card reveal is-visible";

        const number = document.createElement("p");
        number.className = "project-card__index";
        number.textContent = `Project ${pad(index + 1)}`;

        const title = document.createElement("h3");
        title.className = "project-card__title";
        title.textContent = project.title;

        const description = document.createElement("p");
        description.className = "project-card__desc";
        description.textContent = project.description;

        const techList = document.createElement("ul");
        techList.className = "project-card__tech";
        techList.setAttribute("aria-label", "Technologies used");
        for (const tech of project.technologies) {
            const tag = document.createElement("li");
            tag.className = "tag";
            tag.textContent = tech;
            techList.appendChild(tag);
        }

        const actions = document.createElement("div");
        actions.className = "project-card__actions";
        actions.append(
            makeAction("GitHub", project.githubUrl),
            makeAction("Live Demo", project.liveUrl)
        );

        card.append(number, title, description, techList, actions);
        return card;
    };

    const isRenderable = (project) =>
        project &&
        typeof project.title === "string" &&
        typeof project.description === "string" &&
        Array.isArray(project.technologies) &&
        project.technologies.length > 0;

    const load = async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const response = await fetch(`${API_BASE}/api/public/projects`, {
                method: "GET",
                headers: { Accept: "application/json" },
                signal: controller.signal,
            });

            if (!response.ok) return;

            const data = await response.json();
            if (!data || data.success !== true || !Array.isArray(data.projects)) return;

            const projects = data.projects.filter(isRenderable);
            if (projects.length === 0) return;

            const fragment = document.createDocumentFragment();
            projects.forEach((project, index) => {
                fragment.appendChild(makeCard(project, index));
            });

            grid.replaceChildren(fragment);
        } catch {
            // Offline, CORS blocked or timed out: keep the static fallback cards.
        } finally {
            clearTimeout(timer);
        }
    };

    load();
});
