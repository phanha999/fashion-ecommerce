import { lazy, Suspense, useCallback, useState } from 'react';
import { useSite } from '../../contexts/siteContext';
import { Link } from 'react-router-dom';
import { useCustomerAccount } from '../../contexts/customerAccountContext';
import { useCart } from '../../contexts/cartContext';
const loadSearch = () => import('../SearchPopup/SearchPopup');
const SearchPopup = lazy(loadSearch);
const loadWishlist = () => import('../WishlistDrawer');
const WishlistDrawer = lazy(loadWishlist);
const loadMobileMenu = () => import('./MobileMenu');
const MobileMenu = lazy(loadMobileMenu);
import { useWishlist } from '../../hooks/useWishlist';
import { FiHeart, FiSearch, FiUser, FiShoppingBag, FiMenu } from 'react-icons/fi';
import StoreImage from '../StoreImage';
import MegaMenu from './MegaMenu';
import BannerLink from '../BannerLink';

function Header() {
  const { cart } = useCart();
  const { site } = useSite();
  const { customer } = useCustomerAccount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { ids } = useWishlist();
  const closeWishlist = useCallback(() => setIsWishlistOpen(false), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  return (
    <header className="relative z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-20 w-full max-w-[1920px] flex-wrap items-center justify-between gap-2 sm:gap-[30px] px-4 py-3 min-[1025px]:h-20 min-[1025px]:flex-nowrap md:px-8 min-[1025px]:py-0 2xl:px-16">

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" aria-label="Open menu" aria-haspopup="dialog" aria-expanded={isMenuOpen} onPointerDown={() => { loadMobileMenu().catch(() => {}); }} onClick={() => setIsMenuOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-gray-100 min-[1025px]:hidden"><FiMenu aria-hidden="true" size={22} /></button>
        <Link
          to="/"
          aria-label={site?.name || 'Store'}
          className="block w-24 truncate text-base font-bold tracking-[0.1em] text-gray-900 sm:w-auto sm:text-2xl"
        >
          {site?.logo?.url ? <StoreImage src={site.logo.url} alt={site.logo.altText || site.name} width={site.logo.width} height={site.logo.height} maxWidth={240} sizes="114px" priority className="h-auto w-24 object-contain sm:w-[114px]" /> : site?.name || 'Store'}
        </Link>
        </div>

        <nav aria-label="Main navigation" className="hidden min-h-11 flex-wrap items-center justify-center gap-x-5 gap-y-1 min-[1025px]:flex">
          {(site?.mainMenu?.items || []).map(item => item.items?.length ? <MegaMenu key={item.id} site={site} item={item} /> : <BannerLink key={item.id} to={item.url} className="inline-flex min-h-11 items-center text-sm font-semibold hover:text-[#FF5722]">{item.title}</BannerLink>)}
          {site && !site.mainMenu && <span className="text-xs text-gray-500">Main menu is not configured in Shopify.</span>}
        </nav>

        <div className="flex shrink-0 items-center gap-0 sm:gap-2">
          <button type="button" onPointerEnter={() => { loadWishlist().catch(() => {}); }} onFocus={() => { loadWishlist().catch(() => {}); }} onPointerDown={() => { loadWishlist().catch(() => {}); }} onClick={() => setIsWishlistOpen(true)} aria-label="Wishlist" aria-haspopup="dialog" aria-expanded={isWishlistOpen} className="header-action">
            <FiHeart aria-hidden="true" size={21} strokeWidth={1.7} />
            {ids.length > 0 && <span className="header-count">{ids.length > 99 ? '99+' : ids.length}</span>}
          </button>
          <button type="button" aria-label="Search" aria-haspopup="dialog" aria-expanded={isSearchOpen} onPointerEnter={() => { loadSearch().catch(() => {}); }} onFocus={() => { loadSearch().catch(() => {}); }} onPointerDown={() => { loadSearch().catch(() => {}); }} onClick={() => setIsSearchOpen(true)} className="header-action">
            <FiSearch aria-hidden="true" size={21} strokeWidth={1.7} />
          </button>
          <Link to="/account" aria-label={customer ? 'Your account' : 'Sign in'} title={customer ? (customer.firstName || customer.displayName || 'Your account') : 'Sign in'} className="header-action">
            <FiUser aria-hidden="true" size={21} strokeWidth={1.7} />
          </Link>
          <Link to="/cart" aria-label={'Cart, ' + (cart?.totalQuantity || 0) + ' items'} className="header-action">
            <FiShoppingBag aria-hidden="true" size={21} strokeWidth={1.7} />
            {cart?.totalQuantity > 0 && <span className="header-count">{cart.totalQuantity > 99 ? '99+' : cart.totalQuantity}</span>}
          </Link>
        </div>

      </div>
      <Suspense fallback={<div role="status" className="fixed bottom-6 right-6 z-[100] rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm shadow-lg">Opening…</div>}>
        {isMenuOpen && <MobileMenu site={site} onClose={closeMenu} />}
        {isSearchOpen && <SearchPopup isOpen onClose={closeSearch} />}
        {isWishlistOpen && <WishlistDrawer onClose={closeWishlist} />}
      </Suspense>
    </header>
  );
}

export default Header;
