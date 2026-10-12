import Seo from '../../components/Seo';
import { useSite } from '../../contexts/siteContext';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import CategorySection from '../../components/CategorySection/CategorySection';
import NewArrivals from '../../components/NewArrivals/NewArrivals';
import GridBanner from '../../components/GridBanner/GridBanner';
import BestSellers from '../../components/BestSellers/BestSellers';
import ImageBanner from '../../components/ImageBanner/ImageBanner';
import TopBrands from '../../components/TopBrands/TopBrands';
import FeaturedProducts from '../../components/FeaturedProducts/FeaturedProducts';
import AppBanner from '../../components/AppBanner/AppBanner';
import ContactSection from '../../components/ContactSection/ContactSection';
import BlogSection from '../../components/BlogSection/BlogSection';
import NewsletterSection from '../../components/NewsletterSection/NewsletterSection';
import InstagramSection from '../../components/InstagramSection/InstagramSection';

function Home() {
  const { site } = useSite();
  return (
    <>
      <Seo title={site?.name || 'Store'} description={site?.description || 'Explore our latest collections.'} />
      <HeroBanner />
      <CategorySection />
      <NewArrivals />
      <GridBanner />
      <BestSellers />
      <ImageBanner />
      <TopBrands />
      <FeaturedProducts />
      <AppBanner />
      <ContactSection />
      <BlogSection />
      <NewsletterSection />
      <InstagramSection />
    </>
  );
}

export default Home;  