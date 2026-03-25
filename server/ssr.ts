import { Request, Response } from "express";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

export async function handleCampaignSSR(req: Request, res: Response, next: any) {
  const campaignId = req.params.id as string;

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
    const businessName = campaign.business?.business_name || "Prodizzy";
    const host = req.get("host") || "prodizzy.com";
    
    // Safety check for protocol (header can be an array in some cases)
    const protoHeader = req.headers["x-forwarded-proto"];
    const protocol = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || req.protocol || "https";
    const baseUrl = `${protocol}://${host}`;
    
    const url = `${baseUrl}/c/${campaignId}`;
    
    // Ensure absolute image URL
    let image = campaign.business?.logo_url || `${baseUrl}/logo.png`;
    if (image && typeof image === 'string' && image.startsWith('/')) {
      image = `${baseUrl}${image}`;
    }

    // Build comprehensive details for description
    const descText = campaign.description || "";
    let detailedDescription = descText.slice(0, 160);
    if (campaign.engagementType) {
      detailedDescription = `${campaign.engagementType} • ${detailedDescription}`;
    }
    if (campaign.budget) {
      detailedDescription = `${campaign.budget} • ${detailedDescription}`;
    }

    // Remove ALL existing OG and Twitter meta tags and title to avoid duplicates
    html = html.replace(/<title>[^<]*<\/title>/gi, '');
    html = html.replace(/<meta[^>]*name=["']description["'][^>]*>/gi, '');
    html = html.replace(/<meta[^>]*property=["']og:[^"']*["'][^>]*>/gi, '');
    html = html.replace(/<meta[^>]*name=["']twitter:[^"']*["'][^>]*>/gi, '');

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

    // Inject immediately after <head> tag using regex to be more robust
    // Handles <head>, <HEAD>, and <head with="attributes">
    html = html.replace(/<head\b[^>]*>/i, `$& \n${metaTags}`);

    console.log(`[SSR] Successfully injected meta tags for campaign ${campaignId}, sending HTML`);

    // Send the modified HTML
    res.status(200).set({ 
      "Content-Type": "text/html",
      "Cache-Control": "public, max-age=3600" // Cache for 1 hour
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
