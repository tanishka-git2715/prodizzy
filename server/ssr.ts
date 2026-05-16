import { Request, Response } from "express";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

// In CJS bundles (Vercel), __dirname is already a global. In ESM, derive it from import.meta.url.
const _dirname: string = typeof __dirname !== "undefined"
  ? __dirname
  : (() => { const { fileURLToPath } = require("url"); return path.dirname(fileURLToPath(import.meta.url)); })();

// Cache the HTML so we only hit the filesystem/CDN once per Lambda instance
let cachedHtml = "";

function findHtmlOnFs(): string {
  const isDev = process.env.NODE_ENV !== "production";
  const candidates = isDev
    ? [path.join(process.cwd(), "client/index.html")]
    : [
        path.join(_dirname, "index.html"),          // api/index.html — copied by build:vercel
        "/var/task/api/index.html",
        path.join(process.cwd(), "dist/public/index.html"),
        path.join(process.cwd(), "public/index.html"),
        path.join(process.cwd(), "index.html"),
        "/var/task/dist/public/index.html"
      ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log(`[SSR] Found index.html at: ${p}`);
      return p;
    }
  }
  return "";
}

async function getHtml(req: Request): Promise<string> {
  if (cachedHtml) return cachedHtml;

  // 1. Try the local filesystem first (works in dev and some Vercel configs)
  const fsPath = findHtmlOnFs();
  if (fsPath) {
    cachedHtml = fs.readFileSync(fsPath, "utf-8");
    return cachedHtml;
  }

  // 2. Fetch from Vercel's CDN — static outputDirectory files are served by CDN,
  //    not by the Lambda, so we pull the SPA shell from there and cache it.
  try {
    const protoHeader = req.headers["x-forwarded-proto"];
    const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || "https";
    const host = req.get("host") || "prodizzy.com";
    const cdnUrl = `${proto}://${host}/`;
    console.log(`[SSR] Fetching index.html from CDN: ${cdnUrl}`);
    const resp = await fetch(cdnUrl);
    if (resp.ok) {
      cachedHtml = await resp.text();
      console.log(`[SSR] Cached index.html from CDN (${cachedHtml.length} bytes)`);
      return cachedHtml;
    }
    console.error(`[SSR] CDN returned ${resp.status}`);
  } catch (e) {
    console.error("[SSR] CDN fetch failed:", e);
  }

  return "";
}

export async function handleCampaignSSR(req: Request, res: Response, next: any) {
  const campaignId = req.params.id as string;
  console.log(`[SSR] Handling campaign: ${campaignId}`);

  try {
    const [html, campaign] = await Promise.all([
      getHtml(req),
      storage.getCampaignById(campaignId),
    ]);

    if (!html) {
      console.error("[SSR] Could not get index.html — redirecting to root");
      return res.redirect(302, "/");
    }

    if (!campaign || campaign.status === "draft") {
      console.log(`[SSR] Campaign not found or draft: ${campaignId} — serving SPA`);
      return res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).send(html);
    }

    console.log(`[SSR] Injecting meta tags for: ${campaign.title}`);

    const title = campaign.title;
    const businessName = campaign.business?.business_name || campaign.individual_profile?.full_name || "Prodizzy";
    const protoHeader = req.headers["x-forwarded-proto"];
    const protocol = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || req.protocol || "https";
    const host = req.get("host") || "prodizzy.com";
    const baseUrl = `${protocol}://${host}`;
    const url = `${baseUrl}/c/${campaignId}`;

    let image = campaign.business?.logo_url || campaign.individual_profile?.profile_photo || `${baseUrl}/logo.png`;
    if (image && typeof image === "string" && image.startsWith("/")) {
      image = `${baseUrl}${image}`;
    }

    const cleanDesc = (campaign.description || "").replace(/<[^>]*>/g, "").slice(0, 300);
    const detailedDescription = `Check out this opportunity:\n${campaign.title}\n\n${cleanDesc}\n\nApply now : ${url}`;

    let out = html
      .replace(/<title>[^<]*<\/title>/gi, "")
      .replace(/<meta[^>]*name=["']description["'][^>]*>/gi, "")
      .replace(/<meta[^>]*property=["']og:[^"']*["'][^>]*>/gi, "")
      .replace(/<meta[^>]*name=["']twitter:[^"']*["'][^>]*>/gi, "");

    const metaTags = `
    <!-- Campaign SSR Metadata -->
    <title>${escapeHtml(title)} | ${escapeHtml(businessName)}</title>
    <meta name="description" content="${escapeHtml(detailedDescription)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(detailedDescription)}">
    <meta property="og:image" content="${image}">
    <meta property="og:site_name" content="Prodizzy">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(detailedDescription)}">
    <meta name="twitter:image" content="${image}">`;

    if (!out.includes('prefix="og: http://ogp.me/ns#"')) {
      out = out.replace(/<html([^>]*)>/i, '<html$1 prefix="og: http://ogp.me/ns#">');
    }
    out = out.replace(/<head\b[^>]*>/i, `$&\n${metaTags}`);

    console.log(`[SSR] Sending SSR HTML for campaign ${campaignId}`);
    res.status(200).set({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }).send(out);
  } catch (error) {
    console.error("SSR Error:", error);
    next();
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
