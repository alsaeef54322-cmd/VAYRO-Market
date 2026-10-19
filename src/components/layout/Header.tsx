import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Globe,
  Building2,
  PhoneCall,
  ArrowRight,
  Sparkles,
  Lock,
  LogOut,
  Clock,
  Trash2,
  TrendingUp,
  Sun,
  Moon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { PRODUCTS, CATEGORIES } from '../../data/products';

export const Header: React.FC = () => {
  const { language, toggleLanguage, t, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const {
    cartItemsCount,
    wishlist,
    setIsCartDrawerOpen,
    setCurrentPage,
    navigateToCategory,
    navigateToProduct,
    executeSearch,
    currentPage,
    currentUser,
    openAuthModal,
    logoutCustomer,
    isStaffAuthenticated
  } = useStore();

  const [searchInput, setSearchInput] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Recent searches state persisted to localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('vayro_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ['قميص كتان', 'فخار الفيوم', 'سنيكرز إيطالي', 'شنطة جلد طبيعي'];
  });

  // Popular / Trending search tags for quick discovery
  const POPULAR_SEARCH_TAGS = [
    { ar: 'قمصان كتان', en: 'Linen Shirts' },
    { ar: 'فخار الفيوم', en: 'Fayoum Pottery' },
    { ar: 'سنيكرز جلد', en: 'Leather Sneakers' },
    { ar: 'حقائب مجدولة', en: 'Braided Bags' },
    { ar: 'عروض الموسم', en: 'Seasonal Drops' }
  ];

  const addRecentSearch = (query: string) => {
    const clean = query.trim();
    if (!clean || clean.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('vayro_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== query);
      try {
        localStorage.setItem('vayro_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('vayro_recent_searches');
    } catch {}
  };

  const handleSelectQuery = (query: string) => {
    setSearchInput(query);
    addRecentSearch(query);
    executeSearch(query);
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
  };

  // Live search suggestions
  const searchSuggestions = searchInput.trim().length > 1
    ? PRODUCTS.filter((p) =>
        p.name_ar.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.name_en.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.subCategory_ar.toLowerCase().includes(searchInput.toLowerCase())
      ).slice(0, 4)
    : [];

  // Recent searches matching the active query (if typing)
  const matchingRecentSearches = searchInput.trim().length > 1
    ? recentSearches.filter((item) => item.toLowerCase().includes(searchInput.trim().toLowerCase()))
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(e.target as Node)) {
        setIsMobileSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      addRecentSearch(searchInput.trim());
      executeSearch(searchInput.trim());
      setIsSearchFocused(false);
      setIsMobileSearchFocused(false);
    }
  };

  const handleAccountClick = () => {
    if (currentUser) {
      setCurrentPage('account');
    } else {
      openAuthModal('login');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F7F3]/95 dark:bg-[#111411]/95 backdrop-blur-md border-b border-[#20241F]/10 dark:border-[#353D35] transition-colors">
      {/* Top Utility Announcement Bar */}
      <div className="bg-[#20241F] text-white text-[11px] sm:text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#D5FF3F]">
              <Sparkles size={12} />
              <span>{t('كوبون أول طلب:', 'First order code:')} <strong className="font-mono tracking-wider">VAYRO10</strong> {t('(خصم 10%)', '(10% OFF)')}</span>
            </span>
            <span className="hidden md:inline text-white/30">|</span>
            <span className="hidden md:inline text-white/70">
              {t('توصيل سريع وموثوق لكافة محافظات مصر لباب المنزل', 'Fast & reliable door-to-door delivery across all Egyptian governorates')}
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Wholesale link */}
            <button
              onClick={() => setCurrentPage('wholesale')}
              className="hidden sm:flex items-center gap-1.5 text-white/80 hover:text-[#D5FF3F] transition-colors"
            >
              <Building2 size={13} />
              <span>{t('تجارة الجملة والشركات', 'B2B & Wholesale')}</span>
            </button>

            <span className="hidden sm:inline text-white/30">|</span>

            {/* Sales Representative Portal Link */}
            <button
              onClick={() => setCurrentPage(isStaffAuthenticated ? 'crm' : 'sales-login')}
              className="hidden sm:flex items-center gap-1 text-white/80 hover:text-[#D5FF3F] transition-colors text-[11px]"
              title={t('بوابة فريق ومندوبي المبيعات', 'Sales Rep Portal')}
            >
              <Lock size={11} className="text-[#D5FF3F]" />
              <span>{t('بوابة المبيعات', 'Sales Portal')}</span>
            </button>

            <span className="hidden sm:inline text-white/30">|</span>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-white/90 hover:text-[#D5FF3F] font-semibold transition-colors text-xs"
              title="Change language"
            >
              <Globe size={13} />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            <span className="text-white/30">|</span>

            {/* Dark / Light Mode Switch (Icon Only, No Text) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center p-1 rounded-md text-white/90 hover:text-[#D5FF3F] hover:bg-white/10 active:scale-90 transition-all"
              title={theme === 'dark' ? t('الوضع النهاري', 'Light Mode') : t('الوضع الليلي', 'Dark Mode')}
              aria-label={theme === 'dark' ? t('الوضع النهاري', 'Light Mode') : t('الوضع الليلي', 'Dark Mode')}
            >
              {theme === 'dark' ? (
                <Sun size={14} className="text-[#D5FF3F] transition-transform hover:rotate-45" />
              ) : (
                <Moon size={14} className="text-white/90 hover:text-[#D5FF3F] transition-transform hover:-rotate-12" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 text-[#20241F] hover:bg-[#20241F]/5 rounded-xl transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 group text-left"
          >
            <span className="font-display font-black text-2xl sm:text-3xl tracking-tight text-[#20241F] flex items-center">
              VAYRO
              <span className="inline-block w-2.5 h-2.5 ml-1 mr-1 bg-[#D5FF3F] rounded-[2px] group-hover:rotate-45 transition-transform" />
            </span>
            <span className="hidden sm:inline-block text-[10px] tracking-widest uppercase font-mono px-1.5 py-0.5 rounded bg-[#20241F] text-[#D5FF3F] font-semibold">
              MARKET
            </span>
          </button>
        </div>

        {/* Search Bar with live autocomplete and Recent Searches */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-2 hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={t('ابحث عن منتج، علامة تجارية، خامة...', 'Search products, brands, materials...')}
              className="w-full bg-white text-[#20241F] text-sm py-2.5 px-10 rounded-xl border border-[#20241F]/15 focus:outline-none focus:border-[#20241F] focus:ring-2 focus:ring-[#D5FF3F]/40 transition-all placeholder:text-[#20241F]/40 shadow-xs"
            />
            <Search
              size={18}
              className={`absolute top-1/2 -translate-y-1/2 text-[#20241F]/50 pointer-events-none ${
                dir === 'rtl' ? 'right-3.5' : 'left-3.5'
              }`}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className={`absolute top-1/2 -translate-y-1/2 text-xs text-[#20241F]/40 hover:text-[#20241F] p-1 ${
                  dir === 'rtl' ? 'left-3' : 'right-3'
                }`}
              >
                ✕
              </button>
            )}
          </form>

          {/* Autocomplete & Recent Searches Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-[#20241F]/10 overflow-hidden z-50 text-right animate-in fade-in-50 duration-200">
              {/* STATE 1: Empty input -> Show Recent Searches & Trending */}
              {searchInput.trim().length <= 1 ? (
                <div>
                  {/* Recent Searches Section */}
                  <div className="p-3.5 border-b border-[#20241F]/5">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#20241F]">
                        <Clock size={14} className="text-[#18794E]" />
                        <span>{t('عمليات البحث الأخيرة', 'Recent Searches')}</span>
                      </div>
                      {recentSearches.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAllRecentSearches}
                          className="text-[11px] text-[#20241F]/50 hover:text-rose-600 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={11} />
                          <span>{t('مسح السجل', 'Clear all')}</span>
                        </button>
                      )}
                    </div>

                    {recentSearches.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((query) => (
                          <div
                            key={query}
                            onClick={() => handleSelectQuery(query)}
                            className="group inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#F7F7F3] hover:bg-[#ECEAE1] text-xs text-[#20241F] cursor-pointer transition-all border border-[#20241F]/5 hover:border-[#18794E]/30"
                          >
                            <Clock size={11} className="text-[#20241F]/40 group-hover:text-[#18794E]" />
                            <span className="font-medium">{query}</span>
                            <button
                              type="button"
                              onClick={(e) => removeRecentSearch(e, query)}
                              className="p-0.5 rounded-full hover:bg-black/10 text-[#20241F]/30 hover:text-rose-600 transition-colors"
                              title={t('حذف من السجل', 'Remove')}
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#20241F]/40 py-1">
                        {t('لا توجد عمليات بحث سابقة محفوظة حتى الآن.', 'No recent searches saved yet.')}
                      </p>
                    )}
                  </div>

                  {/* Trending / Popular Keywords Section */}
                  <div className="p-3.5 bg-[#FAF9F5] border-b border-[#20241F]/5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#20241F] mb-2">
                      <TrendingUp size={13} className="text-[#18794E]" />
                      <span>{t('الأكثر بحثاً في متجر VAYRO', 'Trending on VAYRO')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_SEARCH_TAGS.map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectQuery(language === 'ar' ? tag.ar : tag.en)}
                          className="text-xs py-1 px-2.5 rounded-lg bg-white hover:bg-[#D5FF3F]/40 border border-[#20241F]/10 hover:border-[#18794E]/40 font-medium text-[#20241F] transition-all flex items-center gap-1"
                        >
                          <span className="text-[10px] text-[#18794E] font-bold">#</span>
                          <span>{t(tag.ar, tag.en)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Category Discovery Shortcuts */}
                  <div className="p-3 flex items-center justify-between text-xs text-[#20241F]/70">
                    <span className="text-[11px] font-semibold text-[#20241F]/50">
                      {t('أقسام سريعة:', 'Quick links:')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigateToCategory('men');
                          setIsSearchFocused(false);
                        }}
                        className="hover:text-[#18794E] underline text-[11px]"
                      >
                        {t('رجالي', 'Men')}
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => {
                          navigateToCategory('women');
                          setIsSearchFocused(false);
                        }}
                        className="hover:text-[#18794E] underline text-[11px]"
                      >
                        {t('حريمي', 'Women')}
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => {
                          navigateToCategory('home');
                          setIsSearchFocused(false);
                        }}
                        className="hover:text-[#18794E] underline text-[11px]"
                      >
                        {t('فخار وديكور', 'Home')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* STATE 2: User is typing -> Show matching recent queries + live product matches */
                <div>
                  {/* Matching Recent Queries Pill Header */}
                  {matchingRecentSearches.length > 0 && (
                    <div className="p-2.5 bg-[#FAF9F5] border-b border-[#20241F]/5 flex items-center gap-2 overflow-x-auto text-xs">
                      <span className="text-[11px] text-[#20241F]/50 font-bold shrink-0 flex items-center gap-1">
                        <Clock size={12} className="text-[#18794E]" />
                        <span>{t('من سجلك:', 'From history:')}</span>
                      </span>
                      {matchingRecentSearches.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleSelectQuery(item)}
                          className="shrink-0 px-2 py-0.5 rounded-md bg-white border border-[#20241F]/10 text-[11px] hover:border-[#18794E] font-medium text-[#20241F]"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Product Suggestions List */}
                  {searchSuggestions.length > 0 ? (
                    <div>
                      <div className="p-2 px-3 border-b border-[#20241F]/5 flex items-center justify-between text-xs text-[#20241F]/60">
                        <span>{t('اقتراحات المنتجات', 'Matching Products')}</span>
                        <span>{searchSuggestions.length} {t('نتائج مقترحة', 'results')}</span>
                      </div>
                      <div className="divide-y divide-[#20241F]/5 max-h-80 overflow-y-auto">
                        {searchSuggestions.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              addRecentSearch(product.name_ar);
                              navigateToProduct(product.id);
                              setIsSearchFocused(false);
                              setSearchInput('');
                            }}
                            className="w-full p-2.5 px-3 flex items-center gap-3 hover:bg-[#F7F7F3] transition-colors text-right group"
                          >
                            <img
                              src={product.images[0]}
                              alt={product.name_ar}
                              className="w-11 h-11 object-cover rounded-lg bg-gray-100 shrink-0 border border-[#20241F]/5 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-1 text-right min-w-0">
                              <p className="text-xs font-bold text-[#20241F] truncate group-hover:text-[#18794E] transition-colors">
                                {t(product.name_ar, product.name_en)}
                              </p>
                              <p className="text-[11px] text-[#20241F]/60 truncate">{product.brand} • {t(product.subCategory_ar, product.subCategory_en)}</p>
                            </div>
                            <span className="text-xs font-bold text-[#20241F] font-mono shrink-0">
                              {product.price.toLocaleString()} {t('ج.م', 'EGP')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-[#20241F]/60">
                      <p className="font-semibold text-[#20241F]">
                        {t(`لم نجد منتجات مباشرة مطابقة لـ "${searchInput}"`, `No direct matches for "${searchInput}"`)}
                      </p>
                      <p className="text-[11px] text-[#20241F]/40 mt-1">
                        {t('اضغط على "عرض جميع النتائج" للبحث في الكتالوج الشامل أو جرّب كلمات أكثر عمومية.', 'Click view all to search full catalog or try broader keywords.')}
                      </p>
                    </div>
                  )}

                  {/* View All Matches Button */}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 px-4 bg-[#F7F7F3] hover:bg-[#ECEAE1] text-xs font-bold text-[#20241F] flex items-center justify-center gap-1.5 transition-colors border-t border-[#20241F]/5"
                  >
                    <span>{t(`عرض جميع نتائج البحث لـ "${searchInput}"`, `View all results for "${searchInput}"`)}</span>
                    <ArrowRight size={13} className={dir === 'rtl' ? 'rotate-180' : ''} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: Customer Account, Wishlist, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Customer Account Button */}
          <button
            onClick={handleAccountClick}
            className={`py-2 px-3 rounded-xl border border-transparent hover:border-[#20241F]/15 hover:bg-white text-[#20241F] transition-all flex items-center gap-2 ${
              currentPage === 'account' ? 'bg-white shadow-sm border-[#20241F]/15' : ''
            }`}
            title={currentUser ? t('حسابي والطلبات', 'My Account') : t('تسجيل الدخول / إنشاء حساب', 'Sign In / Register')}
          >
            <User size={19} className={currentUser ? 'text-[#18794E]' : 'text-[#20241F]'} />
            <div className="text-right hidden md:block">
              <span className="block text-xs font-bold leading-tight">
                {currentUser ? currentUser.name.split(' ')[0] : t('حسابي', 'My Account')}
              </span>
              <span className="block text-[10px] text-[#20241F]/50 leading-none">
                {currentUser ? t('الطلبات والمفضلة', 'Orders') : t('تسجيل الدخول', 'Sign In')}
              </span>
            </div>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => setCurrentPage('wishlist')}
            className={`relative p-2.5 rounded-xl border border-transparent hover:border-[#20241F]/10 hover:bg-white text-[#20241F] transition-colors ${
              currentPage === 'wishlist' ? 'bg-white shadow-sm border-[#20241F]/15' : ''
            }`}
            title={t('قائمة المفضلة', 'Wishlist')}
          >
            <Heart size={20} className={wishlist.length > 0 ? 'fill-[#20241F]' : ''} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#20241F] text-[#D5FF3F] text-[10px] font-bold flex items-center justify-center shadow-sm">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Bag Trigger */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center gap-2.5 py-2 px-3.5 rounded-xl bg-[#20241F] text-white hover:bg-black transition-all shadow-md group"
          >
            <ShoppingBag size={18} className="text-[#D5FF3F]" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-mono text-[#D5FF3F] leading-none">
                {t('السلة', 'Bag')}
              </span>
              <span className="text-xs font-bold leading-tight">
                {cartItemsCount} {t('عناصر', 'items')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search input row with Recent Searches */}
      <div ref={mobileSearchContainerRef} className="px-4 pb-3 sm:hidden relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => setIsMobileSearchFocused(true)}
            placeholder={t('ابحث في متجر VAYRO...', 'Search VAYRO Market...')}
            className="w-full bg-white text-[#20241F] text-sm py-2.5 px-9 rounded-xl border border-[#20241F]/15 focus:outline-none focus:border-[#20241F] focus:ring-2 focus:ring-[#D5FF3F]/40 placeholder:text-[#20241F]/40"
          />
          <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-[#20241F]/50 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className={`absolute top-1/2 -translate-y-1/2 text-xs text-[#20241F]/40 hover:text-[#20241F] p-1 ${
                dir === 'rtl' ? 'left-3' : 'right-3'
              }`}
            >
              ✕
            </button>
          )}
        </form>

        {/* Mobile Search Dropdown */}
        {isMobileSearchFocused && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-white rounded-2xl shadow-2xl border border-[#20241F]/10 overflow-hidden z-50 text-right animate-in fade-in-50 duration-200">
            {searchInput.trim().length <= 1 ? (
              <div>
                {/* Mobile Recent Searches */}
                <div className="p-3 border-b border-[#20241F]/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#20241F]">
                      <Clock size={13} className="text-[#18794E]" />
                      <span>{t('عمليات البحث الأخيرة', 'Recent Searches')}</span>
                    </div>
                    {recentSearches.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllRecentSearches}
                        className="text-[11px] text-[#20241F]/50 hover:text-rose-600 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={11} />
                        <span>{t('مسح', 'Clear')}</span>
                      </button>
                    )}
                  </div>

                  {recentSearches.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((query) => (
                        <div
                          key={query}
                          onClick={() => handleSelectQuery(query)}
                          className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#F7F7F3] text-xs text-[#20241F] cursor-pointer border border-[#20241F]/5"
                        >
                          <Clock size={10} className="text-[#20241F]/40" />
                          <span className="font-medium">{query}</span>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(e, query)}
                            className="p-0.5 text-[#20241F]/30 hover:text-rose-600"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#20241F]/40 py-1">
                      {t('لا توجد عمليات بحث سابقة.', 'No recent searches.')}
                    </p>
                  )}
                </div>

                {/* Mobile Trending */}
                <div className="p-3 bg-[#FAF9F5]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#20241F] mb-2">
                    <TrendingUp size={12} className="text-[#18794E]" />
                    <span>{t('الأكثر بحثاً', 'Trending')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SEARCH_TAGS.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectQuery(language === 'ar' ? tag.ar : tag.en)}
                        className="text-xs py-1 px-2 rounded-lg bg-white border border-[#20241F]/10 font-medium text-[#20241F]"
                      >
                        <span className="text-[10px] text-[#18794E]">#</span> {t(tag.ar, tag.en)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {searchSuggestions.length > 0 ? (
                  <div className="divide-y divide-[#20241F]/5 max-h-72 overflow-y-auto">
                    {searchSuggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          addRecentSearch(product.name_ar);
                          navigateToProduct(product.id);
                          setIsMobileSearchFocused(false);
                          setSearchInput('');
                        }}
                        className="w-full p-2.5 flex items-center gap-2.5 text-right hover:bg-[#F7F7F3]"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name_ar}
                          className="w-10 h-10 object-cover rounded-lg bg-gray-100 shrink-0"
                        />
                        <div className="flex-1 text-right min-w-0">
                          <p className="text-xs font-bold text-[#20241F] truncate">{t(product.name_ar, product.name_en)}</p>
                          <p className="text-[10px] text-[#20241F]/50 truncate">{product.brand}</p>
                        </div>
                        <span className="text-xs font-bold text-[#20241F] font-mono shrink-0">
                          {product.price} {t('ج.م', 'EGP')}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-[#20241F]/60">
                    {t(`لم نجد منتجات مطابقة لـ "${searchInput}"`, `No products found for "${searchInput}"`)}
                  </div>
                )}
                <button
                  onClick={handleSearchSubmit}
                  className="w-full py-2.5 bg-[#F7F7F3] text-xs font-bold text-[#20241F] flex items-center justify-center gap-1 border-t border-[#20241F]/5"
                >
                  <span>{t('عرض جميع النتائج', 'View all matching results')}</span>
                  <ArrowRight size={12} className={dir === 'rtl' ? 'rotate-180' : ''} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Navigation Bar */}
      <div className="border-t border-[#20241F]/10 bg-[#ECEAE1]/50 hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs font-medium text-[#20241F]">
          <div className="flex items-center gap-7">
            {/* All categories button */}
            <div className="relative">
              <button
                onClick={() => setIsCategoriesDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 font-bold text-[#20241F] hover:text-[#18794E] py-1 transition-colors"
              >
                <span>{t('كل الأقسام', 'All Categories')}</span>
                <ChevronDown size={14} className={isCategoriesDropdownOpen ? 'rotate-180 transition-transform' : ''} />
              </button>

              {isCategoriesDropdownOpen && (
                <div
                  onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
                  className="absolute top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#20241F]/10 p-2 z-50 text-right"
                >
                  <button
                    onClick={() => {
                      navigateToCategory(null);
                      setIsCategoriesDropdownOpen(false);
                    }}
                    className="w-full text-right p-2.5 rounded-xl hover:bg-[#F7F7F3] font-bold text-xs"
                  >
                    {t('جميع المنتجات بدون استثناء', 'All Catalog Products')}
                  </button>
                  <div className="border-t border-[#20241F]/5 my-1" />
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        navigateToCategory(cat.slug);
                        setIsCategoriesDropdownOpen(false);
                      }}
                      className="w-full text-right p-2.5 rounded-xl hover:bg-[#F7F7F3] flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold">{t(cat.name_ar, cat.name_en)}</span>
                      <span className="text-[10px] text-[#20241F]/50">{cat.itemCount} {t('قطعة', 'items')}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Categories */}
            <button
              onClick={() => navigateToCategory('women')}
              className="hover:text-black hover:font-bold transition-all py-1"
            >
              {t('أزياء نسائية', "Women's Fashion")}
            </button>
            <button
              onClick={() => navigateToCategory('men')}
              className="hover:text-black hover:font-bold transition-all py-1"
            >
              {t('أزياء رجالية', "Men's Fashion")}
            </button>
            <button
              onClick={() => navigateToCategory('accessories')}
              className="hover:text-black hover:font-bold transition-all py-1"
            >
              {t('إكسسوارات', 'Accessories')}
            </button>
            <button
              onClick={() => navigateToCategory('home')}
              className="hover:text-black hover:font-bold transition-all py-1"
            >
              {t('البيت والمعيشة', 'Home & Living')}
            </button>
            <button
              onClick={() => navigateToCategory('beauty')}
              className="hover:text-black hover:font-bold transition-all py-1"
            >
              {t('الجمال والعناية', 'Beauty & Care')}
            </button>
            <button
              onClick={() => navigateToCategory('shoes')}
              className="hover:text-black hover:font-bold transition-all py-1"
            >
              {t('أحذية وسنيكرز', 'Footwear')}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => executeSearch('عروض')}
              className="text-[#20241F] font-bold flex items-center gap-1 hover:text-red-700 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              <span>{t('عروض وتخفيضات', 'Special Offers')}</span>
            </button>
            <span className="text-[#20241F]/20">|</span>
            <span className="text-[#20241F]/70 flex items-center gap-1">
              <PhoneCall size={12} />
              <span dir="ltr">19820</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#20241F]/70 backdrop-blur-sm lg:hidden flex">
          <div className="w-full h-screen bg-[#F7F7F3] shadow-2xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#20241F]/10">
              <span className="font-display font-black text-2xl tracking-tight text-[#20241F]">
                VAYRO <span className="text-[#18794E]">MARKET</span>
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5"
              >
                <X size={22} />
              </button>
            </div>

            {/* Mobile User Status */}
            <div className="py-4 border-b border-[#20241F]/10">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#20241F]">{currentUser.name}</p>
                    <p className="text-[11px] text-[#20241F]/60" dir="ltr">{currentUser.phone}</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage('account');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs font-bold text-[#18794E] underline"
                  >
                    {t('حسابي', 'Account')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      openAuthModal('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold"
                  >
                    {t('تسجيل الدخول', 'Sign In')}
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal('register');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 rounded-xl border border-[#20241F]/20 text-xs font-bold"
                  >
                    {t('حساب جديد', 'Register')}
                  </button>
                </div>
              )}

              {/* Wishlist Link for Mobile */}
              <button
                onClick={() => {
                  setCurrentPage('wishlist');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-[#F7F7F3] border border-[#20241F]/10 text-xs font-bold flex items-center justify-between text-[#20241F]"
              >
                <span className="flex items-center gap-2">
                  <Heart size={14} className={wishlist.length > 0 ? 'fill-[#20241F]' : ''} />
                  <span>{t('قائمة المفضلة', 'Wishlist')}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#20241F] text-[#D5FF3F] text-[10px] font-mono font-bold">
                  {wishlist.length}
                </span>
              </button>
            </div>

            <div className="py-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#20241F]/50 mb-2 text-right">
                {t('تصفح الأقسام', 'Browse Categories')}
              </p>
              <button
                onClick={() => {
                  navigateToCategory(null);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-right py-2 text-sm font-bold text-[#20241F]"
              >
                {t('جميع المنتجات', 'All Products')}
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    navigateToCategory(cat.slug);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-right py-2 text-sm font-medium text-[#20241F]/80 hover:text-black"
                >
                  {t(cat.name_ar, cat.name_en)}
                </button>
              ))}
            </div>

            <div className="border-t border-[#20241F]/10 py-4 space-y-3">
              <button
                onClick={() => {
                  setCurrentPage('wholesale');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold flex items-center justify-center gap-2"
              >
                <Building2 size={15} />
                <span>{t('تجارة الجملة والطلبات الكبرى', 'B2B Wholesale Portal')}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage(isStaffAuthenticated ? 'crm' : 'sales-login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-4 rounded-xl border border-[#20241F]/15 text-xs font-bold flex items-center justify-center gap-2 text-[#20241F]"
              >
                <Lock size={13} className="text-[#18794E]" />
                <span>{t('بوابة المبيعات الداخلية (Sales Portal)', 'Internal Sales Portal')}</span>
              </button>


              <button
                onClick={() => {
                  toggleLanguage();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-4 rounded-xl border border-[#20241F]/15 text-xs font-bold flex items-center justify-center gap-2 text-[#20241F]"
              >
                <Globe size={15} />
                <span>{language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}</span>
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-[#20241F]/10 text-xs text-[#20241F]/60 text-right">
              <p className="font-semibold text-[#20241F]">VAYRO Market Egypt</p>
              <p className="text-[11px] mt-1">{t('خدمة العملاء متوفرة 24/7', 'Customer support available 24/7')}</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
