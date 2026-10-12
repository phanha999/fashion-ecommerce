import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shopifyFetch } from '../services/shopify/client';
import ReviewForm from './ReviewForm';
import ProductCard from './ProductCard/ProductCard';

export default function ProductExtras({ product }) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    let cancelled = false;
    shopifyFetch(`query Related($id: ID!) {
      productRecommendations(productId: $id) { id handle title featuredImage { url altText } priceRange { minVariantPrice { amount currencyCode } } }
    }`, { id: product.id }).then(data => { if (!cancelled) setResult({ id: product.id, items: data.productRecommendations || [] }); }).catch(() => {});
    return () => { cancelled = true; };
  }, [product.id]);
  let reviews = [];
  try {
    const values = JSON.parse(product.reviews?.value || '[]');
    if (Array.isArray(values)) reviews = values.filter(item => typeof item.author === 'string' && typeof item.body === 'string' && Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5);
  } catch { /* Unpublished or invalid reviews are omitted. */ }
  return <section className="mx-auto max-w-6xl px-4 pb-12 md:px-8">
    <div className="mb-10 flex flex-wrap gap-5 text-sm"><Link to="/pages/size-guide" className="underline">Size guide</Link><Link to="/policies/shipping-policy" className="underline">Shipping</Link><Link to="/policies/refund-policy" className="underline">Returns</Link></div>
    <h2 className="text-2xl font-semibold">Customer reviews</h2>
    {!reviews.length ? <p className="mt-4 text-sm text-gray-500">No published reviews for this product yet.</p> : <div className="mt-5 space-y-4">{reviews.map((review, index) => <article key={index} className="border p-4"><p className="font-medium">{review.author} <span aria-label={review.rating + ' out of 5 stars'}>{'★'.repeat(review.rating)}</span></p><p className="mt-2 text-sm">{review.body}</p></article>)}</div>}
    <ReviewForm product={product} />
    {result?.id === product.id && result.items.length > 0 && <><h2 className="mb-6 mt-12 text-2xl font-semibold">You may also like</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{result.items.slice(0, 4).map(item => <ProductCard key={item.id} product={{ id: item.id, handle: item.handle, name: item.title, image: item.featuredImage?.url, imageAlt: item.featuredImage?.altText, price: Number(item.priceRange.minVariantPrice.amount), currencyCode: item.priceRange.minVariantPrice.currencyCode }} />)}</div></>}
  </section>;
}
