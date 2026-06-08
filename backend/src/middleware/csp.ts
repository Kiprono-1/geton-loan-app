/**
 * Generate a Content-Security-Policy header from a config object.
 * Helps avoid string-concatenation mistakes.
 */
export function buildCsp(options: {
  isDev?: boolean;
  reportOnly?: boolean;
  extraScriptSrcs?: string[];
  extraConnectSrcs?: string[];
}): string {
  const {
    isDev = false,
    reportOnly = false,
    extraScriptSrcs = [],
    extraConnectSrcs = [],
  } = options;

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      ...(isDev ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
      ...extraScriptSrcs,
    ],
    "style-src": [
      "'self'",
      "'unsafe-inline'", // Required for React inline styles
      "https://fonts.googleapis.com",
    ],
    "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "media-src": ["'self'"],
    "connect-src": [
      "'self'",
      "https://api.paystack.co",
      "https://*.paystack.co",
      "https://api.africastalking.com",
      ...(isDev ? ["ws:", "wss:"] : []),
      ...extraConnectSrcs,
    ],
    "frame-src": ["https://checkout.paystack.com"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
    "block-all-mixed-content": [],
  };

  return Object.entries(directives)
    .map(([key, values]) =>
      values.length > 0 ? `${key} ${values.join(" ")}` : key,
    )
    .join("; ");
}

export const CSP_HEADER_NAME = "Content-Security-Policy";
export const CSP_REPORT_ONLY_NAME = "Content-Security-Policy-Report-Only";
