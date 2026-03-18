# Social Media Preview Setup Guide

## Problem
WhatsApp, Facebook, Twitter, and other social platforms don't execute JavaScript, so client-side React meta tags aren't picked up by their crawlers.

## ✅ Solution Implemented: Server-Side Rendering (SSR)

We've added SSR specifically for campaign URLs to inject Open Graph meta tags server-side.

### How It Works

1. **User shares** `/c/campaignId`
2. **Server intercepts** the request
3. **Fetches campaign** data from database
4. **Injects meta tags** into HTML before sending
5. **Social crawler** reads the meta tags
6. **Beautiful preview** appears!

### Files Added

- `server/ssr.ts` - SSR handler for campaign pages
- Updated `server/routes.ts` - Registered SSR route

### Testing the Preview

#### Option 1: WhatsApp Link Preview Tester
```
https://www.heymeta.com/url/{your-campaign-url}
```

#### Option 2: Facebook Debugger
```
https://developers.facebook.com/tools/debug/
```
Paste your campaign URL and click "Scrape Again"

#### Option 3: Twitter Card Validator
```
https://cards-dev.twitter.com/validator
```

#### Option 4: LinkedIn Post Inspector
```
https://www.linkedin.com/post-inspector/
```

## Alternative Solutions

### Option 2: Static Meta Tags (Fallback)

Add default meta tags to `client/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Default Open Graph tags -->
    <meta property="og:site_name" content="Prodizzy" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Prodizzy - Opportunity Marketplace" />
    <meta property="og:description" content="The networking OS that turns scattered connections into warm intros, meaningful deals, and real outcomes—on autopilot." />
    <meta property="og:image" content="https://yourdomain.com/og-image.png" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Prodizzy - Opportunity Marketplace" />
    <meta name="twitter:description" content="The networking OS that turns scattered connections into warm intros, meaningful deals, and real outcomes—on autopilot." />
    <meta name="twitter:image" content="https://yourdomain.com/og-image.png" />

    <title>Prodizzy</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Option 3: Prerender Service (Advanced)

Use services like:
- **Prerender.io** - $20/month
- **Rendertron** - Self-hosted, free
- **Netlify/Vercel** - Built-in prerendering

### Option 4: Next.js Migration (Future)

Migrate to Next.js for built-in SSR/SSG:
- Automatic meta tag handling
- Better SEO
- Image optimization

## Debugging Tips

### 1. Check if SSR is working

```bash
curl -I https://yourdomain.com/c/CAMPAIGN_ID
```

Look for `Content-Type: text/html` and check the HTML source.

### 2. View actual meta tags

```bash
curl https://yourdomain.com/c/CAMPAIGN_ID | grep "og:title"
```

### 3. Clear social media cache

**WhatsApp:**
- Unfortunately, WhatsApp caches aggressively
- Can take 7+ days to refresh
- No official cache clearing tool

**Facebook:**
- Use Facebook Debugger (link above)
- Click "Scrape Again" to force refresh

**Twitter:**
- Cache clears in ~7 days
- Use Card Validator to test

**LinkedIn:**
- Use Post Inspector
- Cache refreshes when you re-share

## Production Checklist

- [ ] SSR route registered before static file serving
- [ ] Campaign data fetched correctly
- [ ] Meta tags properly escaped (no XSS)
- [ ] OG image URLs are absolute (not relative)
- [ ] OG image is 1200x630px (recommended)
- [ ] Title is under 60 characters
- [ ] Description is under 200 characters
- [ ] Tested with Facebook Debugger
- [ ] Tested with Twitter Card Validator
- [ ] Tested actual share on WhatsApp/LinkedIn

## Creating OG Images

### Recommended Size
1200 x 630 pixels (1.91:1 ratio)

### Options

**1. Design in Figma/Canva**
- Use template: 1200x630px
- Add campaign title
- Add business logo
- Export as PNG/JPG

**2. Dynamic OG Images (Advanced)**
Generate images on-the-fly:
- **Vercel OG** - https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation
- **Cloudinary** - Dynamic image overlays
- **Puppeteer** - Screenshot HTML

**3. Use Existing Logo**
If you have a business logo, use it as fallback:
```typescript
const image = campaign.business?.logo_url || 'https://yourdomain.com/default-og.png'
```

## Common Issues

### Issue: Preview shows default site, not campaign

**Solution:** SSR route might not be registered first
```typescript
// In server/routes.ts - Must be BEFORE other routes
app.get("/c/:id", handleCampaignSSR);
```

### Issue: Preview shows old data

**Solution:** Clear social media cache using debugger tools

### Issue: Image not showing

**Solution:**
- Ensure image URL is absolute (https://...)
- Check image is publicly accessible
- Verify image size (not too large)
- Use correct image format (JPG/PNG, not SVG)

### Issue: Works in browser, not in WhatsApp

**Solution:** Browser executes JavaScript, WhatsApp doesn't
- SSR is required
- Check with curl, not browser
- Test with Facebook Debugger

## Support

If previews still don't work after implementing SSR:

1. Check server logs for SSR errors
2. Verify campaign data is fetched
3. Inspect HTML source (view-source:yourdomain.com/c/ID)
4. Test with multiple debugging tools
5. Wait 24-48 hours for cache to clear

---

**Note:** Social media platforms cache aggressively. After fixing meta tags, it may take 1-7 days for the cache to clear naturally. Use the debugging tools to force refresh during development.
