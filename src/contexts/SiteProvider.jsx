import { useEffect, useRef, useState } from 'react';
import { SiteContext } from './siteContext';
import { getSiteInfo } from '../services/shopify/siteService';

export default function SiteProvider({ children }) {
  const [site, setSite] = useState(null);
  const [error, setError] = useState('');
  const request = useRef(null);
  useEffect(() => {
    let cancelled = false;
    request.current ||= getSiteInfo();
    request.current.then(value => { if (!cancelled) setSite(value); }).catch(() => { if (!cancelled) setError('Store information is temporarily unavailable.'); });
    return () => { cancelled = true; };
  }, []);
  return <SiteContext.Provider value={{ site, error }}>{children}</SiteContext.Provider>;
}
