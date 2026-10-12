import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shopifyFetch } from '../../services/shopify/client';
import Seo from '../../components/Seo';
export default function Blog() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function load(after = null) {
    setBusy(true); setError('');
    try {
      const data = await shopifyFetch(`query Articles($after: String) {
        articles(first: 12, after: $after, sortKey: PUBLISHED_AT, reverse: true) {
          nodes { id title excerpt publishedAt handle blog { handle } image { url altText } }
          pageInfo { hasNextPage endCursor }
        }
      }`, { after });
      setResult(previous => ({ ...data.articles, nodes: after ? [...previous.nodes, ...data.articles.nodes] : data.articles.nodes }));
    } catch { setError('Articles could not be loaded. Please try again.'); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    let cancelled = false;
    shopifyFetch(`query Articles { articles(first: 12, sortKey: PUBLISHED_AT, reverse: true) {
      nodes { id title excerpt publishedAt handle blog { handle } image { url altText } }
      pageInfo { hasNextPage endCursor }
    } }`).then(data => { if (!cancelled) setResult(data.articles); }).catch(() => { if (!cancelled) setError('Articles could not be loaded.'); });
    return () => { cancelled = true; };
  }, []);
  return <main className="mx-auto max-w-6xl px-4 py-12"><Seo title="Journal" description="News and stories from our store." /><h1 className="mb-8 text-3xl font-bold">Journal</h1>{error && <div role="alert"><p>{error}</p><button onClick={() => load()} className="mt-3 underline">Try again</button></div>}{!result && !error ? <p>Loading articles…</p> : result?.nodes.length === 0 ? <p>No articles yet.</p> : <div className="grid gap-8 md:grid-cols-3">{result?.nodes.map(article => <Link key={article.id} to={'/blogs/' + article.blog.handle + '/' + article.handle}>{article.image && <img src={article.image.url} alt={article.image.altText || article.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />}<h2 className="mt-4 text-xl font-semibold">{article.title}</h2><p className="mt-2 text-sm text-gray-500">{article.excerpt}</p></Link>)}</div>}{result?.pageInfo.hasNextPage && <button disabled={busy} onClick={() => load(result.pageInfo.endCursor)} className="mt-8 border px-6 py-3">{busy ? 'Loading…' : 'Load more'}</button>}</main>;
}
