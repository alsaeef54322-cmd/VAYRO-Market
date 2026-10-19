import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import { PRODUCTS } from '../../data/products';

export const SpotlightSection: React.FC = () => {
  const { t, dir } = useLanguage();
  const { setCurrentPage } = useStore();

  // Products from screenshot: headphones, vase, t-shirt, sunglasses
  const spotlightProducts = [
    PRODUCTS.find((p) => p.id === 'vayro-p5') || PRODUCTS[4],
    PRODUCTS.find((p) => p.id === 'vayro-p6') || PRODUCTS[5],
    PRODUCTS.find((p) => p.id === 'vayro-p7') || PRODUCTS[6],
    PRODUCTS.find((p) => p.id === 'vayro-p8') || PRODUCTS[7],
  ].filter(Boolean);

  return (
    <section className="py-12 sm:py-16 bg-[#F5F2E9] border-t border-[#111310]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-right">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#AAB5A0] font-bold block mb-1">
              {t('مختارات بارزة', 'HIGH ROTATION')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111310] tracking-tight">
              {t('في دائرة الاهتمام', 'In The Spotlight')}
            </h2>
            <p className="text-xs text-[#111310]/60 mt-1">
              {t('القطع الأكثر طلبًا وتفاعلاً من مجتمع VAYRO هذا الأسبوع.', 'The most coveted and requested pieces across Egypt this week.')}
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('catalog')}
            className="self-start sm:self-auto text-xs font-bold text-[#111310] hover:text-[#586249] transition-colors pb-1 border-b border-[#111310] flex items-center gap-1.5"
          >
            <span>{t('عرض كل المجموعات', 'View all spotlight items')}</span>
            <ArrowLeft size={13} className={dir === 'ltr' ? 'rotate-180' : ''} />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {spotlightProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </section>
  );
};
