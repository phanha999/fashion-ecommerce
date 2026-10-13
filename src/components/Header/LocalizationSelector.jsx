import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import { useLocalization } from '../../contexts/localizationContext';
import { useCart } from '../../contexts/cartContext';
import { getLocalization } from '../../services/shopify/localizationService';
import { t } from '../../utils/translations';
import { useNotifications } from '../../contexts/notificationContext';

export default function LocalizationSelector() {
  const { notify } = useNotifications();
  const { data, error: loadError, retry, apply } = useLocalization();
  const { changeCountry, isLoading, isUpdating, refresh } = useCart();
  const [open, setOpen] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const root = useRef(null);
  const input = useRef(null);
  useEffect(() => {
    if (!open) return;
    if (open === 'country') input.current?.focus();
    const outside = event => { if (!root.current?.contains(event.target)) setOpen(''); };
    const escape = event => {
      if (event.key !== 'Escape') return;
      event.stopPropagation(); setOpen('');
      root.current?.querySelector(`[data-trigger="${open}"]`)?.focus();
    };
    document.addEventListener('pointerdown', outside);
    root.current?.addEventListener('keydown', escape);
    const element = root.current;
    return () => { document.removeEventListener('pointerdown', outside); element?.removeEventListener('keydown', escape); };
  }, [open]);
  async function choose(country, language) {
    if (busy || isUpdating || isLoading) return;
    if (country === data.country.isoCode && language === data.language.isoCode) { setOpen(''); return; }
    setBusy(true); setError('');
    try {
      const next = await getLocalization({ country, language });
      if (next.country.isoCode !== country || next.language.isoCode !== language) throw new Error(t('This selection is no longer available. Please try again.'));
      if (country !== data.country.isoCode) await changeCountry(country);
      apply(next);
      notify(t('Preferences updated.'));
      setOpen('');
    } catch (failure) {
      setError(failure.message);
      refresh().catch(() => {});
    } finally { setBusy(false); }
  }
  if (!data) return <div className="min-h-10 text-xs text-gray-500">{loadError ? <button title={loadError} onClick={retry} className="min-h-10 underline">{t('Retry language and currency')}</button> : <span className="inline-flex min-h-10 items-center">{t('Loading…')}</span>}</div>;
  const term = search.trim().toLocaleLowerCase();
  const countries = data.availableCountries.filter(item => `${item.name} ${item.isoCode} ${item.currency.isoCode}`.toLocaleLowerCase().includes(term));
  const disabled = busy || isLoading || isUpdating;
  const toggle = name => { setError(''); setSearch(''); setOpen(value => value === name ? '' : name); };
  return <div ref={root} className="locale-selector relative flex items-center gap-1 text-xs" aria-busy={busy}>
    <button type="button" data-trigger="country" disabled={disabled} onClick={() => toggle('country')} aria-expanded={open === 'country'} aria-controls="country-options" className="inline-flex min-h-10 items-center gap-2 rounded px-3 font-medium hover:bg-gray-100 disabled:opacity-50"><span>{data.country.isoCode} · {data.country.currency.isoCode} {data.country.currency.symbol}</span><FiChevronDown aria-hidden="true" className={open === 'country' ? 'rotate-180' : ''} /></button>
    <button type="button" data-trigger="language" disabled={disabled} onClick={() => toggle('language')} aria-expanded={open === 'language'} aria-controls="language-options" className="inline-flex min-h-10 items-center gap-2 rounded px-3 font-medium hover:bg-gray-100 disabled:opacity-50"><span lang={data.language.isoCode.toLowerCase()}>{data.language.endonymName}</span><FiChevronDown aria-hidden="true" className={open === 'language' ? 'rotate-180' : ''} /></button>
    {open && <section id={`${open}-options`} aria-label={t(open === 'country' ? 'Country / currency' : 'Language')} className="locale-panel dialog-enter absolute right-0 top-full z-50 w-[min(340px,calc(100vw-32px))] rounded-xl border border-gray-200 bg-white p-3 text-left shadow-xl">
      <h2 className="px-2 py-2 text-sm font-semibold">{t(open === 'country' ? 'Country / currency' : 'Language')}</h2>
      {open === 'country' && <input ref={input} type="search" aria-label={t('Search country or currency')} placeholder={t('Search country or currency')} value={search} onChange={event => setSearch(event.target.value)} className="mb-2 min-h-11 w-full rounded-lg border border-gray-200 px-3 text-sm" />}
      <ul className="max-h-[min(320px,50svh)] overflow-y-auto overscroll-contain">
        {open === 'country' ? countries.map(item => <li key={item.isoCode}><button type="button" disabled={disabled} onClick={() => { const language = item.availableLanguages.some(value => value.isoCode === data.language.isoCode) ? data.language.isoCode : item.availableLanguages[0]?.isoCode; choose(item.isoCode, language); }} aria-pressed={item.isoCode === data.country.isoCode} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 disabled:opacity-50"><span className="min-w-0 flex-1">{item.name}</span><span className="shrink-0 text-gray-500">{item.currency.isoCode} {item.currency.symbol}</span><span className="w-4">{item.isoCode === data.country.isoCode && <FiCheck aria-hidden="true" />}</span></button></li>) : data.availableLanguages.map(item => <li key={item.isoCode}><button type="button" disabled={disabled} lang={item.isoCode.toLowerCase()} aria-pressed={item.isoCode === data.language.isoCode} onClick={() => choose(data.country.isoCode, item.isoCode)} className="flex min-h-11 w-full items-center justify-between rounded-lg px-2 hover:bg-gray-50 disabled:opacity-50">{item.endonymName}{item.isoCode === data.language.isoCode && <FiCheck aria-hidden="true" />}</button></li>)}
      </ul>
      {open === 'country' && !countries.length && <p className="p-3 text-gray-500">{t('No matching countries.')}</p>}
      {busy && <p role="status" className="p-2">{t('Updating…')}</p>}
      {error && <p role="alert" className="p-2 text-red-700">{error}</p>}
    </section>}
  </div>;
}
