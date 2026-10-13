import useAnimatedClose from '../../hooks/useAnimatedClose';
import StoreImage from '../StoreImage';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { quickSearchProducts } from '../../services/shopify/productService';

export default function SearchPopup({ isOpen, onClose: onDismiss }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const onClose = useAnimatedClose(dialogRef, onDismiss, 'down');
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    function keyboard(event) {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const elements = [...dialogRef.current.querySelectorAll('a[href],button,input')].filter(element => !element.disabled);
      const first = elements[0]; const last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('keydown', keyboard); document.body.style.overflow = overflow; previous?.focus(); };
  }, [isOpen, onClose]);
  const term = query.trim();
  useEffect(() => {
    if (!isOpen || term.length < 2) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setResult({ term, status: 'loading' });
      quickSearchProducts(term).then(products => { if (!cancelled) setResult({ term, status: 'success', products }); })
        .catch(() => { if (!cancelled) setResult({ term, status: 'error' }); });
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [isOpen, term]);
  if (!isOpen) return null;
  const state = result?.term === term ? result : null;
  return <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 pt-[10vh]" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="search-title" className="dialog-enter w-full max-w-2xl rounded-md bg-white shadow-xl">
      <h2 id="search-title" className="sr-only">Search products</h2>
      <div className="flex gap-3 border-b px-5"><input ref={inputRef} type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label="Search products" placeholder="Search products…" className="h-16 min-w-0 flex-1 outline-none" /><button onClick={onClose} aria-label="Close search" className="px-2">Close</button></div>
      <div className="max-h-[65vh] overflow-y-auto p-5">
        {term.length < 2 ? <p className="py-6 text-center text-sm text-gray-500">Type at least 2 characters.</p> : !state || state.status === 'loading' ? <p role="status">Searching…</p> : state.status === 'error' ? <p role="alert">Search is temporarily unavailable. Try another search.</p> : <>
          {!state.products.length && <p>No matching products.</p>}
          <ul className="divide-y">{state.products.map(product => <li key={product.id}><Link to={'/products/' + encodeURIComponent(product.id)} onClick={onClose} className="flex items-center gap-4 py-3">{product.image && <StoreImage src={product.image} alt={product.imageAlt} className="h-16 w-12 object-cover" />}<span className="min-w-0 flex-1 text-sm">{product.title}</span><span className="text-sm">{new Intl.NumberFormat(undefined, { style: 'currency', currency: product.currencyCode }).format(Number(product.price))}</span></Link></li>)}</ul>
          <Link to={'/shop?q=' + encodeURIComponent(term)} onClick={onClose} className="mt-5 block text-center text-sm underline">View all results</Link>
        </>}
      </div>
    </section>
  </div>;
}
