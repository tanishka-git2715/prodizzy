import { Request, Response } from "express";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function handleCampaignSSR(req: Request, res: Response, next: any) {
  const campaignId = req.params.id as string;

  console.log(`[SSR] Handling campaign: ${campaignId}`);

  try {
    // Get campaign data
    const campaign = await storage.getCampaignById(campaignId);

    if (!campaign || campaign.status === "draft") {
      console.log(`[SSR] Campaign not found or in draft status: ${campaignId}`);
      return next();
    }

    console.log(`[SSR] Campaign found: ${campaign.title}`);

    // Determine index.html path based on environment
    const isDev = process.env.NODE_ENV !== "production";
    const possiblePaths = isDev
      ? [path.join(process.cwd(), "client/index.html")]
      : [
          path.join(process.cwd(), "dist/public/index.html"),
          path.join(process.cwd(), "public/index.html"),
          path.join(process.cwd(), "index.html"),
          // Common Vercel/Serverless paths
          path.join(__dirname, "../client/index.html"),
          path.join(__dirname, "../../client/index.html"),
          "/var/task/client/index.html",
          "/var/task/dist/public/index.html"
        ];
    
    let indexPath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        indexPath = p;
        break;
      }
    }

    if (!indexPath) {
      console.error("[SSR] index.html not found in any of the possible paths:", possiblePaths);
      return next();
    }

    let html = fs.readFileSync(indexPath, "utf-8");

    // Prepare meta tags
    const title = campaign.title;
    const businessName = campaign.business?.business_name || campaign.individual_profile?.full_name || "Prodizzy";
    const host = req.get("host") || "prodizzy.com";
    
    // Safety check for protocol (header can be an array in some cases)
    const protoHeader = req.headers["x-forwarded-proto"];
    const protocol = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || req.protocol || "https";
    const baseUrl = `${protocol}://${host}`;
    
    const url = `${baseUrl}/c/${campaignId}`;
    
    // Ensure absolute image URL
    let image = campaign.business?.logo_url || campaign.individual_profile?.profile_photo || `${baseUrl}/logo.png`;
    if (image && typeof image === 'string' && image.startsWith('/')) {
      image = `${baseUrl}${image}`;
    }

    // Build comprehensive details for description as requested by user
    // Format: "Check out this opportunity:\n[Campaign Title]\n[Description]\nApply now : [Link]"
    const cleanDesc = (campaign.description || "").replace(/<[^>]*>/g, '').slice(0, 300); // Strip HTML and limit
    const detailedDescription = `Check out this opportunity:
${campaign.title}

${cleanDesc}

Apply now : ${url}`;

    // Remove ALL existing OG and Twitter meta tags and title to avoid duplicates
    // Using more comprehensive regex to catch various attribute orders and quoting styles
    html = html.replace(/<title>[^<]*<\/title>/gi, '');
    html = html.replace(/<meta[^>]*name=["']description["'][^>]*>/gi, '');
    html = html.replace(/<meta[^>]*property=["']og:[^"']*["'][^>]*>/gi, '');
    html = html.replace(/<meta[^>]*name=["']twitter:[^"']*["'][^>]*>/gi, '');

    console.log(`[SSR] Injecting meta tags for: ${title}`);

    // Inject NEW meta tags
    const metaTags = `
    <!-- Campaign SSR Metadata -->
    <title>${escapeHtml(title)} | ${escapeHtml(businessName)}</title>
    <meta name="description" content="${escapeHtml(detailedDescription)}">

    <!-- Open Graph / Facebook / WhatsApp / LinkedIn -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(detailedDescription)}">
    <meta property="og:image" content="${image}">
    <meta property="og:site_name" content="Prodizzy">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(detailedDescription)}">
    <meta name="twitter:image" content="${image}">
    `;

    // Add OG prefix to html tag if not present (LinkedIn likes this)
    if (!html.includes('prefix="og: http://ogp.me/ns#"')) {
      html = html.replace(/<html([^>]*)>/i, '<html$1 prefix="og: http://ogp.me/ns#">');
    }

    // Inject immediately after <head> tag using regex to be more robust
    // Handles <head>, <HEAD>, and <head with="attributes">
    html = html.replace(/<head\b[^>]*>/i, `$& \n${metaTags}`);

    console.log(`[SSR] Successfully injected meta tags for campaign ${campaignId}, sending HTML`);

    // Send the modified HTML
    res.status(200).set({ 
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }).send(html);
  } catch (error) {
    console.error("SSR Error:", error);
    next();
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
