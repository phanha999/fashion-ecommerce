import { t } from "./utils/translations";
import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

const pageLoaders = {
  Home: () => import('./pages/Home/Home'),
  Shop: () => import('./pages/Shop/Shop'),
  ProductDetail: () => import('./pages/ProductDetail/ProductDetail'),
  Cart: () => import('./pages/Cart/Cart'),
  BlogArticle: () => import('./pages/BlogArticle/BlogArticle'),
  Account: () => import('./pages/Account/Account'),
  Contact: () => import('./pages/Contact/Contact'),
  ContentPage: () => import('./pages/Content/ContentPage'),
  NotFound: () => import('./pages/NotFound'),
  Wishlist: () => import('./pages/Wishlist/Wishlist'),
  Blog: () => import('./pages/Blog/Blog'),
};
const Home = lazy(pageLoaders.Home);
const Shop = lazy(pageLoaders.Shop);
const ProductDetail = lazy(pageLoaders.ProductDetail);
const Cart = lazy(pageLoaders.Cart);
const BlogArticle = lazy(pageLoaders.BlogArticle);
const Account = lazy(pageLoaders.Account);
const Contact = lazy(pageLoaders.Contact);
const ContentPage = lazy(pageLoaders.ContentPage);
const NotFound = lazy(pageLoaders.NotFound);
const Wishlist = lazy(pageLoaders.Wishlist);
const Blog = lazy(pageLoaders.Blog);

const warmedPages = new Set();
function preloadLink(event) {
  if (navigator.connection?.saveData) return;
  const link = event.target.closest?.('a[href]');
  if (!link || link.hasAttribute('download')) return;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  const path = url.pathname;
  const name = path === '/' ? t("Home") : path === '/shop' ? 'Shop' : path.startsWith('/products/') ? 'ProductDetail' : path === '/cart' ? 'Cart' : path === '/account' ? 'Account' : path === '/wishlist' ? t("Wishlist") : path === '/blogs' ? 'Blog' : path.startsWith('/blogs/') ? 'BlogArticle' : path === '/pages/contact' ? t("Contact") : path.startsWith('/pages/') || path.startsWith('/policies/') ? 'ContentPage' : null;
  if (!name || warmedPages.has(name)) return;
  warmedPages.add(name);
  pageLoaders[name]().catch(() => warmedPages.delete(name));
}
function App() {
  return (
    <div className="contents" onPointerOver={preloadLink} onFocus={preloadLink} onPointerDown={preloadLink}><Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/pages/contact" element={<Contact />} />
        <Route path="/pages/:handle" element={<ContentPage />} />
        <Route path="/policies/privacy-policy" element={<ContentPage policy="privacyPolicy" />} />
        <Route path="/policies/refund-policy" element={<ContentPage policy="refundPolicy" />} />
        <Route path="/policies/shipping-policy" element={<ContentPage policy="shippingPolicy" />} />
        <Route path="/policies/terms-of-service" element={<ContentPage policy="termsOfService" />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/blogs" element={<Blog />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/account" element={<Account />} />
        <Route path="/blogs/:blogHandle/:articleHandle" element={<BlogArticle />} />
      </Route>
    </Routes></div>
  );
}

export default App;
