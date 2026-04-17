import HeroBanner from "./components/HeroBanner";
import FeaturesStrip from "./components/FeaturesStrip";
import ProductCategories from "./components/ProductCategories";
import FeaturedProducts from "./components/FeaturedProducts";
import BrandsSection from "./components/BrandsSection";
import CTASection from "./components/CTASection";
import AdminButton from "./components/AdminButton";

export default function Home() {
  return (
    <main>
      <AdminButton /> 
      <HeroBanner />
      <FeaturesStrip />
      <ProductCategories />
      <FeaturedProducts />
      <BrandsSection />
      <CTASection />
    </main>
  );
}
