import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageMotion({ children }) {
  const ref = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const root = ref.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Only animate below the fold; the first viewport stays visible for fast LCP.
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px 48px 0px', threshold: 0.08 });
    const observed = new WeakSet();
    const collect = () => {
      for (const element of root.querySelectorAll('section, .product-card')) {
        if (observed.has(element)) continue;
        observed.add(element);
        if (element.getBoundingClientRect().top > window.innerHeight + 32) {
          element.classList.add('reveal-ready');
          observer.observe(element);
        }
      }
    };
    collect();
    let frame;
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(collect);
    });
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect(); mutations.disconnect(); cancelAnimationFrame(frame);
      for (const element of root.querySelectorAll('.reveal-ready')) element.classList.remove('reveal-ready', 'reveal-visible');
    };
  }, [pathname]);
  return <div key={pathname} ref={ref} className="page-enter">{children}</div>;
}
