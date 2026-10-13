export const localizationKey = 'pando_localization';
function readPreference() {
  try {
    const value = JSON.parse(localStorage.getItem(localizationKey));
    return value && /^[A-Z]{2}$/.test(value.country) && /^[A-Z]{2,3}(_[A-Z]{2})?$/.test(value.language) ? value : {};
  } catch { return {}; }
}
let preference = readPreference();
export const getLocalizationContext = () => preference;
export const getLocalizationCacheKey = () => `${preference.country || ''}:${preference.language || ''}`;
export const getIntlLocale = () => (preference.language || 'EN').toLowerCase().replace('_', '-');
export function setLocalizationContext(value, persist = false) {
  if (persist) localStorage.setItem(localizationKey, JSON.stringify(value));
  preference = value;
  document.documentElement.lang = getIntlLocale();
}
export function contextualizeQuery(query, context = preference) {
  if (query.includes('@inContext')) return query;
  const args = [];
  if (/^[A-Z]{2}$/.test(context.country || '')) args.push(`country: ${context.country}`);
  if (/^[A-Z]{2,3}(_[A-Z]{2})?$/.test(context.language || '')) args.push(`language: ${context.language}`);
  if (!args.length) return query;
  const brace = query.indexOf('{');
  const header = query.slice(0, brace);
  return `${header.trim() ? header : 'query '}@inContext(${args.join(', ')}) ${query.slice(brace)}`;
}
