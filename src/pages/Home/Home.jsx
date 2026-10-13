import Seo from '../../components/Seo';
import { lazy } from 'react';
import DeferredSection from '../../components/DeferredSection';
import { useSite } from '../../contexts/siteContext';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import CategorySection from '../../components/CategorySection/CategorySection';
import NewArrivals from '../../components/NewArrivals/NewArrivals';
const GridBanner = lazy(() => import('../../components/GridBanner/GridBanner'));
const BestSellers = lazy(() => import('../../components/BestSellers/BestSellers'));
const ImageBanner = lazy(() => import('../../components/ImageBanner/ImageBanner'));
const TopBrands = lazy(() => import('../../components/TopBrands/TopBrands'));
const FeaturedProducts = lazy(() => import('../../components/FeaturedProducts/FeaturedProducts'));
const AppBanner = lazy(() => import('../../components/AppBanner/AppBanner'));
const ContactSection = lazy(() => import('../../components/ContactSection/ContactSection'));
const BlogSection = lazy(() => import('../../components/BlogSection/BlogSection'));
const NewsletterSection = lazy(() => import('../../components/NewsletterSection/NewsletterSection'));
const InstagramSection = lazy(() => import('../../components/InstagramSection/InstagramSection'));

function Home() {
  const { site } = useSite();
  return (
    <>
      <Seo title={site?.name || 'Store'} description={site?.description || 'Explore our latest collections.'} />
      <HeroBanner />
      <CategorySection />
      <NewArrivals />
      <DeferredSection label="collections"><GridBanner /></DeferredSection>
      <DeferredSection label="best sellers"><BestSellers /></DeferredSection>
      <DeferredSection label="campaign"><ImageBanner /></DeferredSection>
      <DeferredSection label="brands"><TopBrands /></DeferredSection>
      <DeferredSection label="featured products"><FeaturedProducts /></DeferredSection>
      <DeferredSection label="app"><AppBanner /></DeferredSection>
      <DeferredSection label="contact"><ContactSection /></DeferredSection>
      <DeferredSection label="journal"><BlogSection /></DeferredSection>
      <DeferredSection label="newsletter"><NewsletterSection /></DeferredSection>
      <DeferredSection label="social"><InstagramSection /></DeferredSection>
    </>
  );
}

export default Home;
