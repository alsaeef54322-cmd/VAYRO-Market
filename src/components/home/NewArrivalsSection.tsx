import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import { PRODUCTS } from '../../data/products';

export const NewArrivalsSection: React.FC = () => {
  const { t, dir } = useLanguage();
  const { setCurrentPage } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'women' | 'men' | 'accessories' | 'home'>('all');

  const filteredProducts = PRODUCTS.filter((p) => {
    if (activeTab === 'all') return true;
    return p.category === activeTab;
  }).slice(0, 4);

  return (
    <section className="py-12 sm:py-16 bg-[#F5F2E9] border-t border-[#111310]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading & Interactive Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 text-right">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#AAB5A0] font-bold block mb-1">
              {t('إصدارات جديدة', 'LATEST DROPS')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111310] tracking-tight">
              {t('وصل حديثًا، يستاهل تشوفه.', 'Just Landed. Worth Your Gaze.')}
            </h2>
            <p className="text-xs text-[#111310]/60 mt-1">
              {t('قطع جديدة منتقاة بعناية وصلت هذا الأسبوع لمخازننا في القاهرة.', 'Curated recent additions arriving in our Cairo hubs this week.')}
            </p>
          </div>

          {/* Clean Segmented Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#111310]/10 self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'bg-[#111310] text-[#D5FF3F] shadow-sm'
                  : 'text-[#111310]/70 hover:text-[#111310]'
              }`}
            >
              {t('الكل', 'All')}
            </button>
            <button
              onClick={() => setActiveTab('men')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'men'
                  ? 'bg-[#111310] text-[#D5FF3F] shadow-sm'
                  : 'text-[#111310]/70 hover:text-[#111310]'
              }`}
            >
              {t('رجالي', 'Men')}
            </button>
            <button
              onClick={() => setActiveTab('women')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'women'
                  ? 'bg-[#111310] text-[#D5FF3F] shadow-sm'
                  : 'text-[#111310]/70 hover:text-[#111310]'
              }`}
            >
              {t('نسائي', 'Women')}
            </button>
            <button
              onClick={() => setActiveTab('accessories')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'accessories'
                  ? 'bg-[#111310] text-[#D5FF3F] shadow-sm'
                  : 'text-[#111310]/70 hover:text-[#111310]'
              }`}
            >
              {t('إكسسوارات', 'Accessories')}
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'home'
                  ? 'bg-[#111310] text-[#D5FF3F] shadow-sm'
                  : 'text-[#111310]/70 hover:text-[#111310]'
              }`}
            >
              {t('البيت', 'Home')}
            </button>
          </div>
        </div>

        {/* 4-Card Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom Explorer Action */}
        <div className="mt-10 text-center">
          <button
            onClick={() => setCurrentPage('catalog')}
            className="py-3 px-8 rounded-xl bg-transparent border border-[#111310] text-[#111310] hover:bg-[#111310] hover:text-white font-bold text-xs transition-all inline-flex items-center gap-2"
          >
            <span>{t('عرض جميع الوافد حديثًا', 'Explore all new arrivals')}</span>
            <ArrowLeft size={14} className={dir === 'ltr' ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>
    </section>
  );
};
