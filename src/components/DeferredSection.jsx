import { Suspense, useEffect, useRef, useState } from 'react';

export default function DeferredSection({ children, label, height = 600 }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setReady(true); observer.disconnect(); }
    }, { rootMargin: '800px 0px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const placeholder = <div role="region" aria-label={'Loading ' + label} aria-busy="true" style={{ minHeight: height }} className="mx-auto max-w-7xl px-6 py-16"><div className="h-6 w-48 animate-pulse rounded bg-gray-100" /><div className="mt-8 h-64 animate-pulse rounded bg-gray-50" /></div>;
  return <div ref={ref}>{ready ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder}</div>;
}
