import { createElement, useMemo } from 'react';
import BannerLink from './BannerLink';

const tags = new Set(['p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span']);
const forbidden = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'svg', 'math', 'template']);
function safeUrl(value, image = false) {
  try {
    const url = new URL(value, window.location.origin);
    if (['https:', 'http:', ...(image ? [] : ['mailto:', 'tel:'])].includes(url.protocol)) return value;
  } catch { /* Invalid links are omitted. */ }
  return undefined;
}
function render(node, key) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1) return null;
  const tag = node.tagName.toLowerCase();
  if (forbidden.has(tag)) return null;
  const children = [...node.childNodes].map((child, index) => render(child, index));
  if (!tags.has(tag)) return children;
  const props = { key };
  if (tag === 'a') {
    props.to = safeUrl(node.getAttribute('href') || ''); props.rel = 'noopener noreferrer';
    if (!props.to) return createElement('span', { key }, ...children);
  }
  if (tag === 'img') { props.src = safeUrl(node.getAttribute('src') || '', true); props.alt = node.getAttribute('alt') || ''; props.loading = 'lazy'; if (/^https:\/\/cdn\.shopify\.com\//i.test(props.src || '')) props.crossOrigin = 'anonymous'; if (!props.src) return null; }
  if (tag === 'td' || tag === 'th') {
    const colspan = Number(node.getAttribute('colspan'));
    if (colspan > 0 && colspan <= 20) props.colSpan = colspan;
  }
  return createElement(tag === 'a' ? BannerLink : tag, props, ...(['img', 'br', 'hr'].includes(tag) ? [] : children));
}
export default function SafeHtml({ html = '' }) {
  const content = useMemo(() => [...new DOMParser().parseFromString(html, 'text/html').body.childNodes].map(render), [html]);
  return <div className="shop-content">{content}</div>;
}
