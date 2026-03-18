import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures URL has https:// protocol prefix
 * @param url - URL string that may or may not have protocol
 * @returns URL with https:// prefix, or # if invalid
 */
export function ensureHttps(url: string | undefined | null): string {
  if (!url || url.trim() === "") return "#";

  const trimmed = url.trim();

  // Already has protocol or is a data URL
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  // Add https:// prefix
  return `https://${trimmed}`;
}

/**
 * Safely downloads or opens a base64/data URL file
 * @param dataUrl - The data URL string
 * @param filename - Optional filename
 */
export function downloadBase64File(dataUrl: string, filename = "resume.pdf") {
  try {
    // If it's not a data URL, just open it
    if (!dataUrl.startsWith("data:")) {
      window.open(ensureHttps(dataUrl), "_blank", "noopener,noreferrer");
      return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download file:", error);
    // Fallback: try to open in new tab (will likely be blocked by Chrome but last resort)
    window.open(dataUrl, "_blank");
  }
}
