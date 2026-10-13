import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSite } from '../../contexts/siteContext';
import { getContentPage } from '../../services/shopify/siteService';
import SafeHtml from '../../components/SafeHtml';
import Seo from '../../components/Seo';

export default function ContentPage({ policy, handle: fixedHandle }) {
  const { handle } = useParams();
  const target = fixedHandle || handle;
  const { site, error: siteError, retry: retrySite } = useSite();
  const [result, setResult] = useState(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (policy) return;
    let cancelled = false;
    getContentPage(target).then(page => { if (!cancelled) setResult({ target, page }); }).catch(() => { if (!cancelled) setResult({ target, error: 'This page could not be loaded.' }); });
    return () => { cancelled = true; };
  }, [policy, target, retry]);
  const page = policy ? site?.[policy] : result?.target === target ? result.page : null;
  const error = policy ? siteError : result?.target === target ? result.error : '';
  const loading = policy ? !site && !siteError : result?.target !== target;
  return <section className="mx-auto max-w-4xl px-4 py-12 md:px-8">
    <Seo title={page ? page.title + ' | ' + (site?.name || 'Store') : 'Store information'} description={page?.seo?.description || ''} />
    {loading ? <p role="status">Loading page…</p> : error ? <div role="alert"><p>{error}</p><button onClick={() => policy ? retrySite() : setRetry(value => value + 1)} className="mt-4 underline">Try again</button></div> : !page?.body ? <><h1 className="text-3xl font-bold">Information unavailable</h1><p className="mt-4 text-gray-600">The store has not published this information yet.</p><Link to="/pages/contact" className="mt-4 inline-block underline">Contact the store</Link></> : <><h1 className="mb-8 text-3xl font-bold">{page.title}</h1><SafeHtml html={page.body} /></>}
  </section>;
}
