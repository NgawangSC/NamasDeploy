#!/usr/bin/env node

/*
Scraper: Extract JSON-LD (and minimal metadata) from a site into data/ files for committing.
- Inputs via env vars or CLI:
  - SITE_URL (required unless START_URLS provided)
  - START_URLS (comma-separated URLs)
  - OUTPUT_DIR (default: data)
  - MAX_PAGES (default: 1000)
  - CONCURRENCY (default: 6)
  - INCLUDE_PATH_PREFIX (comma-separated path prefixes to include, e.g. /projects,/clients)
  - EXCLUDE_PATH_PREFIX (comma-separated path prefixes to exclude)
*/

const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const https = require("https");
const http = require("http");

// --- Config ---
const env = process.env;
const OUTPUT_DIR = env.OUTPUT_DIR || path.join(process.cwd(), "data");
const RAW_DIR = path.join(OUTPUT_DIR, "raw");
const MAX_PAGES = Number(env.MAX_PAGES || 1000);
const CONCURRENCY = Math.max(1, Number(env.CONCURRENCY || 6));
const INCLUDE_PATH_PREFIX = (env.INCLUDE_PATH_PREFIX || "").split(",").map(s => s.trim()).filter(Boolean);
const EXCLUDE_PATH_PREFIX = (env.EXCLUDE_PATH_PREFIX || "").split(",").map(s => s.trim()).filter(Boolean);

const CLI_ARGS = process.argv.slice(2);
const hasFlag = (name) => CLI_ARGS.includes(name);
const getArgValue = (name, fallback = undefined) => {
  const idx = CLI_ARGS.indexOf(name);
  if (idx === -1) return fallback;
  return CLI_ARGS[idx + 1];
};

if (hasFlag("--help") || hasFlag("-h")) {
  printHelpAndExit();
}

const SITE_URL = env.SITE_URL || getArgValue("--site");
const START_URLS = (env.START_URLS || getArgValue("--urls", "")).split(",").map(s => s.trim()).filter(Boolean);

if (!SITE_URL && START_URLS.length === 0) {
  console.error("[scrape] Missing SITE_URL or START_URLS. Pass SITE_URL env or --site, or START_URLS env or --urls.");
  printHelpAndExit(1);
}

// --- Helpers ---
function printHelpAndExit(code = 0) {
  const msg = `Usage:
  SITE_URL="https://example.com" npm run scrape
  START_URLS="https://example.com/a,https://example.com/b" npm run scrape

Optional env vars:
  OUTPUT_DIR=data
  MAX_PAGES=1000
  CONCURRENCY=6
  INCLUDE_PATH_PREFIX="/projects,/clients"
  EXCLUDE_PATH_PREFIX="/wp-admin,/tags"

CLI flags:
  --site https://example.com
  --urls https://example.com/a,https://example.com/b
  --help|-h
`;
  console.log(msg);
  process.exit(code);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https:");
    const mod = isHttps ? https : http;
    const req = mod.get(url, { headers: { "User-Agent": "DataExtractor/1.0" } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).toString();
        res.resume();
        return resolve(fetchText(redirectUrl));
      }
      if ((res.statusCode || 0) >= 400) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = "";
      res.setEncoding("utf8");
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(30000, () => { req.destroy(new Error("Timeout")); });
  });
}

function extractJsonLdFromHtml(html) {
  const results = [];
  const regex = /<script[^>]+type\s*=\s*"application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) results.push(item);
      } else {
        results.push(parsed);
      }
    } catch (_) {
      // ignore malformed JSON-LD blocks
    }
  }
  return flattenGraph(results);
}

function flattenGraph(items) {
  const flat = [];
  for (const item of items) {
    if (!item) continue;
    if (item['@graph'] && Array.isArray(item['@graph'])) {
      for (const g of item['@graph']) flat.push(g);
    } else {
      flat.push(item);
    }
  }
  return flat;
}

function parseSitemapXml(xml, baseUrl) {
  const urls = new Set();
  const locRegex = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    try {
      const absolute = new URL(match[1].trim(), baseUrl).toString();
      urls.add(absolute);
    } catch (_) {
      // skip invalid
    }
  }
  return Array.from(urls);
}

function isSameOrigin(urlA, urlB) {
  try {
    const a = new URL(urlA);
    const b = new URL(urlB);
    return a.origin === b.origin;
  } catch (_) {
    return false;
  }
}

function shouldIncludePath(pathname) {
  if (EXCLUDE_PATH_PREFIX.length > 0) {
    for (const p of EXCLUDE_PATH_PREFIX) {
      if (pathname.startsWith(p)) return false;
    }
  }
  if (INCLUDE_PATH_PREFIX.length === 0) return true;
  for (const p of INCLUDE_PATH_PREFIX) {
    if (pathname.startsWith(p)) return true;
  }
  return false;
}

function normalizeByType(objects) {
  const buckets = {
    Project: [],
    Organization: [],
    Person: [],
    CreativeWork: [],
    Other: []
  };
  for (const obj of objects) {
    const type = Array.isArray(obj["@type"]) ? obj["@type"][0] : obj["@type"];
    const normalized = basicNormalize(obj);
    switch (type) {
      case "Project": buckets.Project.push(normalized); break;
      case "Organization": buckets.Organization.push(normalized); break;
      case "Person": buckets.Person.push(normalized); break;
      case "CreativeWork": buckets.CreativeWork.push(normalized); break;
      default: buckets.Other.push({
        type: type || "Unknown",
        name: getString(obj.name),
        description: getString(obj.description),
        url: getUrl(obj.url),
        raw: obj
      });
    }
  }
  return buckets;
}

function getString(v) { return typeof v === "string" ? v : (v && v["@value"]) || undefined; }
function getUrl(v) {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && typeof v["@id"] === "string") return v["@id"];
  return undefined;
}

function asArray(v) { return Array.isArray(v) ? v : (v ? [v] : []); }

function basicNormalize(obj) {
  const images = [];
  for (const img of asArray(obj.image)) {
    if (typeof img === "string") images.push(img);
    else if (img && typeof img === "object") {
      if (typeof img.url === "string") images.push(img.url);
      else if (typeof img.contentUrl === "string") images.push(img.contentUrl);
    }
  }
  const keywords = new Set();
  for (const kw of asArray(obj.keywords)) {
    if (typeof kw === "string") kw.split(",").map(s => s.trim()).filter(Boolean).forEach(k => keywords.add(k));
  }
  return {
    type: Array.isArray(obj["@type"]) ? obj["@type"].join(",") : obj["@type"],
    name: getString(obj.name),
    description: getString(obj.description),
    url: getUrl(obj.url),
    dateCreated: obj.dateCreated,
    datePublished: obj.datePublished,
    dateModified: obj.dateModified,
    client: obj.client || obj.publisher || undefined,
    keywords: Array.from(keywords),
    images,
    raw: obj
  };
}

async function discoverStartUrls(siteUrl) {
  const urls = new Set();
  // Try sitemap
  try {
    const robotsUrl = new URL("/robots.txt", siteUrl).toString();
    const robots = await fetchText(robotsUrl).catch(() => "");
    const sitemapLines = robots.split(/\r?\n/).filter(l => /sitemap:/i.test(l));
    const sitemapUrls = sitemapLines.map(l => l.split(":")[1]).map(s => s && s.trim()).filter(Boolean);
    if (sitemapUrls.length > 0) {
      for (const sm of sitemapUrls) {
        try {
          const xml = await fetchText(sm);
          for (const u of parseSitemapXml(xml, siteUrl)) urls.add(u);
        } catch (_) { /* ignore */ }
      }
    } else {
      // Fall back to default sitemap.xml
      try {
        const xml = await fetchText(new URL("/sitemap.xml", siteUrl).toString());
        for (const u of parseSitemapXml(xml, siteUrl)) urls.add(u);
      } catch (_) { /* ignore */ }
    }
  } catch (_) { /* ignore */ }

  // Always include homepage
  try { urls.add(new URL(siteUrl).toString()); } catch (_) {}

  return Array.from(urls);
}

async function run() {
  ensureDir(OUTPUT_DIR);
  ensureDir(RAW_DIR);

  const startList = START_URLS.length ? START_URLS : await discoverStartUrls(SITE_URL);
  const domain = new URL(START_URLS.length ? START_URLS[0] : SITE_URL).origin;

  const toVisit = [];
  for (const u of startList) {
    try {
      const urlObj = new URL(u);
      if (urlObj.origin !== domain) continue;
      if (!shouldIncludePath(urlObj.pathname)) continue;
      toVisit.push(urlObj.toString());
    } catch(_) { /* ignore */ }
  }

  const visited = new Set();
  const results = [];

  async function worker() {
    while (true) {
      const next = toVisit.shift();
      if (!next) return;
      if (visited.has(next)) continue;
      visited.add(next);
      try {
        const html = await fetchText(next);
        const ld = extractJsonLdFromHtml(html);
        if (ld.length > 0) {
          for (const obj of ld) {
            results.push({ url: next, object: obj });
          }
        }
        // lightweight link discovery within same domain (optional; limited)
        if (visited.size < MAX_PAGES) {
          for (const link of extractLinks(html, next)) {
            try {
              const u = new URL(link, next);
              if (!isSameOrigin(u.toString(), domain)) continue;
              if (!shouldIncludePath(u.pathname)) continue;
              if (!visited.has(u.toString())) toVisit.push(u.toString());
            } catch(_) {}
          }
        }
      } catch (err) {
        // ignore fetch errors; keep going
      }
      // politeness
      await sleep(100);
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  // Write raw NDJSON
  const ndjsonPath = path.join(RAW_DIR, "jsonld.ndjson");
  const ndjsonStream = fs.createWriteStream(ndjsonPath);
  for (const r of results) {
    ndjsonStream.write(JSON.stringify(r) + "\n");
  }
  ndjsonStream.end();

  // Normalize and write grouped JSON
  const objects = results.map(r => r.object);
  const groups = normalizeByType(objects);

  fs.writeFileSync(path.join(OUTPUT_DIR, "projects.json"), JSON.stringify(groups.Project, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, "clients.json"), JSON.stringify(groups.Organization, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, "people.json"), JSON.stringify(groups.Person, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, "creative_works.json"), JSON.stringify(groups.CreativeWork, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, "other.json"), JSON.stringify(groups.Other, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, "urls.json"), JSON.stringify(Array.from(visited), null, 2));

  console.log(`[scrape] Done. Wrote:\n- ${ndjsonPath}\n- ${path.join(OUTPUT_DIR, "projects.json")}\n- ${path.join(OUTPUT_DIR, "clients.json")}\n- ${path.join(OUTPUT_DIR, "people.json")}\n- ${path.join(OUTPUT_DIR, "creative_works.json")}\n- ${path.join(OUTPUT_DIR, "other.json")}\n- ${path.join(OUTPUT_DIR, "urls.json")}`);
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  const aTagRegex = /<a\s+[^>]*href\s*=\s*(["'])(.*?)\1/gi;
  let match;
  while ((match = aTagRegex.exec(html)) !== null) {
    const href = match[2];
    if (!href) continue;
    try {
      const u = new URL(href, baseUrl);
      if (["http:", "https:"].includes(u.protocol)) {
        links.add(u.toString());
      }
    } catch (_) { /* ignore invalid */ }
  }
  return Array.from(links);
}

run().catch(err => {
  console.error("[scrape] Fatal:", err);
  process.exit(1);
});