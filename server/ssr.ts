import { Request, Response } from "express";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

export async function handleCampaignSSR(req: Request, res: Response, next: any) {
  const campaignId = req.params.id;

  console.log(`[SSR] Handling campaign: ${campaignId}`);

  try {
    // Get campaign data
    const campaign = await storage.getCampaignById(campaignId);

    if (!campaign || campaign.status !== "active") {
      console.log(`[SSR] Campaign not found or not active: ${campaignId}`);
      return next();
    }

    console.log(`[SSR] Campaign found: ${campaign.title}`);

    // Determine index.html path based on environment
    const isDev = process.env.NODE_ENV !== "production";
    const indexPath = isDev
      ? path.join(process.cwd(), "client/index.html")
      : path.join(process.cwd(), "dist/public/index.html");

    // Check if file exists
    if (!fs.existsSync(indexPath)) {
      console.error("Index.html not found at:", indexPath);
      return next();
    }

    let html = fs.readFileSync(indexPath, "utf-8");

    // Prepare meta tags
    const title = campaign.title;
    const description = campaign.description.slice(0, 200);
    const url = `${req.protocol}://${req.get("host")}/c/${campaignId}`;
    const image = campaign.business?.logo_url || `${req.protocol}://${req.get("host")}/logo.png`;
    const businessName = campaign.business?.business_name || "Prodizzy";

    // Build comprehensive details for description
    let detailedDescription = campaign.description.slice(0, 160);
    if (campaign.engagementType) {
      detailedDescription = `${campaign.engagementType} • ${detailedDescription}`;
    }
    if (campaign.budget) {
      detailedDescription = `${campaign.budget} • ${detailedDescription}`;
    }

    // Remove ALL existing OG and Twitter meta tags
    html = html.replace(/<meta[^>]*property="og:[^"]*"[^>]*>\s*/gi, '');
    html = html.replace(/<meta[^>]*name="twitter:[^"]*"[^>]*>\s*/gi, '');
    html = html.replace(/<meta[^>]*name="description"[^>]*>\s*/gi, '');
    html = html.replace(/<title>[^<]*<\/title>\s*/gi, '');

    console.log(`[SSR] Injecting meta tags for: ${title}`);

    // Inject NEW meta tags
    const metaTags = `
    <title>${escapeHtml(title)} | ${escapeHtml(businessName)}</title>
    <meta name="description" content="${escapeHtml(detailedDescription)}">

    <!-- Open Graph / Facebook / WhatsApp -->
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

    // Inject at the END of <head> to override any defaults
    html = html.replace("</head>", `${metaTags}\n</head>`);

    console.log(`[SSR] Successfully injected meta tags, sending HTML`);

    // Send the modified HTML
    res.status(200).set({ "Content-Type": "text/html" }).send(html);
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
