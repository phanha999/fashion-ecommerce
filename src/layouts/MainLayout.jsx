import { t } from "../utils/translations";
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AnnouncementBar from '../components/AnnouncementBar/AnnouncementBar';
import ScrollToTop from '../components/ScrollToTop';
import PageMotion from '../components/PageMotion';
import { Suspense } from 'react';
export default function MainLayout() {
  return <>
    <ScrollToTop />
    <a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:bg-white focus:p-3">{t("Skip to content")}</a>
    <AnnouncementBar />
    <Header />
    <main id="main-content"><PageMotion><Suspense fallback={<div className="min-h-screen px-6 py-16" role="status">{t("Loading page…")}</div>}><Outlet /></Suspense></PageMotion></main>
    <Footer />
  </>;
}
