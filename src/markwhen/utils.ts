import { LINK_REGEX, AT_REGEX } from "@markwhen/parser/lib/Types";

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function toInnerHtml(s: string): string {
  return escapeHtml(s)
    .replace(LINK_REGEX, (substring, linkText, link) => {
      return `<a class="underline" href="${escapeHtml(
        addHttpIfNeeded(link)
      )}">${escapeHtml(linkText)}</a>`;
    })
    .replace(AT_REGEX, (substring, at) => {
      const safe = escapeHtml(at);
      return `<a class="underline" href="/${safe}">@${safe}</a>`;
    });
}

function addHttpIfNeeded(s: string): string {
  if (
    s.startsWith("http://") ||
    s.startsWith("https://") ||
    s.startsWith("/")
  ) {
    return s;
  }
  return `http://${s}`;
}
