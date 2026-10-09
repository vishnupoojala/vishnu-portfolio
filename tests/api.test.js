"use strict";

/**
 * WA-2 API test suite.
 * Runs the real server as a child process against an isolated
 * `portfolio_backend_test` MongoDB database, exercises every endpoint
 * and cleans up afterwards.
 *
 * Run with:  npm test
 */

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const ROOT = path.join(__dirname, "..");
const PORT = "5199";
const BASE = `http://127.0.0.1:${PORT}`;

// The secret the child server will use (env wins over .env, so both sides match).
const SECRET = process.env.JWT_SECRET || "test-secret-do-not-use-in-production";

function buildTestUri() {
    const base =
        process.env.MONGODB_URI ||
        "mongodb://127.0.0.1:27017/portfolio_backend";
    try {
        const url = new URL(base);
        url.pathname = "/portfolio_backend_test";
        return url.toString();
    } catch {
        return base;
    }
}

const TEST_URI = buildTestUri();
const STAMP = Date.now();

const USER_A = {
    name: "WA2 Test User A",
    email: `wa2test.a.${STAMP}@example.com`,
    password: "StrongPassword123",
};
const USER_B = {
    name: "WA2 Test User B",
    email: `wa2test.b.${STAMP}@example.com`,
    password: "StrongPassword123",
};

const state = {
    child: null,
    logs: [],
    tokenA: null,
    tokenB: null,
    idA: null,
    idB: null,
    projectA: null,
    projectAFeatured: null,
    projectB: null,
};

async function api(method, urlPath, { token, body } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE}${urlPath}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    let json = null;
    try {
        json = await res.json();
    } catch {
        json = null;
    }
    return { status: res.status, body: json };
}

async function waitForHealth(timeoutMs = 20000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const res = await fetch(`${BASE}/api/health`);
            if (res.ok) return true;
        } catch {
            /* server not up yet */
        }
        await new Promise((r) => setTimeout(r, 250));
    }
    return false;
}

before(async () => {
    // Start from a clean, isolated database every run.
    await mongoose.connect(TEST_URI);
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();

    state.child = spawn(process.execPath, ["server.js"], {
        cwd: ROOT,
        env: {
            ...process.env,
            PORT,
            MONGODB_URI: TEST_URI,
            JWT_SECRET: SECRET,
            JWT_EXPIRES_IN: "1h",
            CLIENT_ORIGIN: "http://127.0.0.1:5500",
        },
        stdio: ["ignore", "pipe", "pipe"],
    });

    state.child.stdout.on("data", (d) => state.logs.push(d.toString()));
    state.child.stderr.on("data", (d) => state.logs.push(d.toString()));

    const healthy = await waitForHealth();
    if (!healthy) {
        throw new Error(
            `Server did not become healthy on ${BASE}.\nServer logs:\n${state.logs.join("")}`
        );
    }
});

after(async () => {
    if (state.child) {
        state.child.kill();
        await new Promise((r) => setTimeout(r, 300));
    }

    try {
        await mongoose.connect(TEST_URI);
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    } catch (err) {
        console.error(`[cleanup] could not drop test database: ${err.message}`);
    }
});

test("WA-2 backend API", async (t) => {
    await t.test("health endpoint returns 200 JSON", async () => {
        const res = await api("GET", "/api/health");
        assert.equal(res.status, 200);
        assert.equal(res.body.status, "ok");
    });

    await t.test("unknown route returns 404 JSON", async () => {
        const res = await api("GET", "/api/definitely-not-a-route");
        assert.equal(res.status, 404);
        assert.equal(res.body.success, false);
    });

    await t.test("register rejects missing fields with 400", async () => {
        const res = await api("POST", "/api/auth/register", { body: {} });
        assert.equal(res.status, 400);
        assert.ok(Array.isArray(res.body.errors));
        const fields = res.body.errors.map((e) => e.field);
        assert.ok(fields.includes("name"));
        assert.ok(fields.includes("email"));
        assert.ok(fields.includes("password"));
    });

    await t.test("register rejects malformed email with 400", async () => {
        const res = await api("POST", "/api/auth/register", {
            body: { name: "Vishnu", email: "not-an-email", password: "StrongPassword123" },
        });
        assert.equal(res.status, 400);
        assert.ok(res.body.errors.some((e) => e.field === "email"));
    });

    await t.test("register rejects short password with 400", async () => {
        const res = await api("POST", "/api/auth/register", {
            body: { name: "Vishnu", email: "short@example.com", password: "Short1" },
        });
        assert.equal(res.status, 400);
        assert.ok(res.body.errors.some((e) => e.field === "password"));
    });

    await t.test("register creates account with 201 and never returns the password", async () => {
        const res = await api("POST", "/api/auth/register", { body: USER_A });
        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert.equal(res.body.user.email, USER_A.email);
        assert.equal(res.body.user.password, undefined);
        assert.ok(res.body.user.id);
        state.idA = res.body.user.id;
    });

    await t.test("stored password is a bcrypt hash, not plain text", async () => {
        await mongoose.connect(TEST_URI);
        const user = await mongoose.connection
            .collection("users")
            .findOne({ email: USER_A.email });
        assert.ok(user, "user should exist in the test database");
        assert.notEqual(user.password, USER_A.password);
        assert.match(user.password, /^\$2[a-z]\$/);
        await mongoose.disconnect();
    });

    await t.test("duplicate email returns 409", async () => {
        const res = await api("POST", "/api/auth/register", { body: USER_A });
        assert.equal(res.status, 409);
    });

    await t.test("login with unknown email returns 401", async () => {
        const res = await api("POST", "/api/auth/login", {
            body: { email: `nobody.${STAMP}@example.com`, password: "Whatever123" },
        });
        assert.equal(res.status, 401);
    });

    await t.test("login with wrong password returns 401", async () => {
        const res = await api("POST", "/api/auth/login", {
            body: { email: USER_A.email, password: "WrongPassword123" },
        });
        assert.equal(res.status, 401);
    });

    await t.test("login with malformed body returns 400", async () => {
        const res = await api("POST", "/api/auth/login", { body: { email: "bad" } });
        assert.equal(res.status, 400);
    });

    await t.test("login returns a JWT containing the user id", async () => {
        const res = await api("POST", "/api/auth/login", { body: USER_A });
        assert.equal(res.status, 200);
        assert.ok(res.body.token, "token must be returned");
        assert.equal(res.body.user.password, undefined);
        state.tokenA = res.body.token;

        const payload = jwt.verify(state.tokenA, SECRET);
        assert.ok(payload.userId, "token payload must include the user id");
        assert.equal(String(payload.userId), String(state.idA));
        assert.ok(payload.exp, "token must carry an expiry");
    });

    await t.test("second user can register and log in", async () => {
        const created = await api("POST", "/api/auth/register", { body: USER_B });
        assert.equal(created.status, 201);
        state.idB = created.body.user.id;

        const login = await api("POST", "/api/auth/login", { body: USER_B });
        assert.equal(login.status, 200);
        state.tokenB = login.body.token;
    });

    /* ---------------- CRUD protection ---------------- */

    await t.test("CRUD endpoints reject requests without a token (401)", async () => {
        for (const [method, path] of [
            ["POST", "/api/projects"],
            ["GET", "/api/projects"],
            ["GET", "/api/projects/000000000000000000000000"],
            ["PUT", "/api/projects/000000000000000000000000"],
            ["DELETE", "/api/projects/000000000000000000000000"],
        ]) {
            const res = await api(method, path, {
                body: method === "GET" ? undefined : { title: "x" },
            });
            assert.equal(res.status, 401, `${method} ${path} must be 401`);
        }
    });

    await t.test("garbage and expired tokens are rejected with 401", async () => {
        const garbage = await api("GET", "/api/projects", { token: "not.a.jwt" });
        assert.equal(garbage.status, 401);

        const expired = jwt.sign({ userId: state.idA }, SECRET, { expiresIn: "-1s" });
        const res = await api("GET", "/api/projects", { token: expired });
        assert.equal(res.status, 401);
        assert.match(res.body.message, /expired/i);
    });

    await t.test("creating a project validates the body (400)", async () => {
        const empty = await api("POST", "/api/projects", {
            token: state.tokenA,
            body: {},
        });
        assert.equal(empty.status, 400);

        const badTech = await api("POST", "/api/projects", {
            token: state.tokenA,
            body: {
                title: "Test Project",
                description: "A perfectly valid description for the test project.",
                technologies: "not-an-array",
            },
        });
        assert.equal(badTech.status, 400);

        const badUrl = await api("POST", "/api/projects", {
            token: state.tokenA,
            body: {
                title: "Test Project",
                description: "A perfectly valid description for the test project.",
                technologies: ["Node.js"],
                liveUrl: "not-a-url",
            },
        });
        assert.equal(badUrl.status, 400);
    });

    await t.test("POST /api/projects creates a project with 201", async () => {
        const res = await api("POST", "/api/projects", {
            token: state.tokenA,
            body: {
                title: "Owner A Project",
                description: "A project owned by user A for the WA-2 test suite.",
                technologies: ["Node.js", "Express", "MongoDB"],
                githubUrl: "https://github.com/example/owner-a",
                liveUrl: "",
                featured: false,
                // Attempt to spoof the owner — must be ignored.
                owner: state.idB,
            },
        });

        assert.equal(res.status, 201);
        assert.equal(res.body.project.title, "Owner A Project");
        // The spoofed owner (USER_B) in the request body must be ignored.
        assert.equal(String(res.body.project.owner), String(state.idA));
        assert.deepEqual(res.body.project.technologies, ["Node.js", "Express", "MongoDB"]);
        assert.ok(res.body.project.createdAt);
        assert.ok(res.body.project.updatedAt);
        state.projectA = res.body.project._id;
    });

    await t.test("featured project is created for sorting checks", async () => {
        const res = await api("POST", "/api/projects", {
            token: state.tokenA,
            body: {
                title: "Featured Project",
                description: "A featured project used to verify public sorting order.",
                technologies: ["React", "Node.js"],
                githubUrl: "https://github.com/example/featured",
                liveUrl: "https://example.com/demo",
                featured: true,
            },
        });
        assert.equal(res.status, 201);
        assert.equal(res.body.project.featured, true);
        state.projectAFeatured = res.body.project._id;
    });

    await t.test("GET /api/projects lists only the caller's projects", async () => {
        const mine = await api("GET", "/api/projects", { token: state.tokenA });
        assert.equal(mine.status, 200);
        assert.equal(mine.body.count, 2);
        assert.ok(
            mine.body.projects.every(
                (p) => String(p.owner) === String(state.idA)
            )
        );

        const theirs = await api("GET", "/api/projects", { token: state.tokenB });
        assert.equal(theirs.status, 200);
        assert.equal(theirs.body.count, 0);
    });

    await t.test("GET /api/projects/:id returns one project (200)", async () => {
        const res = await api("GET", `/api/projects/${state.projectA}`, {
            token: state.tokenA,
        });
        assert.equal(res.status, 200);
        assert.equal(res.body.project._id, state.projectA);
    });

    await t.test("invalid project id returns 400", async () => {
        const res = await api("GET", "/api/projects/not-an-object-id", {
            token: state.tokenA,
        });
        assert.equal(res.status, 400);
    });

    await t.test("missing project returns 404", async () => {
        const res = await api(
            "GET",
            "/api/projects/000000000000000000000000",
            { token: state.tokenA }
        );
        assert.equal(res.status, 404);
    });

    await t.test("another user's project is invisible (404 for read/update/delete)", async () => {
        const read = await api("GET", `/api/projects/${state.projectA}`, {
            token: state.tokenB,
        });
        assert.equal(read.status, 404);

        const update = await api("PUT", `/api/projects/${state.projectA}`, {
            token: state.tokenB,
            body: { title: "Hijacked title attempt" },
        });
        assert.equal(update.status, 404);

        const del = await api("DELETE", `/api/projects/${state.projectA}`, {
            token: state.tokenB,
        });
        assert.equal(del.status, 404);

        // Confirm the project is untouched
        const stillMine = await api("GET", `/api/projects/${state.projectA}`, {
            token: state.tokenA,
        });
        assert.equal(stillMine.status, 200);
        assert.equal(stillMine.body.project.title, "Owner A Project");
    });

    await t.test("PUT /api/projects/:id updates own project (200)", async () => {
        const res = await api("PUT", `/api/projects/${state.projectA}`, {
            token: state.tokenA,
            body: {
                title: "Owner A Project Updated",
                technologies: ["Node.js", "Express", "Mongoose"],
                owner: state.idB, // must be ignored
            },
        });
        assert.equal(res.status, 200);
        assert.equal(res.body.project.title, "Owner A Project Updated");
        assert.deepEqual(res.body.project.technologies, [
            "Node.js",
            "Express",
            "Mongoose",
        ]);
        assert.equal(String(res.body.project.owner), String(state.idA));
    });

    await t.test("PUT with an empty body returns 400", async () => {
        const res = await api("PUT", `/api/projects/${state.projectA}`, {
            token: state.tokenA,
            body: {},
        });
        assert.equal(res.status, 400);
    });

    await t.test("PUT with an invalid URL returns 400", async () => {
        const res = await api("PUT", `/api/projects/${state.projectA}`, {
            token: state.tokenA,
            body: { githubUrl: "definitely not a url" },
        });
        assert.equal(res.status, 400);
    });

    await t.test("DELETE /api/projects/:id removes own project (200)", async () => {
        const res = await api("DELETE", `/api/projects/${state.projectA}`, {
            token: state.tokenA,
        });
        assert.equal(res.status, 200);

        const gone = await api("GET", `/api/projects/${state.projectA}`, {
            token: state.tokenA,
        });
        assert.equal(gone.status, 404);

        const again = await api("DELETE", `/api/projects/${state.projectA}`, {
            token: state.tokenA,
        });
        assert.equal(again.status, 404);
    });

    await t.test("DELETE with an invalid id returns 400", async () => {
        const res = await api("DELETE", "/api/projects/oops", {
            token: state.tokenA,
        });
        assert.equal(res.status, 400);
    });

    /* ---------------- Public endpoint ---------------- */

    await t.test("GET /api/public/projects works without authentication", async () => {
        const res = await api("GET", "/api/public/projects");
        assert.equal(res.status, 200);
        assert.ok(Array.isArray(res.body.projects));
        assert.ok(res.body.count >= 1);

        for (const project of res.body.projects) {
            assert.deepEqual(
                Object.keys(project).sort(),
                ["_id", "createdAt", "description", "featured", "githubUrl", "liveUrl", "technologies", "title"].sort()
            );
            assert.equal(project.owner, undefined);
        }
    });

    await t.test("public projects are sorted with featured first", async () => {
        const res = await api("GET", "/api/public/projects");
        const flags = res.body.projects.map((p) => p.featured);
        const firstFalse = flags.indexOf(false);
        const lastTrue = flags.lastIndexOf(true);
        if (firstFalse !== -1 && lastTrue !== -1) {
            assert.ok(lastTrue < firstFalse, "featured projects must come first");
        }
        assert.equal(res.body.projects[0].featured, true);
    });

    await t.test("public endpoint is read-only (no create/update/delete)", async () => {
        const create = await api("POST", "/api/public/projects", {
            body: { title: "Anonymous spam", description: "Should not be allowed here." },
        });
        assert.equal(create.status, 404);

        const del = await api(
            "DELETE",
            `/api/public/projects/${state.projectAFeatured}`,
            { body: {} }
        );
        assert.equal(del.status, 404);
    });

    await t.test("malformed JSON body returns 400", async () => {
        const res = await fetch(`${BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{ not json",
        });
        assert.equal(res.status, 400);
        const json = await res.json();
        assert.equal(json.success, false);
    });
});
