import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { BRAND_PARTNERS } from '../../data/products';

export const BrandPartnersSection: React.FC = () => {
  const { t } = useLanguage();
  const { executeSearch } = useStore();

  return (
    <section className="py-12 sm:py-16 bg-[#F5F2E9] border-t border-[#111310]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-[#AAB5A0] font-bold block mb-1">
          {t('شركاء الجودة والابتكار', 'DESIGNER HOUSES')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#111310] tracking-tight">
          {t('أسماء تستحق تعرفها', 'Curators & Designers You Should Know')}
        </h2>
        <p className="text-xs text-[#111310]/60 mt-1 max-w-lg mx-auto">
          {t(
            'نعتمد نخبة من أبرز بيوت التصميم والمصانع المتخصصة في مصر لضمان تفوق الخامات ومتانة التنفيذ.',
            'Collaborating with leading contemporary studios and ateliers across Egypt.'
          )}
        </p>

        {/* Brand Logos Row */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {BRAND_PARTNERS.map((partner) => (
            <button
              key={partner.name}
              onClick={() => executeSearch(partner.name)}
              className="p-6 rounded-2xl bg-white border border-[#111310]/10 hover:border-[#111310] hover:shadow-lg transition-all group flex flex-col items-center justify-center text-center"
            >
              <span className="font-display font-black text-lg tracking-wider text-[#111310] group-hover:scale-105 transition-transform">
                {partner.name}
              </span>
              <span className="text-[10px] text-[#111310]/50 mt-1 line-clamp-1">
                {t(partner.tagline_ar, partner.tagline_en)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
