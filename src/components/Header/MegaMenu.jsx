import { useCallback, useEffect, useId, useRef } from 'react';
import BannerLink from '../BannerLink';
import { FiChevronDown, FiArrowRight } from 'react-icons/fi';
import StoreImage from '../StoreImage';

export default function MegaMenu({ site, item }) {
  const ref = useRef(null);
  const leaveTimer = useRef(null);
  const exitAnimation = useRef(null);
  const id = useId();
  const collections = site?.collections || [];
  const destinations = item.items.flatMap(child => [child.url, ...(child.items || []).map(grandchild => grandchild.url)]);
  const featured = collections.filter(collection => collection.image?.url && destinations.some(url => url?.includes('/collections/' + collection.handle))).slice(0, 2);
  const flat = item.items.every(child => !child.items?.length);
  const columns = (flat ? 1 : item.items.length) + featured.length;
  const compact = columns <= 3;
  const positionPanel = useCallback(() => {
    if (!compact || !ref.current?.open) return;
    const panel = ref.current.querySelector('.mega-panel');
    const header = ref.current.closest('header').getBoundingClientRect();
    const trigger = ref.current.querySelector('summary').getBoundingClientRect();
    const left = trigger.left + trigger.width / 2 - header.left - panel.offsetWidth / 2;
    panel.style.left = Math.max(16, Math.min(left, header.width - panel.offsetWidth - 16)) + 'px';
  }, [compact]);
  useEffect(() => {
    window.addEventListener('resize', positionPanel);
    return () => window.removeEventListener('resize', positionPanel);
  }, [positionPanel]);
  const close = () => {
    const element = ref.current;
    if (!element?.open || exitAnimation.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { element.open = false; return; }
    const animation = element.querySelector('.mega-panel').animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 140, easing: 'ease-out' });
    exitAnimation.current = animation;
    animation.finished.then(() => { element.open = false; exitAnimation.current = null; }).catch(() => {});
  };
  useEffect(() => {
    const outside = event => { if (ref.current && !ref.current.contains(event.target)) close(); };
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('pointerdown', outside); clearTimeout(leaveTimer.current); exitAnimation.current?.cancel(); };
  }, []);
  return <details ref={ref} className="mega-menu" onToggle={positionPanel} onPointerEnter={event => {
    if (event.pointerType !== 'mouse' || !window.matchMedia('(min-width: 1025px) and (hover: hover)').matches) return;
    clearTimeout(leaveTimer.current);
    exitAnimation.current?.cancel();
    exitAnimation.current = null;
    ref.current.open = true;
  }} onPointerLeave={event => {
    if (event.pointerType === 'mouse') leaveTimer.current = setTimeout(close, 160);
  }} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); ref.current.querySelector('summary').focus(); }
  }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
    <summary onClick={event => { event.preventDefault(); if (ref.current.open) close(); else ref.current.open = true; }} aria-controls={id} className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-sm font-semibold">{item.title} <FiChevronDown aria-hidden="true" size={15} className="mega-chevron" /></summary>
    <div id={id} style={{ '--mega-columns': Math.min(columns, 4) }} className={'mega-panel absolute top-full z-40 max-h-[75dvh] overflow-y-auto bg-white ' + (compact ? 'mega-panel-compact' : 'inset-x-0 border-y border-gray-200 px-8 py-8 shadow-xl')}>
      <div className="mx-auto max-w-7xl">
        <div className={'mega-grid grid gap-7 ' + (flat ? 'mega-grid-flat' : '')}>
          {item.items.map(child => <div key={child.id}>
            <BannerLink to={child.url} onClick={close} className={flat ? 'block rounded-md px-3 py-2.5 text-sm hover:bg-gray-50' : 'mb-3 inline-block text-sm font-semibold hover:underline'}>{child.title}</BannerLink>
            {child.items?.length > 0 && <ul className="space-y-1">{child.items.map(grandchild => <li key={grandchild.id}><BannerLink to={grandchild.url} onClick={close} className="block rounded-md px-2 py-2 text-sm text-gray-600 hover:bg-gray-50">{grandchild.title}</BannerLink></li>)}</ul>}
          </div>)}
          {featured.map(collection => <BannerLink key={collection.handle} to={'/collections/' + collection.handle} onClick={close} className="group"><div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100"><StoreImage src={collection.image.url} alt={collection.image.altText || collection.title} sizes="(max-width: 640px) 45vw, 240px" maxWidth={480} className="h-full w-full object-cover transition-transform group-hover:scale-105" /></div><span className="mt-3 flex items-center justify-between text-sm font-medium">{collection.title}<FiArrowRight aria-hidden="true" /></span></BannerLink>)}
        </div>
      </div>
    </div>
  </details>;
}
