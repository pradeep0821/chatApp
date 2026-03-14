/**
 * avatarUtils.js
 * 
 * Single source of truth for resolving profile picture URLs.
 * Handles every possible format stored in the DB:
 *   - null / undefined                          → undefined (show initials)
 *   - "/uploads/filename.jpg"                   → prepend backend origin ✅
 *   - "uploads/filename.jpg"                    → prepend backend origin ✅
 *   - "http://localhost:5000/uploads/file.jpg"  → replace host with current backend ✅
 *   - "https://chatapp.onrender.com/uploads/…"  → returned as-is ✅
 *   - Windows backslash paths                   → normalised ✅
 */

const COLORS = ["#10b981", "#0891b2", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6"];

export const getColor = (name) => {
  try { return COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]; }
  catch { return COLORS[0]; }
};

export const getBackendOrigin = () => {
  const raw = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");
  // Strip accidental /api suffix
  return raw.endsWith("/api") ? raw.slice(0, -4) : raw;
};

export const resolveAvatar = (pic) => {
  if (!pic) return undefined;

  // Normalize backslashes (Windows paths from multer on Windows)
  const normalized = pic.replace(/\\/g, "/");

  // Case 1: already an absolute URL
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    // Extract just the path portion (/uploads/filename.jpg)
    // and re-attach to the CURRENT backend origin.
    // This fixes stale localhost:5000 URLs saved before the path fix.
    try {
      const url      = new URL(normalized);
      const pathPart = url.pathname; // e.g. /uploads/filename.jpg
      if (pathPart.startsWith("/uploads/")) {
        return `${getBackendOrigin()}${pathPart}`;
      }
      // If it's some other absolute URL (CDN, Google avatar, etc.), return as-is
      return normalized;
    } catch {
      return normalized;
    }
  }

  // Case 2: relative path — /uploads/... or uploads/...
  const clean = normalized.replace(/^\/+/, ""); // strip leading slashes
  return `${getBackendOrigin()}/${clean}`;
};