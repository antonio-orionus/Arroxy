// Build the blog from posts/*.md.
//
//   docs/blog/index.html              — listing page
//   docs/blog/<slug>/index.html       — one per post
//
// Usage: `node landing-src/blog/build.mjs` (or `bun run build:blog`).

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { marked } from "marked";

import { applyStrings, applyMacros, escapeHtml, safeJson } from "../lib/render.mjs";
import { loadPosts } from "./loadPosts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DOCS = resolve(ROOT, "docs");
const BLOG_DIR = resolve(DOCS, "blog");
const POST_TEMPLATE_PATH = resolve(HERE, "template-post.html");
const INDEX_TEMPLATE_PATH = resolve(HERE, "template-index.html");

const SITE_URL = "https://arroxy.orionus.dev/";

// GFM tables are on by default; explicitly enable for clarity. `gfm: true`
// also gives us autolinks + strikethrough. We pass markdown HTML through to
// marked unchanged so the inline <table class="matrix-scroll"> in the post
// renders verbatim.
marked.setOptions({ gfm: true, breaks: false });

function humanDate(iso) {
  // "2026-05-04" -> "May 4, 2026". Avoid Date() locale drift by parsing parts.
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

function buildPostJsonLd(post, canonical) {
  return safeJson({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.ogImage,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: {
      "@type": "Person",
      name: post.author,
      url: "https://x.com/OrionusAI",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    inLanguage: "en",
  });
}

async function renderPost(post, postTemplate) {
  const canonical = `${SITE_URL}blog/${post.slug}/`;
  const bodyHtml = marked.parse(post.markdown);

  // applyStrings handles all `_html` keys (raw) and other keys (escaped).
  let html = applyStrings(postTemplate, {
    title: post.title,
    description: post.description,
    author: post.author,
    datePublished: post.datePublished,
    datePublishedHuman: humanDate(post.datePublished),
    dateModified: post.dateModified,
    ogImage: post.ogImage,
    body_html: bodyHtml,
  });
  html = applyMacros(html, {
    CANONICAL: canonical,
    JSON_LD: buildPostJsonLd(post, canonical),
  });

  const outDir = resolve(BLOG_DIR, post.slug);
  const outPath = resolve(outDir, "index.html");
  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, html, "utf8");
  console.log(`  ✓ blog/${post.slug}/index.html`);
}

function postCard(post) {
  const url = `/blog/${post.slug}/`;
  return `<a class="post-card" href="${escapeHtml(url)}">
          <div class="post-card-meta">${escapeHtml(humanDate(post.datePublished))}</div>
          <h2>${escapeHtml(post.title)}</h2>
          <p>${escapeHtml(post.description)}</p>
          <span class="read-more">Read →</span>
        </a>`;
}

async function renderIndex(posts, indexTemplate) {
  const html = applyMacros(indexTemplate, {
    POSTS_HTML: posts.map(postCard).join("\n"),
  });
  await mkdir(BLOG_DIR, { recursive: true });
  await writeFile(resolve(BLOG_DIR, "index.html"), html, "utf8");
  console.log(`  ✓ blog/index.html`);
}

async function main() {
  const posts = loadPosts();
  if (posts.length === 0) {
    console.warn("No posts found in landing-src/blog/posts/.");
    return;
  }
  const [postTemplate, indexTemplate] = await Promise.all([
    readFile(POST_TEMPLATE_PATH, "utf8"),
    readFile(INDEX_TEMPLATE_PATH, "utf8"),
  ]);

  await renderIndex(posts, indexTemplate);
  for (const post of posts) {
    await renderPost(post, postTemplate);
  }

  console.log(`\nBuilt ${posts.length} post${posts.length === 1 ? "" : "s"} + listing.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
