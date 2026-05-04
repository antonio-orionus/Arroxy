// Reads every `.md` file in ./posts/, parses YAML frontmatter, and returns
// the post list sorted newest-first. Used by both build.mjs (this dir) and
// the parent landing-src/build.mjs (sitemap entries).

import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";

const HERE = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = resolve(HERE, "posts");

export function loadPosts() {
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => {
    const raw = readFileSync(resolve(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    if (!data.slug) throw new Error(`Post ${file} is missing frontmatter "slug"`);
    if (!data.title) throw new Error(`Post ${file} is missing frontmatter "title"`);
    if (!data.datePublished)
      throw new Error(`Post ${file} is missing frontmatter "datePublished"`);
    // YAML auto-parses ISO date strings into Date objects; normalize back to
    // YYYY-MM-DD strings so consumers (sitemap, JSON-LD, listing) can splice
    // them into HTML/XML directly.
    const toISODate = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v);
    return {
      ...data,
      datePublished: toISODate(data.datePublished),
      dateModified: toISODate(data.dateModified || data.datePublished),
      sourceFile: file,
      markdown: content,
    };
  });
  return posts.sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1));
}
