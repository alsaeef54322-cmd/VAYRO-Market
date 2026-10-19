import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, UserAccount, ProductReview, StaffMember } from '../types';
import { PRODUCTS } from '../data/products';
import { api } from '../services/api';

export type PageType =
  | 'home'
  | 'catalog'
  | 'product'
  | 'checkout'
  | 'order-success'
  | 'account'
  | 'wholesale'
  | 'crm'
  | 'sales-login'
  | 'wishlist'
  | 'admin'
  | 'admin-login';

interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface StoreContextType {
  // Navigation / views
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  selectedProductId: string | null;
  navigateToProduct: (productId: string) => void;
  selectedCategory: string | null;
  navigateToCategory: (category: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  executeSearch: (query: string) => void;

  // Products & Pricing Engine
  products: Product[];
  refreshProducts: () => void;
  updateProductPrices: (
    productId: string,
    updates: {
      price?: number;
      salesPrice?: number;
      wholesalePrice?: number;
      supplierCost?: number;
      salesCommission?: number;
      stock?: number;
    }
  ) => void;
  updateProductStock: (productId: string, newStock: number) => void;

  // Quick View Modal
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string, customUnitPrice?: number) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (isOpen: boolean) => void;
  cartSubtotal: number;
  cartItemsCount: number;
  freeShippingThreshold: number;
  amountUntilFreeShipping: number;

  // Coupons
  appliedCoupon: { code: string; discountPercentage: number } | null;
  setAppliedCoupon: (coupon: { code: string; discountPercentage: number } | null) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  moveItemToCart: (product: Product) => void;
  moveAllWishlistToCart: () => void;

  // Customer Reviews & Ratings
  reviews: ProductReview[];
  getProductReviews: (productId: string) => ProductReview[];
  submitProductReview: (reviewData: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount'>) => ProductReview;
  voteReviewHelpful: (reviewId: string) => void;
  checkUserPurchased: (productId: string) => { purchased: boolean; orderNumber?: string; orderDate?: string };
  isReviewModalOpen: boolean;
  reviewModalProduct: Product | null;
  reviewModalOrderNumber?: string;
  openReviewModal: (product: Product, orderNumber?: string) => void;
  closeReviewModal: () => void;

  // Checkout & Placed Orders
  latestOrder: Order | null;
  setLatestOrder: (order: Order | null) => void;

  // Customer Authentication & Session
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot_password';
  openAuthModal: (mode?: 'login' | 'register' | 'forgot_password') => void;
  closeAuthModal: () => void;
  logoutCustomer: () => void;

  // Staff Sales Rep Portal
  isStaffAuthenticated: boolean;
  setIsStaffAuthenticated: (val: boolean) => void;
  currentStaffRep: string;
  setCurrentStaffRep: (rep: string) => void;

  // VAYRO Business Admin Operations
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (val: boolean) => void;
  adminStaffUser: StaffMember | null;
  loginAdmin: (pinOrCode: string) => boolean;
  logoutAdmin: () => void;

  // Toasts
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPageState] = useState<PageType>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin' || path.startsWith('/admin/dashboard')) {
        return 'admin';
      }
      if (path === '/admin/login' || path.startsWith('/admin/login')) {
        return 'admin-login';
      }
      if (path === '/sales/login' || path.startsWith('/sales/login')) {
        return 'sales-login';
      }
      if (path === '/sales' || path.startsWith('/sales/portal')) {
        return 'crm';
      }
    }
    return 'home';
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercentage: number } | null>(null);

  // Managed Products State (updated in realtime by Admin)
  const [products, setProducts] = useState<Product[]>(() => api.getManagedProducts());

  const refreshProducts = () => {
    setProducts([...api.getManagedProducts()]);
  };

  const updateProductPrices = (
    productId: string,
    updates: {
      price?: number;
      salesPrice?: number;
      wholesalePrice?: number;
      supplierCost?: number;
      salesCommission?: number;
      stock?: number;
    }
  ) => {
    const updated = api.updateProductPrices(productId, updates, adminStaffUser?.name || 'Super Admin');
    if (updated) {
      refreshProducts();
      showToast(`تم تحديث أسعار منتج "${updated.name_ar}" بنجاح!`, 'success');
    }
  };

  const updateProductStock = (productId: string, newStock: number) => {
    const updated = api.updateProductStock(productId, newStock, adminStaffUser?.name || 'إدارة العمليات');
    if (updated) {
      refreshProducts();
      showToast(`تم تحديث مخزون "${updated.name_ar}" إلى ${newStock} قطعة`, 'info');
    }
  };

  // Customer Auth
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => api.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  // Staff Sales Rep State
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vayro_staff_auth') === 'true';
  });
  const [currentStaffRep, setCurrentStaffRep] = useState<string>('كريم زكي');

  // VAYRO Business Admin Operations State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vayro_admin_auth') === 'true';
  });
  const [adminStaffUser, setAdminStaffUser] = useState<StaffMember | null>(() => {
    try {
      const s = localStorage.getItem('vayro_admin_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const loginAdmin = (pinOrCode: string): boolean => {
    const clean = pinOrCode.trim();
    // Default PIN: 8899, or code ADM-001 or admin email
    if (clean === '8899' || clean === '2026' || clean.toLowerCase() === 'admin' || clean.toLowerCase() === 'admin@vayromarket.com') {
      const admin: StaffMember = {
        id: 'staff_admin',
        code: 'ADM-001',
        name: 'المدير التنفيذي (Super Admin)',
        phone: '01012345678',
        email: 'admin@vayromarket.com',
        role: 'super_admin',
        department_ar: 'الإدارة العليا والعمليات المالية',
        department_en: 'Executive Operations & Finance',
        monthlyTarget: 1000000,
        achievedSales: 890000,
        pendingCommissions: 0,
        approvedCommissions: 0,
        status: 'active',
        lastActive: 'الآن'
      };
      setIsAdminAuthenticated(true);
      setAdminStaffUser(admin);
      localStorage.setItem('vayro_admin_auth', 'true');
      localStorage.setItem('vayro_admin_user', JSON.stringify(admin));
      showToast('مرحبًا بك في VAYRO Business. تم تفعيل صلاحيات الإدارة الكاملة.', 'success');
      setCurrentPage('admin');
      return true;
    }
    showToast('رمز PIN أو بيانات الدخول غير صحيحة. يرجى إدخال PIN الصحيح (الرمز الافتراضي: 8899)', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setAdminStaffUser(null);
    localStorage.removeItem('vayro_admin_auth');
    localStorage.removeItem('vayro_admin_user');
    showToast('تم تسجيل الخروج بنجاح من لوحة إدارة VAYRO Business', 'info');
    setCurrentPage('home');
  };

  // Free shipping threshold for Egypt
  const freeShippingThreshold = 1500;

  // Cart state persisted to localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('vayro_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state persisted to localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vayro_wishlist');
      return saved ? JSON.parse(saved) : ['vayro-p3', 'vayro-p5'];
    } catch {
      return ['vayro-p3', 'vayro-p5'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vayro_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('vayro_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn(e);
    }
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('vayro_staff_auth', String(isStaffAuthenticated));
  }, [isStaffAuthenticated]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3500);
  };

  const setCurrentPage = (page: PageType) => {
    setCurrentPageState(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined') {
      try {
        if (page === 'admin') {
          window.history.pushState(null, '', '/admin/dashboard');
        } else if (page === 'admin-login') {
          window.history.pushState(null, '', '/admin/login');
        } else if (page === 'sales-login') {
          window.history.pushState(null, '', '/sales/login');
        } else if (page === 'crm') {
          window.history.pushState(null, '', '/sales/portal');
        } else if (page === 'home') {
          window.history.pushState(null, '', '/');
        }
      } catch {}
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path === '/admin' || path.startsWith('/admin/dashboard')) {
          setCurrentPageState('admin');
        } else if (path === '/admin/login' || path.startsWith('/admin/login')) {
          setCurrentPageState('admin-login');
        } else if (path === '/sales/login' || path.startsWith('/sales/login')) {
          setCurrentPageState('sales-login');
        } else if (path === '/sales' || path.startsWith('/sales/portal')) {
          setCurrentPageState('crm');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('product');
  };

  const navigateToCategory = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage('catalog');
  };

  const executeSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage('catalog');
  };

  const openAuthModal = (mode: 'login' | 'register' | 'forgot_password' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const logoutCustomer = () => {
    api.logoutCustomer();
    setCurrentUser(null);
    showToast('تم تسجيل الخروج بنجاح من حسابك.', 'info');
    if (currentPage === 'account') {
      setCurrentPage('home');
    }
  };

  const addToCart = (product: Product, quantity = 1, selectedColor?: string, selectedSize?: string, customUnitPrice?: number) => {
    const color = selectedColor || product.colors[0]?.name_ar || 'افتراضي';
    const size = selectedSize || product.sizes[0] || 'Standard';
    const itemId = `${product.id}-${color}-${size}`;
    const priceToFreeze = customUnitPrice ?? product.price;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          quantity,
          selectedColor: color,
          selectedSize: size,
          unitPrice: priceToFreeze,
          priceType: 'retail'
        }
      ];
    });

    showToast(`تمت إضافة "${product.name_ar}" إلى حقيبة التسوق!`);
    setIsCartDrawerOpen(true);
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    const prod = products.find((p) => p.id === productId) || PRODUCTS.find((p) => p.id === productId);
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(
          prod ? `تمت إزالة "${prod.name_ar}" من المفضلة` : 'تمت الإزالة من المفضلة',
          'info'
        );
        return prev.filter((id) => id !== productId);
      } else {
        showToast(
          prod ? `تم حفظ "${prod.name_ar}" في المفضلة!` : 'تم الحفظ في المفضلة!',
          'success'
        );
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const removeFromWishlist = (productId: string) => {
    const prod = products.find((p) => p.id === productId) || PRODUCTS.find((p) => p.id === productId);
    setWishlist((prev) => prev.filter((id) => id !== productId));
    showToast(
      prod ? `تمت إزالة "${prod.name_ar}" من المفضلة` : 'تمت الإزالة من المفضلة',
      'info'
    );
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast('تم إفراغ قائمة المفضلة بالكامل', 'info');
  };

  const moveItemToCart = (product: Product) => {
    addToCart(product, 1);
    setWishlist((prev) => prev.filter((id) => id !== product.id));
    showToast(`تم نقل "${product.name_ar}" إلى حقيبة التسوق بنجاح!`, 'success');
  };

  const moveAllWishlistToCart = () => {
    const itemsToMove = products.filter((p) => wishlist.includes(p.id));
    if (itemsToMove.length === 0) return;
    itemsToMove.forEach((product) => {
      addToCart(product, 1);
    });
    setWishlist([]);
    showToast(`تم نقل جميع المنتجات (${itemsToMove.length}) إلى حقيبة التسوق!`, 'success');
    setIsCartDrawerOpen(true);
  };

  // Customer Reviews State & Actions
  const [reviews, setReviews] = useState<ProductReview[]>(() => api.getAllReviews());
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewModalProduct, setReviewModalProduct] = useState<Product | null>(null);
  const [reviewModalOrderNumber, setReviewModalOrderNumber] = useState<string | undefined>(undefined);

  const getProductReviews = (productId: string) => {
    return reviews.filter((r) => r.productId === productId);
  };

  const submitProductReview = (reviewData: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount'>): ProductReview => {
    const newRev = api.addReview(reviewData);
    setReviews(api.getAllReviews());
    showToast('شكراً لمشاركتك! تم تسجيل ونشر تقييمك للمنتج بنجاح.', 'success');
    setIsReviewModalOpen(false);
    return newRev;
  };

  const voteReviewHelpful = (reviewId: string) => {
    api.voteHelpful(reviewId);
    setReviews(api.getAllReviews());
    showToast('شكراً لمشاركتك! تم تسجيل تصويتك كتقييم مفيد.', 'info');
  };

  const checkUserPurchased = (productId: string) => {
    return api.hasUserPurchasedProduct(productId, currentUser?.phone);
  };

  const openReviewModal = (product: Product, orderNumber?: string) => {
    setReviewModalProduct(product);
    setReviewModalOrderNumber(orderNumber);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewModalProduct(null);
    setReviewModalOrderNumber(undefined);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.unitPrice ?? item.product.price) * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const amountUntilFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <StoreContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedProductId,
        navigateToProduct,
        selectedCategory,
        navigateToCategory,
        searchQuery,
        setSearchQuery,
        executeSearch,
        products,
        refreshProducts,
        updateProductPrices,
        updateProductStock,
        quickViewProduct,
        setQuickViewProduct,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        cartSubtotal,
        cartItemsCount,
        freeShippingThreshold,
        amountUntilFreeShipping,
        appliedCoupon,
        setAppliedCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        moveItemToCart,
        moveAllWishlistToCart,
        reviews,
        getProductReviews,
        submitProductReview,
        voteReviewHelpful,
        checkUserPurchased,
        isReviewModalOpen,
        reviewModalProduct,
        reviewModalOrderNumber,
        openReviewModal,
        closeReviewModal,
        latestOrder,
        setLatestOrder,
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        logoutCustomer,
        isStaffAuthenticated,
        setIsStaffAuthenticated,
        currentStaffRep,
        setCurrentStaffRep,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        adminStaffUser,
        loginAdmin,
        logoutAdmin,
        toast,
        showToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
