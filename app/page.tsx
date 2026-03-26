import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import FeaturesStrip from "./components/FeaturesStrip";
import ProductCategories from "./components/ProductCategories";
import FeaturedProducts from "./components/FeaturedProducts";
import BrandsSection from "./components/BrandsSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import AdminButton from "./components/AdminButton";

export default function Home() {
  return (
    <>
      <Header />
      <AdminButton />
      <main>
        <HeroBanner />
        <FeaturesStrip />
        <ProductCategories />
        <FeaturedProducts />
        <BrandsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
