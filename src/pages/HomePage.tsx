import { PageTransition } from '../components/ui/PageTransition';

// Reusing the existing sections for the homepage
import { HeroSection } from '../components/sections/HeroSection';
import { ProductsSection } from '../components/sections/ProductsSection';
import { TechnologySection } from '../components/sections/TechnologySection';
import { SolutionsSection } from '../components/sections/SolutionsSection';
import { MissionSection } from '../components/sections/MissionSection';

export function HomePage() {
  return (
    <PageTransition>
      <HeroSection />
      <ProductsSection />
      <TechnologySection />
      <SolutionsSection />
      <MissionSection />
    </PageTransition>
  );
}
