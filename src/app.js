const express = require("express");
const posts = require("./data");

const app = express();
app.use(express.json());

// ─── GET /api/posts ────────────────────────────────────────────────────────────
// Paginated list: ?page= (default 1), ?limit= (default 5, max 20)
app.get("/api/posts", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 5));
  const total = posts.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = posts.slice(start, start + limit);

  res.json({ data, total, page, limit, totalPages });
});

// ─── GET /api/posts/search?q= ──────────────────────────────────────────────────
// Must be declared BEFORE /api/posts/:id so "search" is not treated as an id.
app.get("/api/posts/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  if (!q) {
    return res.json(posts);
  }

  const results = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q)
  );
  res.json(results);
});

// ─── GET /api/posts/tags/:tag ──────────────────────────────────────────────────
// Must be declared BEFORE /api/posts/:id so "tags" is not treated as an id.
app.get("/api/posts/tags/:tag", (req, res) => {
  const tag = req.params.tag.toLowerCase();
  const results = posts.filter((p) =>
    p.tags.map((t) => t.toLowerCase()).includes(tag)
  );
  res.json(results);
});

// ─── GET /api/posts/:id ────────────────────────────────────────────────────────
// Returns a single post and increments its viewCount.
app.get("/api/posts/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  post.viewCount += 1;
  res.json(post);
});

module.exports = app;
