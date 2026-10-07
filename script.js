/**
 * Vishnu Poojala — Portfolio
 * Vanilla JavaScript: mobile nav, smooth scrolling, active link,
 * scroll reveal and contact form validation.
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav__toggle");
    const menu = document.querySelector(".nav__menu");
    const navLinks = Array.from(document.querySelectorAll(".nav__link"));
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const MOBILE_BREAKPOINT = 860;
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const CONTACT_EMAIL = "vishnupoojala0@gmail.com";

    /* ------------------------------------------------------------------
     * 1. Sticky header shadow + mobile menu
     * ------------------------------------------------------------------ */
    const isMenuOpen = () => menu.classList.contains("is-open");

    const openMenu = () => {
        menu.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close navigation menu");
    };

    const closeMenu = (returnFocus = false) => {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation menu");
        if (returnFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => {
        isMenuOpen() ? closeMenu() : openMenu();
    });

    // Close when a navigation item is chosen
    navLinks.forEach((link) => {
        link.addEventListener("click", () => closeMenu());
    });

    // Close when clicking or tapping outside the navigation
    document.addEventListener("click", (event) => {
        if (isMenuOpen() && !event.target.closest(".nav")) closeMenu();
    });

    // Close with the Escape key and hand focus back to the toggle
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isMenuOpen()) closeMenu(true);
    });

    // Reset the menu when leaving the mobile layout
    window.addEventListener("resize", () => {
        if (window.innerWidth > MOBILE_BREAKPOINT) closeMenu();
    });

    const updateHeader = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    /* ------------------------------------------------------------------
     * 2. Smooth scrolling with sticky-header offset
     * ------------------------------------------------------------------ */
    document.addEventListener("click", (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const hash = link.getAttribute("href");
        if (!hash || hash.length < 2) return;

        const target = document.querySelector(hash);
        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
            behavior: prefersReducedMotion.matches ? "auto" : "smooth",
            block: "start",
        });

        if (window.history.pushState) {
            window.history.pushState(null, "", hash);
        }

        // Move keyboard/screen-reader focus to the section that was opened
        target.focus({ preventScroll: true });
    });

    /* ------------------------------------------------------------------
     * 3. Active navigation link based on scroll position
     * ------------------------------------------------------------------ */
    let scrollTicking = false;

    const updateActiveLink = () => {
        const marker = window.scrollY + window.innerHeight * 0.35;
        let currentId = sections[0].id;

        sections.forEach((section) => {
            if (section.offsetTop <= marker) currentId = section.id;
        });

        navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${currentId}`;
            link.classList.toggle("is-active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        scrollTicking = false;
    };

    window.addEventListener(
        "scroll",
        () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(updateActiveLink);
                scrollTicking = true;
            }
        },
        { passive: true }
    );

    updateActiveLink();

    /* ------------------------------------------------------------------
     * 4. Scroll reveal animations
     * ------------------------------------------------------------------ */
    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );

        revealElements.forEach((element) => revealObserver.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add("is-visible"));
    }

    /* ------------------------------------------------------------------
     * 5. Contact form validation (client-side, no backend)
     * ------------------------------------------------------------------ */
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");

    const fields = {
        name: {
            input: document.getElementById("name"),
            error: document.getElementById("name-error"),
            validate(value) {
                if (!value.trim()) return "Please enter your name.";
                if (value.trim().length < 2) return "Your name must be at least 2 characters.";
                return "";
            },
        },
        email: {
            input: document.getElementById("email"),
            error: document.getElementById("email-error"),
            validate(value) {
                if (!value.trim()) return "Please enter your email address.";
                if (!EMAIL_PATTERN.test(value.trim())) return "Please enter a valid email address.";
                return "";
            },
        },
        message: {
            input: document.getElementById("message"),
            error: document.getElementById("message-error"),
            validate(value) {
                if (!value.trim()) return "Please enter a message.";
                if (value.trim().length < 10) return "Your message must be at least 10 characters.";
                return "";
            },
        },
    };

    const showFieldState = (field, message) => {
        field.error.textContent = message;
        field.input.classList.toggle("is-invalid", Boolean(message));
        field.input.setAttribute("aria-invalid", message ? "true" : "false");
    };

    const validateField = (field) => {
        const message = field.validate(field.input.value);
        showFieldState(field, message);
        return !message;
    };

    // Clear an error as soon as the visitor fixes it
    Object.values(fields).forEach((field) => {
        field.input.addEventListener("input", () => {
            if (field.input.classList.contains("is-invalid")) validateField(field);
        });
    });

    const setStatus = (type, message, linkConfig) => {
        status.textContent = "";
        status.className = `form__status is-visible is-${type}`;

        const text = document.createElement("span");
        text.textContent = message;
        status.appendChild(text);

        if (linkConfig) {
            status.appendChild(document.createElement("br"));
            const link = document.createElement("a");
            link.href = linkConfig.href;
            link.textContent = linkConfig.label;
            status.appendChild(link);
        }

        status.focus({ preventScroll: true });
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const results = Object.values(fields).map(validateField);
        const firstInvalid = Object.values(fields).find((field) =>
            field.input.classList.contains("is-invalid")
        );

        if (results.includes(false)) {
            status.className = "form__status";
            status.textContent = "";
            if (firstInvalid) firstInvalid.input.focus();
            return;
        }

        const name = fields.name.input.value.trim();
        const email = fields.email.input.value.trim();
        const message = fields.message.input.value.trim();

        const subject = `Portfolio contact from ${name}`;
        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        const mailtoUrl =
            `mailto:${CONTACT_EMAIL}` +
            `?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(body)}`;

        setStatus(
            "success",
            "Thanks! Your message has been prepared. Please send it through your email client.",
            { href: mailtoUrl, label: "Open email client" }
        );

        form.reset();
        Object.values(fields).forEach((field) => showFieldState(field, ""));
    });
});
