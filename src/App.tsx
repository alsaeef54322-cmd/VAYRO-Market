import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/home/HomePage';
import { CatalogPage } from './components/catalog/CatalogPage';
import { ProductDetailPage } from './components/product/ProductDetailPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderConfirmation } from './components/checkout/OrderConfirmation';
import { AccountPage } from './components/account/AccountPage';
import { WholesalePage } from './components/wholesale/WholesalePage';
import { SalesCRMPage } from './components/crm/SalesCRMPage';
import { SalesLoginPage } from './components/sales/SalesLoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { WishlistPage } from './components/wishlist/WishlistPage';
import { CartDrawer } from './components/cart/CartDrawer';
import { QuickViewModal } from './components/ui/QuickViewModal';
import { AuthModal } from './components/account/AuthModal';
import { WriteReviewModal } from './components/product/WriteReviewModal';
import { Toast } from './components/ui/Toast';
import { WhatsAppButton } from './components/ui/WhatsAppButton';
import { ThemeProvider } from './context/ThemeContext';

const AppContent: React.FC = () => {
  const { currentPage, isAdminAuthenticated } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F3] dark:bg-[#111411] text-[#20241F] dark:text-[#F3F5EF] transition-colors duration-200">
      {/* Header with Navigation, Live Search, Customer Entry, and Discreet CRM Link */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'catalog' && <CatalogPage />}
        {currentPage === 'product' && <ProductDetailPage />}
        {currentPage === 'checkout' && <CheckoutPage />}
        {currentPage === 'order-success' && <OrderConfirmation />}
        {currentPage === 'account' && <AccountPage />}
        {currentPage === 'wholesale' && <WholesalePage />}
        {currentPage === 'crm' && <SalesCRMPage />}
        {currentPage === 'sales-login' && <SalesLoginPage />}
        {currentPage === 'admin' && (isAdminAuthenticated ? <AdminDashboard /> : <AdminLoginPage />)}
        {currentPage === 'admin-login' && <AdminLoginPage />}
        {currentPage === 'wishlist' && <WishlistPage />}
      </main>

      {/* Global Interactive Drawers, Modals & Toast */}
      <CartDrawer />
      <QuickViewModal />
      <AuthModal />
      <WriteReviewModal />
      <Toast />
      <WhatsAppButton />

      {/* Comprehensive Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
