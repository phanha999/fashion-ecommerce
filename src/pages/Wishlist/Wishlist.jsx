import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../hooks/useWishlist';
import { getProductDetail } from '../../services/shopify/productService';
import ProductCard from '../../components/ProductCard/ProductCard';
import Seo from '../../components/Seo';
export default function Wishlist() {
  const { ids, toggle } = useWishlist();
  const key = JSON.stringify(ids);
  const [result, setResult] = useState(null);
  useEffect(() => {
    let cancelled = false;
    Promise.all(JSON.parse(key).map(async id => {
      try {
        const product = await getProductDetail(id);
        const variant = product.variants.find(item => item.availableForSale) || product.variants[0];
        return { id, product: { id, name: product.title, description: product.description, price: Number(variant?.price.amount || 0), currencyCode: variant?.price.currencyCode || 'USD', image: product.featuredImage?.url, imageAlt: product.title } };
      } catch { return { id, unavailable: true }; }
    })).then(items => { if (!cancelled) setResult({ key, items }); });
    return () => { cancelled = true; };
  }, [key]);
  return <main className="mx-auto max-w-7xl px-4 py-12"><Seo title="Your wishlist" noIndex /><h1 className="mb-8 text-3xl font-bold">Your wishlist</h1><p className="mb-6 text-sm text-gray-500">Saved on this browser.</p>{!ids.length ? <p>No saved products yet. <Link to="/shop" className="underline">Explore the shop</Link></p> : result?.key !== key ? <p>Loading wishlist…</p> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{result.items.map(item => item.unavailable ? <div key={item.id} className="border p-6"><p>Product temporarily unavailable.</p><button onClick={() => toggle(item.id)} className="mt-3 underline">Remove</button></div> : <ProductCard key={item.id} product={item.product} />)}</div>}</main>;
}
