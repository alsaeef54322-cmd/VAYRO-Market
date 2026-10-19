import React from 'react';
import { HeroSection } from './HeroSection';
import { CategoryBanners } from './CategoryBanners';
import { NewArrivalsSection } from './NewArrivalsSection';
import { EditorialStorySection } from './EditorialStorySection';
import { SpotlightSection } from './SpotlightSection';
import { PromoBanner } from './PromoBanner';
import { BrandPartnersSection } from './BrandPartnersSection';
import { CuratedForYouSection } from './CuratedForYouSection';
import { TrustHighlights } from './TrustHighlights';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <CategoryBanners />
      <NewArrivalsSection />
      <EditorialStorySection />
      <SpotlightSection />
      <PromoBanner />
      <BrandPartnersSection />
      <CuratedForYouSection />
      <TrustHighlights />
    </div>
  );
};
