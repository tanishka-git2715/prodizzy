import { Request, Response } from "express";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

export async function handleCampaignSSR(req: Request, res: Response, next: any) {
  const campaignId = req.params.id;

  try {
    // Get campaign data
    const campaign = await storage.getCampaignById(campaignId);

    if (!campaign || campaign.status !== "active") {
      // Campaign not found, let normal routing handle it
      return next();
    }

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

    // Inject meta tags
    const metaTags = `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${image}">
    <meta property="og:site_name" content="Prodizzy">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${escapeHtml(title)}">
    <meta property="twitter:description" content="${escapeHtml(description)}">
    <meta property="twitter:image" content="${image}">

    <!-- WhatsApp (uses Open Graph) -->
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- SEO -->
    <title>${escapeHtml(title)} | Prodizzy</title>
    <meta name="description" content="${escapeHtml(description)}">
    `;

    // Replace the <head> section
    html = html.replace("</head>", `${metaTags}</head>`);

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
