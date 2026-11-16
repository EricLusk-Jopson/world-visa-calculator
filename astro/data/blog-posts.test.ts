import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import { BLOG_POSTS, BLOG_TOPICS, formatPostDate } from "./blog-posts";

const BLOG_DIR = path.resolve(__dirname, "../pages/blog");
const pageSlugs = readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith(".astro") && f !== "index.astro")
  .map((f) => f.replace(/\.astro$/, ""));

describe("blog post catalogue", () => {
  it("lists every post page, and only real pages", () => {
    expect(BLOG_POSTS.map((p) => p.slug).sort()).toEqual([...pageSlugs].sort());
  });

  it("has no duplicate slugs", () => {
    const slugs = BLOG_POSTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("puts every post in a known topic, and every topic has posts", () => {
    const topicIds = BLOG_TOPICS.map((t) => t.id);
    for (const post of BLOG_POSTS) expect(topicIds).toContain(post.topic);
    for (const id of topicIds) {
      expect(BLOG_POSTS.some((p) => p.topic === id), id).toBe(true);
    }
  });

  it("features two or three posts", () => {
    const featured = BLOG_POSTS.filter((p) => p.featured).length;
    expect(featured).toBeGreaterThanOrEqual(2);
    expect(featured).toBeLessThanOrEqual(3);
  });

  it.each(BLOG_POSTS)("$slug: date and read time match the post page", (post) => {
    const page = readFileSync(path.join(BLOG_DIR, `${post.slug}.astro`), "utf8");
    const meta = page.match(/class="article__meta">([^<]+)</)?.[1].trim();
    expect(meta).toBe(`${formatPostDate(post.date)} · ${post.readMinutes} min read`);
  });
});
