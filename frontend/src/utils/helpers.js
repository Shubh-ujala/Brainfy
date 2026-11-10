/**
 * Safely extracts an array of items from any API response shape.
 */
export const extractList = (response, key = 'links') => {
  if (!response) return [];
  const body = response.data !== undefined ? response.data : response;
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body[key])) return body[key];
  if (body && body.data) {
    if (Array.isArray(body.data)) return body.data;
    if (Array.isArray(body.data[key])) return body.data[key];
  }
  return [];
};

/**
 * Extract a readable error message from an Axios error or any Error.
 */
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error)   return error.response.data.error;
  if (error?.message)                  return error.message;
  return 'Something went wrong. Please try again.';
};

/**
 * Format a date string to a human-readable format.
 */
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '';
  const defaults = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', { ...defaults, ...options });
};

/**
 * Format a date to relative time (e.g. "2 hours ago").
 */
export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now  = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60)         return 'just now';
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000)    return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000)   return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
};

/**
 * Extract the hostname from a URL for display.
 */
export const extractDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
};

/**
 * Get the favicon URL for a given link URL.
 */
export const getFaviconUrl = (url) => {
  try {
    const { origin } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=64`;
  } catch {
    return null;
  }
};

/**
 * Detect the platform from a URL.
 */
export const detectPlatform = (url = '') => {
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'YouTube';
  if (lower.includes('twitter.com') || lower.includes('x.com'))    return 'Twitter/X';
  if (lower.includes('github.com'))                                 return 'GitHub';
  if (lower.includes('linkedin.com'))                               return 'LinkedIn';
  if (lower.includes('medium.com'))                                 return 'Medium';
  return 'Website';
};

/**
 * Truncate text with an ellipsis.
 */
export const truncate = (text = '', maxLen = 80) =>
  text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;

/**
 * Debounce utility.
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Persist data to localStorage safely.
 */
export const storage = {
  get: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove: (key) => {
    try { localStorage.removeItem(key); } catch {}
  },
};

