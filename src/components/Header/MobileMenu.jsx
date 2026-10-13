import useAnimatedClose from '../../hooks/useAnimatedClose';
import { useEffect, useRef } from 'react';
import { FiX, FiChevronDown } from 'react-icons/fi';
import BannerLink from '../BannerLink';

export default function MobileMenu({ site, onClose: onDismiss }) {
  const ref = useRef(null);
  const onClose = useAnimatedClose(ref, onDismiss, 'left');
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    const desktop = window.matchMedia('(min-width: 1025px)');
    const resize = event => { if (event.matches) onClose(); };
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    desktop.addEventListener('change', resize);
    return () => { desktop.removeEventListener('change', resize); dialog.close(); document.body.style.overflow = overflow; previousFocus?.focus(); };
  }, [onClose]);
  return <dialog ref={ref} aria-labelledby="mobile-menu-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX > bounds.right || event.clientX < bounds.left) onClose();
  }} className="mobile-menu fixed inset-y-0 left-0 right-auto m-0 h-dvh max-h-dvh w-[min(88vw,400px)] border-0 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-black/40 open:flex open:flex-col">
    <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4"><h2 id="mobile-menu-title" className="text-lg font-semibold">Menu</h2><button type="button" aria-label="Close menu" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-gray-100"><FiX aria-hidden="true" size={22} /></button></div>
    <nav aria-label="Mobile navigation" className="min-h-0 flex-1 overflow-y-auto px-5 py-4"><MenuItems items={site?.mainMenu?.items || []} onClose={onClose} />{!site && <p role="status">Loading menu…</p>}</nav>
  </dialog>;
}

function MenuItems({ items, onClose, nested = false }) {
  return <ul className={nested ? 'border-l border-gray-200 pl-4' : 'divide-y divide-gray-100'}>{items.map(item => <li key={item.id}>{item.items?.length ? <details className="mobile-menu-group"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium">{item.title}<FiChevronDown aria-hidden="true" size={16} /></summary><BannerLink to={item.url} onClick={onClose} className="mb-2 inline-flex min-h-10 items-center text-xs font-medium text-gray-500 underline">View {item.title}</BannerLink><MenuItems items={item.items} onClose={onClose} nested /></details> : <BannerLink to={item.url} onClick={onClose} className="flex min-h-12 items-center py-3 text-sm hover:text-gray-500">{item.title}</BannerLink>}</li>)}</ul>;
}
