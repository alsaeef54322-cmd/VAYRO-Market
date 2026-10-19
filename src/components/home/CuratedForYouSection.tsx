import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import { PRODUCTS } from '../../data/products';

export const CuratedForYouSection: React.FC = () => {
  const { t, dir } = useLanguage();
  const { setCurrentPage } = useStore();

  const curatedProducts = [
    PRODUCTS.find((p) => p.id === 'vayro-p9') || PRODUCTS[8],
    PRODUCTS.find((p) => p.id === 'vayro-p10') || PRODUCTS[9],
    PRODUCTS.find((p) => p.id === 'vayro-p11') || PRODUCTS[10],
    PRODUCTS.find((p) => p.id === 'vayro-p12') || PRODUCTS[11],
  ].filter(Boolean);

  return (
    <section className="py-12 sm:py-16 bg-[#F5F2E9] border-t border-[#111310]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-right">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#AAB5A0] font-bold block mb-1">
              {t('ملاءمة ذوقك', 'TAILORED TASTE')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111310] tracking-tight">
              {t('اختيارات أقرب لذوقك', 'Selections Closest To Your Style')}
            </h2>
            <p className="text-xs text-[#111310]/60 mt-1">
              {t('قطع منزلية وملابس أساسية تتناغم مع تفاصيل يومك الهادئ.', 'Warm home textiles and intentional daily wear tuned to everyday life.')}
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('catalog')}
            className="self-start sm:self-auto text-xs font-bold text-[#111310] hover:text-[#586249] transition-colors pb-1 border-b border-[#111310] flex items-center gap-1.5"
          >
            <span>{t('عرض المزيد', 'View all personalized')}</span>
            <ArrowLeft size={13} className={dir === 'ltr' ? 'rotate-180' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {curatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};
