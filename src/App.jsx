import { Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import BlogArticle from './pages/BlogArticle/BlogArticle';
import Account from './pages/Account/Account';
import Contact from './pages/Contact/Contact';
import ContentPage from './pages/Content/ContentPage';
import NotFound from './pages/NotFound';
import Wishlist from './pages/Wishlist/Wishlist';
import Blog from './pages/Blog/Blog';

function App() {
  return (
    <Routes>
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
    </Routes>
  );
}

export default App;