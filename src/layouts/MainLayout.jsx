import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AnnouncementBar from '../components/AnnouncementBar/AnnouncementBar';
import ScrollToTop from '../components/ScrollToTop';
export default function MainLayout() {
  return <>
    <ScrollToTop />
    <a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:bg-white focus:p-3">Skip to content</a>
    <AnnouncementBar />
    <Header />
    <div id="main-content"><Outlet /></div>
    <Footer />
  </>;
}
