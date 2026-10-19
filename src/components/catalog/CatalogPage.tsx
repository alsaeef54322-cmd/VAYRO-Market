import React, { useState, useMemo } from 'react';
import {
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Search,
  RotateCcw,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import { PRODUCTS, CATEGORIES } from '../../data/products';

export const CatalogPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const {
    selectedCategory,
    navigateToCategory,
    searchQuery,
    setSearchQuery,
    executeSearch,
    navigateToProduct,
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useStore();

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(4000);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Available unique colors and sizes for filter facet
  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    PRODUCTS.forEach((p) => {
      p.colors.forEach((c) => {
        if (!map.has(c.name_ar)) {
          map.set(c.name_ar, c.hex);
        }
      });
    });
    return Array.from(map.entries()).map(([name_ar, hex]) => ({ name_ar, hex }));
  }, []);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    PRODUCTS.forEach((p) => {
      p.sizes.forEach((s) => set.add(s));
    });
    return Array.from(set);
  }, []);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name_ar.toLowerCase().includes(q) ||
          p.name_en.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.subCategory_ar.toLowerCase().includes(q) ||
          p.description_ar.toLowerCase().includes(q)
      );
    }

    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    if (selectedColor) {
      result = result.filter((p) =>
        p.colors.some((c) => c.name_ar === selectedColor)
      );
    }

    if (selectedSize) {
      result = result.filter((p) => p.sizes.includes(selectedSize));
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [selectedCategory, searchQuery, minPrice, maxPrice, inStockOnly, selectedColor, selectedSize, sortBy]);

  const clearAllFilters = () => {
    navigateToCategory(null);
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(4000);
    setSelectedColor('');
    setSelectedSize('');
    setInStockOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters = Boolean(
    selectedCategory ||
    searchQuery ||
    minPrice > 0 ||
    maxPrice < 4000 ||
    selectedColor ||
    selectedSize ||
    inStockOnly
  );

  return (
    <div className="bg-[#F5F2E9] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-right">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#AAB5A0] font-bold block mb-1">
              {t('الكتالوج الكامل', 'COMPLETE STOREFRONT')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#111310] tracking-tight">
              {selectedCategory
                ? t(
                    CATEGORIES.find((c) => c.slug === selectedCategory)?.name_ar || 'القسم',
                    CATEGORIES.find((c) => c.slug === selectedCategory)?.name_en || 'Category'
                  )
                : searchQuery
                ? `${t('نتائج البحث عن:', 'Search results for:')} "${searchQuery}"`
                : t('جميع المنتجات المعروضة', 'All Curated Products')}
            </h1>
            <p className="text-xs text-[#111310]/60 mt-1">
              {t(`عرض ${filteredProducts.length} من أصل ${PRODUCTS.length} قطعة متاحة في مصر.`, `Displaying ${filteredProducts.length} of ${PRODUCTS.length} items in Egypt.`)}
            </p>
          </div>

          {/* Quick controls: mobile filter trigger, layout switch & sorter */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden py-2 px-3.5 rounded-xl bg-white border border-[#111310]/15 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <SlidersHorizontal size={14} />
              <span>{t('الفلاتر', 'Filters')}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#111310]" />
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#111310]/15 rounded-xl py-2 px-3 text-xs font-bold text-[#111310] focus:outline-none shadow-sm"
            >
              <option value="featured">{t('الترتيب: المختار للموسم', 'Sort: Editorial Featured')}</option>
              <option value="newest">{t('الأحدث وصولاً', 'Newest Drops')}</option>
              <option value="price-asc">{t('السعر: من الأقل للأعلى', 'Price: Low to High')}</option>
              <option value="price-desc">{t('السعر: من الأعلى للأقل', 'Price: High to Low')}</option>
              <option value="rating">{t('الأعلى تقييمًا', 'Customer Rating')}</option>
            </select>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-white border border-[#111310]/15 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-[#111310] text-[#D5FF3F]' : 'text-[#111310]/60 hover:text-black'
                }`}
                title="Grid view"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-[#111310] text-[#D5FF3F]' : 'text-[#111310]/60 hover:text-black'
                }`}
                title="List view"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 text-right no-scrollbar">
          <button
            onClick={() => navigateToCategory(null)}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
              !selectedCategory
                ? 'bg-[#111310] text-[#D5FF3F] shadow-sm'
                : 'bg-white border border-[#111310]/10 text-[#111310] hover:bg-[#EAE6DC]'
            }`}
          >
            {t('جميع الأقسام', 'All Departments')}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigateToCategory(cat.slug)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.slug
                  ? 'bg-[#111310] text-[#D5FF3F] shadow-sm'
                  : 'bg-white border border-[#111310]/10 text-[#111310] hover:bg-[#EAE6DC]'
              }`}
            >
              {t(cat.name_ar, cat.name_en)} ({cat.itemCount})
            </button>
          ))}
        </div>

        {/* Main Grid: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar (3 Cols) */}
          <div className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-3xl border border-[#111310]/10 shadow-sm text-right sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-[#111310]/10 mb-6">
              <span className="font-bold text-sm text-[#111310] flex items-center gap-1.5">
                <SlidersHorizontal size={15} />
                <span>{t('تصفية النتائج', 'Filter Catalog')}</span>
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw size={12} />
                  <span>{t('إعادة ضبط', 'Reset')}</span>
                </button>
              )}
            </div>

            {/* Price Range Slider */}
            <div className="mb-6">
              <label className="text-xs font-bold text-[#111310] block mb-2">
                {t('النطاق السعري:', 'Price Range:')} <span className="text-[#586249]">{minPrice} - {maxPrice} {t('ج.م', 'EGP')}</span>
              </label>
              <input
                type="range"
                min="0"
                max="4000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#111310] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#111310]/50 mt-1">
                <span>0 ج.م</span>
                <span>4,000 ج.م</span>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="mb-6 pb-6 border-b border-[#111310]/10">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#111310]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-[#111310]/20 text-[#111310] focus:ring-0 w-4 h-4"
                />
                <span>{t('المتوفر في المخازن فقط (جاهز للشحن الفوري)', 'In Stock Only (Ready to ship)')}</span>
              </label>
            </div>

            {/* Colors */}
            <div className="mb-6 pb-6 border-b border-[#111310]/10">
              <label className="text-xs font-bold text-[#111310] block mb-3">
                {t('اللون:', 'Color:')} {selectedColor && <span className="text-xs font-normal text-[#586249]">({selectedColor})</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {allColors.map((col) => (
                  <button
                    key={col.name_ar}
                    onClick={() => setSelectedColor(selectedColor === col.name_ar ? '' : col.name_ar)}
                    className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === col.name_ar ? 'border-[#111310] ring-2 ring-[#D5FF3F] scale-110' : 'border-black/10'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name_ar}
                  >
                    {selectedColor === col.name_ar && (
                      <Check size={12} className={col.hex === '#111310' ? 'text-white' : 'text-black'} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="text-xs font-bold text-[#111310] block mb-3">
                {t('المقاس المتاح:', 'Size:')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      selectedSize === sz
                        ? 'bg-[#111310] text-[#D5FF3F]'
                        : 'bg-[#F5F2E9] text-[#111310] hover:bg-[#EAE6DC]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Products Results Column (9 Cols) */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#111310]/10">
                <Search size={36} className="mx-auto text-[#111310]/30 mb-4" />
                <h3 className="text-lg font-bold text-[#111310]">
                  {t('لم نجد منتجات تطابق اختياراتك الحالية', 'No products match your criteria')}
                </h3>
                <p className="text-xs text-[#111310]/60 mt-1 max-w-sm mx-auto">
                  {t('جرب تقليل الفلاتر أو البحث بكلمات عامة مثل قميص، حقيبة، فازة أو نظارة.', 'Try resetting your filters or searching broader keywords like shirts, bags, or ceramics.')}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 py-2.5 px-6 rounded-xl bg-[#111310] text-[#D5FF3F] font-bold text-xs hover:bg-black transition-all"
                >
                  {t('إعادة ضبط كافة الفلاتر', 'Reset All Filters')}
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            ) : (
              /* List Mode */
              <div className="space-y-4">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => navigateToProduct(prod.id)}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-[#111310]/10 hover:border-[#111310] transition-all flex flex-col sm:flex-row gap-5 items-center cursor-pointer group text-right"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name_ar}
                      className="w-full sm:w-36 h-44 object-cover rounded-xl bg-[#F5F2E9] shrink-0"
                    />
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-center text-xs text-[#111310]/60 mb-1">
                        <span className="font-mono uppercase font-bold text-[#AAB5A0]">{prod.brand}</span>
                        <span className="text-[11px] font-bold text-[#586249]">{t(prod.madeIn_ar, prod.madeIn_en)}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#111310] group-hover:text-black">
                        {t(prod.name_ar, prod.name_en)}
                      </h3>
                      <p className="text-xs text-[#111310]/70 mt-1 line-clamp-2">
                        {t(prod.description_ar, prod.description_en)}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#111310]/10 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-[#111310]">
                            {prod.price.toLocaleString()} {t('ج.م', 'EGP')}
                          </span>
                          {prod.compareAtPrice && (
                            <span className="text-xs text-[#111310]/40 line-through">
                              {prod.compareAtPrice.toLocaleString()} {t('ج.م', 'EGP')}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(prod, 1);
                          }}
                          className="py-2 px-4 rounded-xl bg-[#111310] text-[#D5FF3F] text-xs font-bold hover:bg-black transition-colors"
                        >
                          {t('إضافة للسلة', 'Add to Bag')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Filters Slide-over Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-[#111310]/70 backdrop-blur-sm flex justify-end lg:hidden">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col text-right overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#111310]/10 mb-6">
              <span className="font-bold text-base text-[#111310]">{t('تصفية المنتجات', 'Filters')}</span>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 rounded-lg hover:bg-black/5">
                <X size={20} />
              </button>
            </div>

            {/* Price */}
            <div className="mb-6">
              <label className="text-xs font-bold text-[#111310] block mb-2">
                {t('الحد الأقصى للسعر:', 'Max Price:')} <strong>{maxPrice} {t('ج.م', 'EGP')}</strong>
              </label>
              <input
                type="range"
                min="0"
                max="4000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#111310]"
              />
            </div>

            {/* Colors */}
            <div className="mb-6">
              <label className="text-xs font-bold text-[#111310] block mb-2">{t('الألوان:', 'Colors:')}</label>
              <div className="flex flex-wrap gap-2">
                {allColors.map((col) => (
                  <button
                    key={col.name_ar}
                    onClick={() => setSelectedColor(selectedColor === col.name_ar ? '' : col.name_ar)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      selectedColor === col.name_ar ? 'border-[#111310] ring-2 ring-[#D5FF3F]' : 'border-black/10'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-[#111310]/10 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-3 rounded-xl border border-[#111310]/20 text-xs font-bold"
              >
                {t('إعادة ضبط', 'Reset')}
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#111310] text-[#D5FF3F] text-xs font-bold"
              >
                {t('تطبيق النتائج', 'Show Results')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
