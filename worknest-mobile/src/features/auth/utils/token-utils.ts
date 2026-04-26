export function sanitizeAuthFlowToken(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return '';
  }

  // Decode once and strip surrounding whitespace and accidental quotes.
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  decoded = decoded.trim();
  return decoded.replace(/^"+|"+$/g, '');
}
