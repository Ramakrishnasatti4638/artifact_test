const request = require("supertest");

// Re-require the app fresh for every test file so in-memory viewCounts
// start from their original hardcoded values.
let app;
beforeEach(() => {
  // Clear the require cache so data.js is reset between describe blocks
  jest.resetModules();
  app = require("../src/app");
});

// ─── Pagination ───────────────────────────────────────────────────────────────

describe("GET /api/posts — pagination defaults", () => {
  it("returns 5 posts by default (no query params)", async () => {
    const res = await request(app).get("/api/posts");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
    expect(res.body.total).toBe(20);
    expect(res.body.totalPages).toBe(4);
  });

  it("returns the correct slice for page 2 with default limit", async () => {
    const res = await request(app).get("/api/posts?page=2");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.page).toBe(2);
    // Posts on page 2 should be ids 6–10
    expect(res.body.data[0].id).toBe(6);
    expect(res.body.data[4].id).toBe(10);
  });

  it("last page contains the remaining posts", async () => {
    const res = await request(app).get("/api/posts?page=4");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.data[4].id).toBe(20);
  });
});

describe("GET /api/posts — custom limit", () => {
  it("respects a custom ?limit= value", async () => {
    const res = await request(app).get("/api/posts?limit=3");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.limit).toBe(3);
    expect(res.body.totalPages).toBe(7); // ceil(20/3)
  });

  it("caps limit at 20", async () => {
    const res = await request(app).get("/api/posts?limit=100");
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(20);
    expect(res.body.data).toHaveLength(20);
  });

  it("combines custom page and limit correctly", async () => {
    const res = await request(app).get("/api/posts?page=2&limit=4");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(4);
    // page 2, limit 4 → posts 5–8
    expect(res.body.data[0].id).toBe(5);
  });
});

// ─── Search ───────────────────────────────────────────────────────────────────

describe("GET /api/posts/search — search by title or author", () => {
  it("finds posts by partial title match (case-insensitive)", async () => {
    const res = await request(app).get("/api/posts/search?q=react");
    expect(res.status).toBe(200);
    // Posts 2 and 15 have 'React' in the title
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    res.body.forEach((post) =>
      expect(
        post.title.toLowerCase().includes("react") ||
          post.author.toLowerCase().includes("react")
      ).toBe(true)
    );
  });

  it("finds posts by partial author match (case-insensitive)", async () => {
    const res = await request(app).get("/api/posts/search?q=alice");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3); // Alice Johnson authored posts 1, 5, 14
    res.body.forEach((post) =>
      expect(post.author.toLowerCase()).toContain("alice")
    );
  });

  it("returns an empty array when no posts match", async () => {
    const res = await request(app).get(
      "/api/posts/search?q=zzznomatchzzz"
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all posts when q is omitted", async () => {
    const res = await request(app).get("/api/posts/search");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(20);
  });
});

// ─── Tag filtering ────────────────────────────────────────────────────────────

describe("GET /api/posts/tags/:tag — filter by tag", () => {
  it("returns all posts tagged 'backend'", async () => {
    const res = await request(app).get("/api/posts/tags/backend");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((post) =>
      expect(post.tags.map((t) => t.toLowerCase())).toContain("backend")
    );
  });

  it("returns all posts tagged 'devops'", async () => {
    const res = await request(app).get("/api/posts/tags/devops");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((post) =>
      expect(post.tags.map((t) => t.toLowerCase())).toContain("devops")
    );
  });

  it("is case-insensitive for the tag parameter", async () => {
    const lower = await request(app).get("/api/posts/tags/nodejs");
    const upper = await request(app).get("/api/posts/tags/NODEJS");
    expect(lower.status).toBe(200);
    expect(upper.status).toBe(200);
    expect(lower.body.map((p) => p.id)).toEqual(upper.body.map((p) => p.id));
  });

  it("returns an empty array for a non-existent tag", async () => {
    const res = await request(app).get("/api/posts/tags/nonexistenttag");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ─── View count incrementing ──────────────────────────────────────────────────

describe("GET /api/posts/:id — view count increment", () => {
  it("increments viewCount by 1 on each GET", async () => {
    const first = await request(app).get("/api/posts/1");
    expect(first.status).toBe(200);
    const initialCount = first.body.viewCount;

    const second = await request(app).get("/api/posts/1");
    expect(second.body.viewCount).toBe(initialCount + 1);

    const third = await request(app).get("/api/posts/1");
    expect(third.body.viewCount).toBe(initialCount + 2);
  });

  it("returns 404 for a non-existent post id", async () => {
    const res = await request(app).get("/api/posts/9999");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("returns the correct post fields", async () => {
    const res = await request(app).get("/api/posts/6");
    expect(res.status).toBe(200);
    const post = res.body;
    expect(post).toHaveProperty("id", 6);
    expect(post).toHaveProperty("title");
    expect(post).toHaveProperty("author");
    expect(post).toHaveProperty("content");
    expect(post).toHaveProperty("tags");
    expect(post).toHaveProperty("publishedAt");
    expect(post).toHaveProperty("viewCount");
    expect(Array.isArray(post.tags)).toBe(true);
  });
});
