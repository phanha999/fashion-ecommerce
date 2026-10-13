import { useCallback, useEffect, useRef, useState } from 'react';
import { LocalizationContext } from './localizationContext';
import { getLocalization } from '../services/shopify/localizationService';
import { getLocalizationContext, setLocalizationContext, localizationKey } from '../utils/localization';
export default function LocalizationProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const request = useRef(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    request.current ||= getLocalization();
    request.current.then(value => {
      if (cancelled) return;
      const previous = getLocalizationContext();
      const actual = { country: value.country.isoCode, language: value.language.isoCode };
      setLocalizationContext(actual);
      setData(value);
      if ((previous.country && previous.country !== actual.country) || (previous.language && previous.language !== actual.language)) {
        try { setLocalizationContext(actual, true); } catch { /* Storage is optional. */ }
        setRevision(count => count + 1);
      }
    }).catch(failure => { if (!cancelled) setError(failure.message); });
    return () => { cancelled = true; };
  }, [attempt]);
  const retry = useCallback(() => { request.current = null; setError(''); setAttempt(value => value + 1); }, []);
  const apply = useCallback(value => {
    setLocalizationContext({ country: value.country.isoCode, language: value.language.isoCode }, true);
    setData(value);
    setRevision(count => count + 1);
  }, []);
  useEffect(() => {
    let cancelled = false;
    const sync = event => {
      if (event.key !== localizationKey || !event.newValue) return;
      let selected;
      try { selected = JSON.parse(event.newValue); } catch { return; }
      if (!/^[A-Z]{2}$/.test(selected.country || '') || !/^[A-Z]{2,3}(_[A-Z]{2})?$/.test(selected.language || '')) return;
      getLocalization(selected).then(value => {
        if (cancelled) return;
        setLocalizationContext({ country: value.country.isoCode, language: value.language.isoCode });
        setData(value); setRevision(count => count + 1);
      }).catch(failure => { if (!cancelled) setError(failure.message); });
    };
    window.addEventListener('storage', sync);
    return () => { cancelled = true; window.removeEventListener('storage', sync); };
  }, []);
  return <LocalizationContext.Provider value={{ data, error, retry, apply, revision }}>{children}</LocalizationContext.Provider>;
}
