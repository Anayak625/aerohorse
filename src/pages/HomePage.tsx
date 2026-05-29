import { PageTransition } from '../components/ui/PageTransition';

import { HeroSection } from '../components/sections/HeroSection';
import { FeaturedInSection } from '../components/sections/FeaturedInSection';
import { BenefitsSection } from '../components/sections/BenefitsSection';
import { ProductsSection } from '../components/sections/ProductsSection';
import { TechnologySection } from '../components/sections/TechnologySection';
import { CapabilitiesSection } from '../components/sections/CapabilitiesSection';
import { SolutionsSection } from '../components/sections/SolutionsSection';
import { SupportSection } from '../components/sections/SupportSection';
import { MissionSection } from '../components/sections/MissionSection';

export function HomePage() {
  return (
    <PageTransition>
      <HeroSection />
      <FeaturedInSection />
      <BenefitsSection />
      <ProductsSection />
      <TechnologySection />
      <CapabilitiesSection />
      <SolutionsSection />
      <SupportSection />
      <MissionSection />
    </PageTransition>
  );
}
