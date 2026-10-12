import { useSyncExternalStore } from 'react';
const key = 'velora_wishlist';
const eventName = 'velora:wishlist';
function snapshot() {
  try { return localStorage.getItem(key) || '[]'; } catch { return '[]'; }
}
function subscribe(notify) {
  const changed = event => { if (!event.key || event.key === key) notify(); };
  window.addEventListener('storage', changed);
  window.addEventListener(eventName, notify);
  return () => { window.removeEventListener('storage', changed); window.removeEventListener(eventName, notify); };
}
export function useWishlist() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '[]');
  let ids = [];
  try { const values = JSON.parse(raw); if (Array.isArray(values)) ids = [...new Set(values.filter(id => typeof id === 'string' && id.startsWith('gid://shopify/Product/')))]; } catch { /* Ignore invalid stored lists. */ }
  function toggle(id) {
    const next = ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id];
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { return false; }
    window.dispatchEvent(new Event(eventName));
    return true;
  }
  return { ids, toggle };
}
