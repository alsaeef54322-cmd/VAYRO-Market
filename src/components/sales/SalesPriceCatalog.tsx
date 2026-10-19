import React, { useState, useMemo } from 'react';
import { Search, Filter, ShoppingCart, Tag, Percent, CheckCircle, Package, ArrowUpRight, DollarSign } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface SalesPriceCatalogProps {
  onSelectProductForOrder?: (product: Product) => void;
}

export const SalesPriceCatalog: React.FC<SalesPriceCatalogProps> = ({ onSelectProductForOrder }) => {
  const { t, language } = useLanguage();
  const { products } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'commission-desc' | 'price-asc' | 'price-desc' | 'name'>('commission-desc');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name_ar.toLowerCase().includes(q) ||
          p.name_en.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      const aSales = a.salesPrice ?? Math.round(a.price * 0.88);
      const bSales = b.salesPrice ?? Math.round(b.price * 0.88);
      const aComm = a.salesCommission ?? Math.round(a.price * 0.08);
      const bComm = b.salesCommission ?? Math.round(b.price * 0.08);

      if (sortBy === 'commission-desc') return bComm - aComm;
      if (sortBy === 'price-asc') return aSales - bSales;
      if (sortBy === 'price-desc') return bSales - aSales;
      return a.name_ar.localeCompare(b.name_ar);
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const categories = [
    { id: 'all', label_ar: 'جميع الأقسام', label_en: 'All Categories' },
    { id: 'men', label_ar: 'أزياء رجالية', label_en: 'Men' },
    { id: 'women', label_ar: 'أزياء نسائية', label_en: 'Women' },
    { id: 'shoes', label_ar: 'أحذية وسنيكرز', label_en: 'Footwear' },
    { id: 'accessories', label_ar: 'إكسسوارات وجلود', label_en: 'Accessories' },
    { id: 'home', label_ar: 'البيت والمعيشة', label_en: 'Home & Living' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-[#1A1F1A] p-6 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#D5FF3F] rounded-[2px]" />
            <h2 className="text-xl font-bold font-display text-[#20241F] dark:text-[#F3F5EF]">
              {t('قائمة أسعار وعمولات المناديب المعتمدة', 'Authorized Sales Rep Price & Commission Matrix')}
            </h2>
          </div>
          <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] mt-1.5 leading-relaxed">
            {t(
              'هذه الأسعار خاصة بمندوبي مبيعات VAYRO فقط، وتتيح تقديم خصم للعميل مع احتساب العمولة المباشرة لكل قطعة تباع.',
              'Special rep pricing allowing competitive client pricing while auto-calculating your net per-item commission.'
            )}
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-[#F0EEE6] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35] text-right">
            <span className="text-[10px] font-mono uppercase text-[#646A63] dark:text-[#B5BDB3] block">
              {t('إجمالي المنتجات', 'PRODUCTS')}
            </span>
            <span className="text-base font-black text-[#20241F] dark:text-[#F3F5EF]">
              {products.length} {t('موديل', 'items')}
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-right">
            <span className="text-[10px] font-mono uppercase text-[#18794E] dark:text-[#65C98A] block">
              {t('متوسط العمولة', 'AVG COMMISSION')}
            </span>
            <span className="text-base font-black text-[#18794E] dark:text-[#65C98A]">
              ~150 {t('ج.م / قطعة', 'EGP / unit')}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute inset-y-0 start-3.5 my-auto text-[#646A63] dark:text-[#B5BDB3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('ابحث بالاسم، الكود، العلامة التجارية...', 'Search product name, SKU, brand...')}
            className="w-full bg-white dark:bg-[#1A1F1A] text-xs py-2.5 ps-10 pe-4 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none text-[#20241F] dark:text-[#F3F5EF]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-[#1A1F1A] text-xs py-2.5 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] text-[#20241F] dark:text-[#F3F5EF] focus:outline-none font-medium"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{t(c.label_ar, c.label_en)}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-[#1A1F1A] text-xs py-2.5 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] text-[#20241F] dark:text-[#F3F5EF] focus:outline-none font-medium"
          >
            <option value="commission-desc">{t('الأعلى عمولة', 'Highest Commission')}</option>
            <option value="price-asc">{t('السعر: من الأقل للأعلى', 'Price: Low to High')}</option>
            <option value="price-desc">{t('السعر: من الأعلى للأقل', 'Price: High to Low')}</option>
            <option value="name">{t('الاسم أبجديًا', 'Product Name')}</option>
          </select>
        </div>
      </div>

      {/* Grid of Product Cards with Sales Price & Commission */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const salesPrice = p.salesPrice ?? Math.round(p.price * 0.88);
          const commission = p.salesCommission ?? Math.round(p.price * 0.08);
          const clientSaving = Math.max(0, p.price - salesPrice);
          const commissionPercent = Math.round((commission / salesPrice) * 100);

          return (
            <div
              key={p.id}
              className="bg-white dark:bg-[#1A1F1A] rounded-3xl p-5 border border-[#E2E5DE] dark:border-[#353D35] shadow-sm hover:border-[#18794E] dark:hover:border-[#65C98A] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image and Badges */}
                <div className="flex gap-4 mb-4">
                  <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-[#F0EEE6] dark:bg-[#232923] shrink-0 border border-[#E2E5DE] dark:border-[#353D35]">
                    <img
                      src={p.images[0]}
                      alt={p.name_ar}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1 end-1 px-1.5 py-0.5 rounded bg-black/70 text-[#D5FF3F] text-[9px] font-mono font-bold">
                      {p.sku}
                    </span>
                  </div>

                  <div className="flex-1 text-right">
                    <span className="text-[10px] font-mono tracking-widest text-[#18794E] dark:text-[#65C98A] uppercase font-bold block">
                      {p.brand}
                    </span>
                    <h3 className="text-sm font-bold text-[#20241F] dark:text-[#F3F5EF] line-clamp-2 mt-0.5">
                      {t(p.name_ar, p.name_en)}
                    </h3>
                    <p className="text-[11px] text-[#646A63] dark:text-[#B5BDB3] line-clamp-1 mt-1">
                      {t(p.subtitle_ar, p.subtitle_en)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F0EEE6] dark:bg-[#232923] text-[#646A63] dark:text-[#B5BDB3]">
                        {t('المخزون:', 'Stock:')} <strong className="text-[#20241F] dark:text-[#F3F5EF]">{p.stock}</strong>
                      </span>
                      {clientSaving > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                          {t('توفير للعميل:', 'Client saves:')} {clientSaving} {t('ج.م', 'EGP')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown Box */}
                <div className="p-3.5 rounded-2xl bg-[#F7F7F3] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35] space-y-2 mb-4 text-xs">
                  {/* Retail vs Sales Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#646A63] dark:text-[#B5BDB3]">
                      {t('سعر المتجر (العميل):', 'Store Retail Price:')}
                    </span>
                    <span className="line-through text-[#646A63] dark:text-[#B5BDB3] font-mono">
                      {p.price.toLocaleString()} {t('ج.م', 'EGP')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E2E5DE] dark:border-[#353D35]">
                    <span className="font-bold text-[#20241F] dark:text-[#F3F5EF] flex items-center gap-1">
                      <Tag size={13} className="text-[#18794E] dark:text-[#65C98A]" />
                      <span>{t('سعر المندوب المعتمد:', 'Authorized Sales Price:')}</span>
                    </span>
                    <span className="font-black text-sm text-[#18794E] dark:text-[#65C98A] font-mono">
                      {salesPrice.toLocaleString()} {t('ج.م', 'EGP')}
                    </span>
                  </div>

                  {/* Commission Highlight */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E5DE] dark:border-[#353D35] bg-[#D5FF3F]/15 dark:bg-[#D5FF3F]/10 -mx-3.5 -mb-3.5 p-2.5 rounded-b-2xl">
                    <span className="font-bold text-[#20241F] dark:text-[#F3F5EF] flex items-center gap-1 text-[11px]">
                      <DollarSign size={13} className="text-[#18794E] dark:text-[#65C98A]" />
                      <span>{t('عمولتك المباشرة للقطعة:', 'Your Net Commission:')}</span>
                    </span>
                    <span className="font-black text-xs text-[#20241F] dark:text-[#D5FF3F] font-mono">
                      +{commission.toLocaleString()} {t('ج.م', 'EGP')} ({commissionPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {onSelectProductForOrder && (
                <button
                  type="button"
                  onClick={() => onSelectProductForOrder(p)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#20241F] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#111411] hover:bg-black dark:hover:bg-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingCart size={14} />
                  <span>{t('تسجيل طلب للعميل بهذا السعر', 'Create Order at Sales Price')}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
