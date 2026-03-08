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

  // Already has protocol
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Add https:// prefix
  return `https://${trimmed}`;
}
