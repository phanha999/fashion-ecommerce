import { useEffect, useRef, useState } from 'react';
import { SiteContext } from './siteContext';
import { getSiteInfo } from '../services/shopify/siteService';

export default function SiteProvider({ children }) {
  const [site, setSite] = useState(null);
  const [error, setError] = useState('');
  const request = useRef(null);
  const [revision, setRevision] = useState(0);
  const retry = () => {
    request.current = null;
    setError('');
    setRevision(value => value + 1);
  };
  useEffect(() => {
    let cancelled = false;
    request.current ||= getSiteInfo();
    request.current.then(value => { if (!cancelled) setSite(value); }).catch(() => { if (!cancelled) setError('Store information is temporarily unavailable.'); });
    return () => { cancelled = true; };
  }, [revision]);
  return <SiteContext.Provider value={{ site, error, retry }}>{children}</SiteContext.Provider>;
}
