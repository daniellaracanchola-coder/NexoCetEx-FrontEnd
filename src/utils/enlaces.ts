const URL_PATTERN =
  /((?:https?:\/\/|www\.)[^\s<]+[^\s<.,;:!?\])"'»])/gi;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizarHref(url: string): string | null {
  const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  try {
    const parsed = new URL(href);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Convierte URLs en texto plano a enlaces HTML seguros (http/https).
 */
export function linkifyText(text: string): string {
  if (!text) return '';

  const escaped = escapeHtml(text);

  return escaped.replace(URL_PATTERN, (match) => {
    const href = normalizarHref(match);
    if (!href) return match;

    const safeHref = escapeHtml(href);
    const safeText = escapeHtml(match);

    return `<a href="${safeHref}" class="nexo-link" rel="noopener noreferrer">${safeText}</a>`;
  });
}
