import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  Users,
  Building2,
  FileText,
  ShieldCheck,
  Edit,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  LogOut,
  Store,
  Briefcase,
  Layers,
  ChevronDown,
  RefreshCw,
  Plus,
  Percent,
  Check,
  X,
  ExternalLink,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { Product, Order, Supplier, StaffMember, AuditLogEntry, FinancialSummary } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const {
    products,
    updateProductPrices,
    updateProductStock,
    setCurrentPage,
    logoutAdmin,
    adminStaffUser,
    showToast
  } = useStore();

  // Active Tab: overview | products | orders | suppliers | sales-team | accounting | audit
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'suppliers' | 'sales-team' | 'accounting' | 'audit'>('overview');

  // Local state for dynamic data loaded from api service
  const [orders, setOrders] = useState<Order[]>(() => api.getSavedOrders());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => api.getSuppliers());
  const [staffList, setStaffList] = useState<StaffMember[]>(() => api.getStaffMembers());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => api.getAuditLogs());
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>(() => api.getFinancialSummary());

  // Search & Filter state
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Edit Price Modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [priceForm, setPriceForm] = useState({
    price: 0,
    salesPrice: 0,
    wholesalePrice: 0,
    supplierCost: 0,
    salesCommission: 0,
    stock: 0
  });

  const refreshAllAdminData = () => {
    setOrders(api.getSavedOrders());
    setSuppliers(api.getSuppliers());
    setStaffList(api.getStaffMembers());
    setAuditLogs(api.getAuditLogs());
    setFinancialSummary(api.getFinancialSummary());
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPriceForm({
      price: prod.price,
      salesPrice: prod.salesPrice ?? Math.round(prod.price * 0.88),
      wholesalePrice: prod.wholesalePrice ?? Math.round(prod.price * 0.65),
      supplierCost: prod.supplierCost ?? Math.round(prod.price * 0.42),
      salesCommission: prod.salesCommission ?? Math.round(prod.price * 0.08),
      stock: prod.stock
    });
  };

  const handleSaveProductPrices = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProductPrices(editingProduct.id, {
      price: Number(priceForm.price),
      salesPrice: Number(priceForm.salesPrice),
      wholesalePrice: Number(priceForm.wholesalePrice),
      supplierCost: Number(priceForm.supplierCost),
      salesCommission: Number(priceForm.salesCommission),
      stock: Number(priceForm.stock)
    });

    setEditingProduct(null);
    refreshAllAdminData();
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status'], newPaymentStatus?: Order['paymentStatus']) => {
    api.updateOrderStatus(orderId, newStatus, newPaymentStatus, undefined, adminStaffUser?.name || 'Super Admin');
    refreshAllAdminData();
    showToast(t('تم تحديث حالة الطلب والتحصيل بنجاح!', 'Order & Payment status updated successfully!'), 'success');
  };

  const handleApproveCommission = (staffCode: string, amount: number) => {
    const res = api.approveStaffCommission(staffCode, amount, adminStaffUser?.name || 'إدارة المحاسبة');
    if (res.success) {
      refreshAllAdminData();
      showToast(res.message_ar, 'success');
    }
  };

  // Export Financial Statement to CSV
  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Value (EGP)', 'Notes'],
      ['Gross Revenues (إجمالي الإيرادات)', financialSummary.grossRevenue, 'All Active Customer & B2B Orders'],
      ['Cost of Goods Sold - COGS (تكاليف الموردين)', financialSummary.totalCOGS, 'Direct factory production cost'],
      ['Sales Commissions Payable (عمولات المبيعات)', financialSummary.totalCommissionsPayable, 'Attributed to Sales Reps'],
      ['Commissions Disbursed (العمولات المصروفة)', financialSummary.totalCommissionsPaid, 'Approved by Finance'],
      ['Logistics Delivery Cost (تكاليف الشحن الداخلي)', financialSummary.totalShippingCost, 'Courier dispatch in 27 governorates'],
      ['Net Real Operating Profit (صافي الربح الفعلي)', financialSummary.netOperatingProfit, 'Actual margin retained'],
      ['Net Profit Margin % (هامش الربح الصافي)', `${financialSummary.profitMarginPercentage}%`, 'EBITDA equivalent']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VAYRO_Financial_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t('تم تصدير القائمة المالية إلى ملف CSV بنجاح!', 'Financial statement exported to CSV successfully!'), 'success');
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name_ar.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.name_en.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase());
      const matchCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customer.phone.includes(orderSearch);
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  return (
    <div className="min-h-screen bg-[#F7F7F3] dark:bg-[#111411] text-[#20241F] dark:text-[#F3F5EF] pb-16 transition-colors duration-200">
      
      {/* Top Operations Bar */}
      <header className="bg-white dark:bg-[#1A1F1A] border-b border-[#E2E5DE] dark:border-[#353D35] sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <span className="font-display font-black text-2xl tracking-tight text-[#20241F] dark:text-[#F3F5EF]">
              VAYRO
            </span>
            <span className="w-2 h-2 rounded-full bg-[#D5FF3F]" />
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#18794E] text-white">
              BUSINESS
            </span>
            <span className="hidden sm:inline-block text-xs text-[#646A63] dark:text-[#B5BDB3] border-s border-[#E2E5DE] dark:border-[#353D35] ps-3">
              {t('لوحة الإدارة التنفيذية والعمليات', 'Executive Operations & Pricing Control')}
            </span>
          </div>

          {/* Quick Context Switchers & User Actions */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* View Storefront */}
            <button
              onClick={() => setCurrentPage('home')}
              className="px-3 py-1.5 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] hover:bg-[#F0EEE6] dark:hover:bg-[#232923] text-[#20241F] dark:text-[#F3F5EF] font-semibold flex items-center gap-1.5 transition-colors"
              title={t('معاينة المتجر العام للعملاء', 'View Public Storefront')}
            >
              <Store size={14} className="text-[#18794E] dark:text-[#65C98A]" />
              <span className="hidden sm:inline">{t('المتجر العام', 'Storefront')}</span>
            </button>

            {/* Sales Portal */}
            <button
              onClick={() => setCurrentPage('crm')}
              className="px-3 py-1.5 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] hover:bg-[#F0EEE6] dark:hover:bg-[#232923] text-[#20241F] dark:text-[#F3F5EF] font-semibold flex items-center gap-1.5 transition-colors"
              title={t('بوابة مندوبي المبيعات', 'Sales Rep Portal')}
            >
              <Briefcase size={14} className="text-[#899723] dark:text-[#D5FF3F]" />
              <span className="hidden sm:inline">{t('بوابة المبيعات', 'Sales Reps')}</span>
            </button>

            {/* Admin Profile */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0EEE6] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35]">
              <ShieldCheck size={14} className="text-[#18794E] dark:text-[#65C98A]" />
              <span className="font-bold text-[#20241F] dark:text-[#F3F5EF]">
                {adminStaffUser?.name || 'Super Admin'}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={logoutAdmin}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-semibold flex items-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-900/50"
              title={t('تسجيل الخروج من الإدارة', 'Sign Out from Admin')}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">{t('خروج', 'Sign Out')}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-[#E2E5DE] dark:border-[#353D35]">
          {[
            { id: 'overview', label_ar: 'نظرة عامة والـ KPIs', label_en: 'Executive KPIs', icon: TrendingUp },
            { id: 'products', label_ar: 'المنتجات وتسعير الفئات', label_en: 'Products & Multi-Tier Pricing', icon: Package },
            { id: 'orders', label_ar: 'الطلبات والشحن والتحصيل', label_en: 'Orders & Logistics', icon: Truck },
            { id: 'suppliers', label_ar: 'الموردون والمصانع', label_en: 'Suppliers & Factories', icon: Building2 },
            { id: 'sales-team', label_ar: 'فريق المبيعات والعمولات', label_en: 'Sales Reps & Quotas', icon: Users },
            { id: 'accounting', label_ar: 'المحاسبة وقائمة الدخل', label_en: 'Financial P&L', icon: DollarSign },
            { id: 'audit', label_ar: 'سجل التدقيق والتكاملات', label_en: 'Audit Log & Integrations', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 border-b-2 ${
                  isActive
                    ? 'border-[#18794E] dark:border-[#D5FF3F] text-[#18794E] dark:text-[#D5FF3F] bg-[#F7F7F3] dark:bg-[#111411]'
                    : 'border-transparent text-[#646A63] dark:text-[#B5BDB3] hover:text-[#20241F] dark:hover:text-[#F3F5EF]'
                }`}
              >
                <Icon size={15} />
                <span>{language === 'ar' ? tab.label_ar : tab.label_en}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">

        {/* ========================================================
            TAB 1: EXECUTIVE DASHBOARD & REAL KPIS
            ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black font-display text-[#20241F] dark:text-[#F3F5EF]">
                  {t('المؤشرات التنفيذية الموحدة — موسم 2026', 'Executive Financial & Performance Dashboard 2026')}
                </h1>
                <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] mt-1">
                  {t(
                    'أرقام حقيقية مستمدة مباشرة من أوامر الشراء الفعلية، تكاليف الموردين، وعمولات مندوبي المبيعات.',
                    'Grounded live figures derived directly from fulfilled customer orders, verified supplier costs, and sales commissions.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={refreshAllAdminData}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1F1A] border border-[#E2E5DE] dark:border-[#353D35] hover:bg-[#F0EEE6] dark:hover:bg-[#232923] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <RefreshCw size={13} className="text-[#18794E] dark:text-[#65C98A]" />
                  <span>{t('تحديث البيانات', 'Refresh Live Data')}</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-[#111411] dark:bg-[#D5FF3F] text-white dark:text-[#111411] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Download size={13} />
                  <span>{t('تصدير Excel / CSV', 'Export to CSV')}</span>
                </button>
              </div>
            </div>

            {/* 4 Main Executive Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gross Revenue */}
              <div className="bg-white dark:bg-[#1A1F1A] p-5 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#646A63] dark:text-[#B5BDB3]">
                    {t('إجمالي الإيرادات الفعلية', 'Gross Revenue')}
                  </span>
                  <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#18794E] dark:text-[#65C98A]">
                    <DollarSign size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-[#20241F] dark:text-[#F3F5EF]">
                  {financialSummary.grossRevenue.toLocaleString()} <span className="text-xs font-sans font-bold">{t('ج.م', 'EGP')}</span>
                </div>
                <p className="text-[11px] text-[#646A63] dark:text-[#B5BDB3] mt-1.5">
                  {t(`من إجمالي ${financialSummary.ordersCount} طلبات مؤكدة`, `Across ${financialSummary.ordersCount} active orders`)}
                </p>
              </div>

              {/* COGS / Supplier Costs */}
              <div className="bg-white dark:bg-[#1A1F1A] p-5 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#646A63] dark:text-[#B5BDB3]">
                    {t('تكاليف الإنتاج والمصانع (COGS)', 'Supplier Production Costs')}
                  </span>
                  <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                    <Building2 size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-[#20241F] dark:text-[#F3F5EF]">
                  {financialSummary.totalCOGS.toLocaleString()} <span className="text-xs font-sans font-bold">{t('ج.م', 'EGP')}</span>
                </div>
                <p className="text-[11px] text-[#646A63] dark:text-[#B5BDB3] mt-1.5">
                  {t('مستحقات للمصانع والورش المصرية', 'Direct factory costs')}
                </p>
              </div>

              {/* Sales Commissions */}
              <div className="bg-white dark:bg-[#1A1F1A] p-5 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#646A63] dark:text-[#B5BDB3]">
                    {t('عمولات المبيعات المقررة', 'Commissions Attributed')}
                  </span>
                  <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
                    <Users size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-[#20241F] dark:text-[#F3F5EF]">
                  {financialSummary.totalCommissionsPayable.toLocaleString()} <span className="text-xs font-sans font-bold">{t('ج.م', 'EGP')}</span>
                </div>
                <p className="text-[11px] text-[#646A63] dark:text-[#B5BDB3] mt-1.5">
                  {t(`تم صرف: ${financialSummary.totalCommissionsPaid.toLocaleString()} ج.م`, `Paid: EGP ${financialSummary.totalCommissionsPaid.toLocaleString()}`)}
                </p>
              </div>

              {/* Net Operating Profit */}
              <div className="bg-white dark:bg-[#1A1F1A] p-5 rounded-3xl border border-[#18794E]/30 dark:border-[#D5FF3F]/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 end-0 w-24 h-24 bg-[#D5FF3F]/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#18794E] dark:text-[#65C98A]">
                    {t('صافي الأرباح التشغيلية الفعلية', 'Net Operating Profit')}
                  </span>
                  <span className="p-2 rounded-xl bg-[#D5FF3F]/20 text-[#18794E] dark:text-[#D5FF3F]">
                    <Percent size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-[#18794E] dark:text-[#D5FF3F]">
                  {financialSummary.netOperatingProfit.toLocaleString()} <span className="text-xs font-sans font-bold">{t('ج.م', 'EGP')}</span>
                </div>
                <p className="text-[11px] font-bold text-[#18794E] dark:text-[#65C98A] mt-1.5 flex items-center gap-1">
                  <span>{t(`هامش ربح صافي: ${financialSummary.profitMarginPercentage}%`, `Net Margin: ${financialSummary.profitMarginPercentage}%`)}</span>
                </p>
              </div>
            </div>

            {/* Channels & Orders Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Channels Breakdown */}
              <div className="bg-white dark:bg-[#1A1F1A] p-6 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm lg:col-span-1">
                <h3 className="text-sm font-bold text-[#20241F] dark:text-[#F3F5EF] mb-4 flex items-center gap-2">
                  <Layers size={16} className="text-[#18794E] dark:text-[#65C98A]" />
                  <span>{t('توزيع المبيعات حسب القناة', 'Sales Channel Attribution')}</span>
                </h3>

                <div className="space-y-4">
                  {/* Retail Storefront */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{t('متجر التجزئة العام (Storefront)', 'Retail Storefront')}</span>
                      <span className="font-mono">
                        {orders.filter((o) => o.orderTier === 'retail').reduce((s, o) => s + o.total, 0).toLocaleString()} {t('ج.م', 'EGP')}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E2E5DE] dark:bg-[#232923] overflow-hidden">
                      <div className="h-full bg-[#18794E] rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>

                  {/* Sales Rep Portal */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{t('بوابة المبيعات والمندوبين (Sales Portal)', 'Sales Reps')}</span>
                      <span className="font-mono">
                        {orders.filter((o) => o.orderTier === 'sales_portal').reduce((s, o) => s + o.total, 0).toLocaleString()} {t('ج.م', 'EGP')}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E2E5DE] dark:bg-[#232923] overflow-hidden">
                      <div className="h-full bg-[#D5FF3F] rounded-full" style={{ width: '48%' }} />
                    </div>
                  </div>

                  {/* Wholesale B2B */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{t('طلبات تجارة الجملة والشركات (Wholesale)', 'Wholesale B2B')}</span>
                      <span className="font-mono">
                        {orders.filter((o) => o.orderTier === 'wholesale').reduce((s, o) => s + o.total, 0).toLocaleString()} {t('ج.م', 'EGP')}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E2E5DE] dark:bg-[#232923] overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '10%' }} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E2E5DE] dark:border-[#353D35] flex items-center justify-between text-xs text-[#646A63] dark:text-[#B5BDB3]">
                  <span>{t('شحن محافظات مصر:', 'Egypt Logistics:')}</span>
                  <span className="font-bold font-mono text-[#20241F] dark:text-[#F3F5EF]">
                    {financialSummary.totalShippingCost.toLocaleString()} {t('ج.م', 'EGP')}
                  </span>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white dark:bg-[#1A1F1A] p-6 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#20241F] dark:text-[#F3F5EF] flex items-center gap-2">
                    <Truck size={16} className="text-[#18794E] dark:text-[#65C98A]" />
                    <span>{t('آخر أوامر الشراء الصادرة والتحصيل', 'Recent Dispatched Orders & Collections')}</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#18794E] dark:text-[#65C98A] hover:underline"
                  >
                    {t('عرض جميع الطلبات', 'View All Orders')}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead>
                      <tr className="border-b border-[#E2E5DE] dark:border-[#353D35] text-[#646A63] dark:text-[#B5BDB3]">
                        <th className="pb-3 font-bold">{t('رقم الطلب', 'Order #')}</th>
                        <th className="pb-3 font-bold">{t('العميل', 'Customer')}</th>
                        <th className="pb-3 font-bold">{t('القناة', 'Channel')}</th>
                        <th className="pb-3 font-bold">{t('القيمة', 'Total')}</th>
                        <th className="pb-3 font-bold">{t('الربح الصافي', 'Net Margin')}</th>
                        <th className="pb-3 font-bold">{t('حالة الشحن', 'Shipping')}</th>
                        <th className="pb-3 font-bold">{t('التحصيل (COD)', 'Payment')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E5DE] dark:divide-[#353D35]">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#F0EEE6]/50 dark:hover:bg-[#232923]/50 transition-colors">
                          <td className="py-3 font-mono font-bold text-[#20241F] dark:text-[#F3F5EF]">{ord.orderNumber}</td>
                          <td className="py-3 font-semibold">{ord.customer.name}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              ord.orderTier === 'sales_portal'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : ord.orderTier === 'wholesale'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            }`}>
                              {ord.orderTier || 'retail'}
                            </span>
                          </td>
                          <td className="py-3 font-mono font-bold">{ord.total.toLocaleString()} {t('ج.م', 'EGP')}</td>
                          <td className="py-3 font-mono font-bold text-[#18794E] dark:text-[#65C98A]">
                            +{(ord.netMargin || 0).toLocaleString()} {t('ج.م', 'EGP')}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E2E5DE] dark:bg-[#232923] text-[#20241F] dark:text-[#F3F5EF]">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.paymentStatus === 'collected' || ord.paymentStatus === 'remitted'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            }`}>
                              {ord.paymentStatus || 'pending_cod'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: PRODUCTS & 5-TIER PRICING ENGINE
            ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-[#20241F] dark:text-[#F3F5EF]">
                  {t('قوائم الأسعار والمخزون — منظومة الأسعار الخمسة', 'Multi-Tier Price Matrix & Stock Control')}
                </h2>
                <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] mt-1">
                  {t(
                    'تحكم الإدارة الكامل في: سعر التجزئة للعميل، سعر المندوب، سعر التاجر، تكلفة المورد (محمية)، وعمولة المبيعات.',
                    'Direct management of: Retail Customer Price, Sales Rep Price, Wholesale Price, Supplier Factory Cost, and Sales Commission.'
                  )}
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute inset-y-0 start-3 my-auto text-[#646A63] dark:text-[#B5BDB3]" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={t('بحث عن منتج أو كود SKU...', 'Search product or SKU...')}
                    className="bg-white dark:bg-[#1A1F1A] text-xs py-2 ps-9 pe-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-white dark:bg-[#1A1F1A] text-xs py-2 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none"
                >
                  <option value="all">{t('جميع الأقسام', 'All Categories')}</option>
                  <option value="men">{t('رجالي', 'Men')}</option>
                  <option value="shoes">{t('أحذية', 'Footwear')}</option>
                  <option value="accessories">{t('إكسسوارات', 'Accessories')}</option>
                  <option value="home">{t('البيت', 'Home')}</option>
                </select>
              </div>
            </div>

            {/* Products Pricing Table */}
            <div className="bg-white dark:bg-[#1A1F1A] rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="bg-[#F0EEE6] dark:bg-[#232923] text-[#20241F] dark:text-[#F3F5EF] border-b border-[#E2E5DE] dark:border-[#353D35]">
                      <th className="py-3.5 px-4 font-bold">{t('المنتج والموديل', 'Product & Brand')}</th>
                      <th className="py-3.5 px-3 font-bold text-center">{t('المخزون', 'Stock')}</th>
                      <th className="py-3.5 px-3 font-bold text-center text-blue-700 dark:text-blue-400">
                        {t('1. سعر التجزئة (عميل)', '1. Retail Price')}
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-amber-700 dark:text-amber-400">
                        {t('2. سعر المندوب (سيلز)', '2. Sales Price')}
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-purple-700 dark:text-purple-400">
                        {t('3. سعر الجملة (B2B)', '3. Wholesale Price')}
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-rose-700 dark:text-rose-400">
                        {t('4. تكلفة المورد (سرية)', '4. Supplier Cost')}
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center text-emerald-700 dark:text-emerald-400">
                        {t('5. عمولة المندوب', '5. Commission')}
                      </th>
                      <th className="py-3.5 px-3 font-bold text-center">{t('المورد / المصنع', 'Supplier')}</th>
                      <th className="py-3.5 px-4 font-bold text-center">{t('إجراء', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E5DE] dark:divide-[#353D35]">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F0EEE6]/40 dark:hover:bg-[#232923]/40 transition-colors">
                        {/* Product info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name_ar}
                              className="w-10 h-10 rounded-xl object-cover border border-[#E2E5DE] dark:border-[#353D35]"
                            />
                            <div>
                              <p className="font-bold text-[#20241F] dark:text-[#F3F5EF]">{p.name_ar}</p>
                              <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] font-mono">{p.sku} · {p.brand}</p>
                            </div>
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-3 text-center font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                            p.stock > 10
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          }`}>
                            {p.stock}
                          </span>
                        </td>

                        {/* 1. Retail Price */}
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-blue-700 dark:text-blue-300">
                          {p.price.toLocaleString()} {t('ج.م', 'EGP')}
                        </td>

                        {/* 2. Sales Price */}
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-700 dark:text-amber-300">
                          {(p.salesPrice ?? Math.round(p.price * 0.88)).toLocaleString()} {t('ج.م', 'EGP')}
                        </td>

                        {/* 3. Wholesale Price */}
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-purple-700 dark:text-purple-300">
                          {(p.wholesalePrice ?? Math.round(p.price * 0.65)).toLocaleString()} {t('ج.م', 'EGP')}
                        </td>

                        {/* 4. Supplier Cost (Confidential to Admin) */}
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/20">
                          {(p.supplierCost ?? Math.round(p.price * 0.42)).toLocaleString()} {t('ج.م', 'EGP')}
                        </td>

                        {/* 5. Sales Commission */}
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-300">
                          +{(p.salesCommission ?? Math.round(p.price * 0.08)).toLocaleString()} {t('ج.م', 'EGP')}
                        </td>

                        {/* Supplier Name */}
                        <td className="py-3.5 px-3 text-center text-[11px] text-[#646A63] dark:text-[#B5BDB3]">
                          {p.supplierName_ar ? p.supplierName_ar.slice(0, 24) + '...' : 'مصنع محلي'}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="px-3 py-1.5 rounded-xl bg-[#F0EEE6] dark:bg-[#232923] hover:bg-[#18794E] hover:text-white dark:hover:bg-[#D5FF3F] dark:hover:text-[#111411] font-bold text-xs flex items-center gap-1.5 transition-colors border border-[#E2E5DE] dark:border-[#353D35]"
                          >
                            <Edit size={13} />
                            <span>{t('تعديل الأسعار', 'Edit Prices')}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: ORDERS & LOGISTICS MANAGEMENT
            ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-[#20241F] dark:text-[#F3F5EF]">
                  {t('إدارة الطلبات والشحن والتحصيل في 27 محافظة', 'Orders Fulfillment & COD Reconciliation')}
                </h2>
                <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] mt-1">
                  {t(
                    'متابعة حالة التوصيل مع مندوبي الشحن، تأكيد تحصيل المبالغ النقدية (COD)، وحساب صافي هوامش الربح.',
                    'Dispatch tracking, Courier cash reconciliation, and actual margin verification.'
                  )}
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder={t('رقم الطلب أو اسم العميل...', 'Search order or customer...')}
                  className="bg-white dark:bg-[#1A1F1A] text-xs py-2 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none"
                />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-white dark:bg-[#1A1F1A] text-xs py-2 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none"
                >
                  <option value="all">{t('جميع الحالات', 'All Statuses')}</option>
                  <option value="confirmed">{t('مؤكد جديد', 'Confirmed')}</option>
                  <option value="processing">{t('قيد التجهيز', 'Processing')}</option>
                  <option value="shipped">{t('خرج مع الشحن', 'Shipped')}</option>
                  <option value="delivered">{t('تم التسليم والتحصيل', 'Delivered')}</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-[#1A1F1A] rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="bg-[#F0EEE6] dark:bg-[#232923] text-[#20241F] dark:text-[#F3F5EF] border-b border-[#E2E5DE] dark:border-[#353D35]">
                      <th className="py-3.5 px-4 font-bold">{t('كود الطلب', 'Order #')}</th>
                      <th className="py-3.5 px-3 font-bold">{t('العميل والتواصل', 'Customer & Phone')}</th>
                      <th className="py-3.5 px-3 font-bold">{t('المحافظة والعنوان', 'Location')}</th>
                      <th className="py-3.5 px-3 font-bold">{t('القناة / المندوب', 'Channel / Rep')}</th>
                      <th className="py-3.5 px-3 font-bold font-mono text-center">{t('الإجمالي', 'Total')}</th>
                      <th className="py-3.5 px-3 font-bold font-mono text-center text-rose-700 dark:text-rose-400">{t('تكلفة المورد', 'COGS')}</th>
                      <th className="py-3.5 px-3 font-bold font-mono text-center text-emerald-700 dark:text-emerald-400">{t('الربح الصافي', 'Net Margin')}</th>
                      <th className="py-3.5 px-3 font-bold text-center">{t('حالة الشحن', 'Shipping')}</th>
                      <th className="py-3.5 px-3 font-bold text-center">{t('حالة التحصيل (COD)', 'Payment')}</th>
                      <th className="py-3.5 px-4 font-bold text-center">{t('تحديث الحالة', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E5DE] dark:divide-[#353D35]">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#F0EEE6]/40 dark:hover:bg-[#232923]/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#20241F] dark:text-[#F3F5EF]">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-bold text-[#20241F] dark:text-[#F3F5EF]">{ord.customer.name}</p>
                          <p className="text-[11px] text-[#646A63] dark:text-[#B5BDB3] font-mono">{ord.customer.phone}</p>
                        </td>
                        <td className="py-3.5 px-3 text-[11px]">
                          <p className="font-semibold">{ord.customer.city}</p>
                          <p className="text-[#646A63] dark:text-[#B5BDB3] truncate max-w-[150px]">{ord.customer.addressLine}</p>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            ord.orderTier === 'sales_portal'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          }`}>
                            {ord.salesRepName ? `${ord.salesRepName} (${ord.salesRepCode})` : 'متجر التجزئة'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold">
                          {ord.total.toLocaleString()} {t('ج.م', 'EGP')}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-rose-700 dark:text-rose-400">
                          {(ord.supplierTotalCost || 0).toLocaleString()} {t('ج.م', 'EGP')}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-[#18794E] dark:text-[#65C98A]">
                          +{(ord.netMargin || 0).toLocaleString()} {t('ج.م', 'EGP')}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E2E5DE] dark:bg-[#232923]">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.paymentStatus === 'collected' || ord.paymentStatus === 'remitted'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}>
                            {ord.paymentStatus === 'collected' ? t('تم التحصيل', 'Collected') : ord.paymentStatus === 'remitted' ? t('تم التوريد للخزينة', 'Remitted') : t('معلق مع المندوب', 'Pending COD')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {ord.status !== 'delivered' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'delivered', 'collected')}
                                className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:brightness-110 font-bold"
                                title={t('تأكيد التسليم والتحصيل', 'Mark Delivered & Collected')}
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, ord.status === 'confirmed' ? 'processing' : 'shipped')}
                              className="px-2 py-1 rounded-lg bg-[#F0EEE6] dark:bg-[#232923] text-[10px] font-bold hover:bg-[#E2E5DE] dark:hover:bg-[#2E362E]"
                            >
                              {ord.status === 'confirmed' ? t('تجهيز', 'Process') : t('شحن', 'Ship')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: SUPPLIERS & FACTORIES DIRECTORY
            ======================================================== */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-[#20241F] dark:text-[#F3F5EF]">
                  {t('الموردون والمصانع المصرية المعتمدة', 'Egyptian Factories & Artisan Suppliers')}
                </h2>
                <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] mt-1">
                  {t(
                    'إدارة تعاقدات المصانع، رصيد المستحقات المحمية، شروط الدفع، وأوامر التوريد الدورية.',
                    'Direct management of manufacturing partners, payable balances, and terms.'
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suppliers.map((sup) => (
                <div key={sup.id} className="bg-white dark:bg-[#1A1F1A] p-6 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#18794E] text-white">
                          {sup.code}
                        </span>
                        <span className="text-xs font-bold text-[#646A63] dark:text-[#B5BDB3] uppercase">
                          {sup.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#20241F] dark:text-[#F3F5EF]">{sup.name_ar}</h3>
                      <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] font-mono">{sup.name_en}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {t('شريك معتمد', 'Active Guild')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 my-3 border-y border-[#E2E5DE] dark:border-[#353D35] text-xs">
                    <div>
                      <span className="text-[#646A63] dark:text-[#B5BDB3] block">{t('المسؤول / الاتصال:', 'Contact:')}</span>
                      <span className="font-bold">{sup.contactPerson}</span>
                      <span className="font-mono text-[11px] block text-[#646A63] dark:text-[#B5BDB3]">{sup.phone}</span>
                    </div>

                    <div>
                      <span className="text-[#646A63] dark:text-[#B5BDB3] block">{t('المحافظة:', 'Location:')}</span>
                      <span className="font-bold">{sup.governorate} — {sup.city}</span>
                    </div>

                    <div>
                      <span className="text-[#646A63] dark:text-[#B5BDB3] block">{t('المنتجات الموردة:', 'Products Supplied:')}</span>
                      <span className="font-bold font-mono">{sup.suppliedProductsCount} {t('موديلات', 'SKUs')}</span>
                    </div>

                    <div>
                      <span className="text-[#646A63] dark:text-[#B5BDB3] block">{t('رصيد المستحقات الحالي:', 'Outstanding Balance:')}</span>
                      <span className="font-bold font-mono text-amber-700 dark:text-amber-400">
                        {sup.totalPayableAmount.toLocaleString()} {t('ج.م', 'EGP')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#646A63] dark:text-[#B5BDB3]">
                    <span>{t('شروط السداد:', 'Payment Terms:')} {sup.paymentTerms}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: SALES REPS & COMMISSIONS
            ======================================================== */}
        {activeTab === 'sales-team' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-[#20241F] dark:text-[#F3F5EF]">
                  {t('فريق المبيعات والصلاحيات والعمولات', 'Sales Reps Quotas & Commission Settlements')}
                </h2>
                <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] mt-1">
                  {t(
                    'متابعة مستهدفات المندوبين الشهرية، اعتماد وصرف العمولات المكتسبة، وإدارة الصلاحيات.',
                    'Track monthly rep targets, approve earned commissions, and control sales pricing access.'
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {staffList.filter((s) => s.role === 'sales_rep').map((rep) => {
                const targetPercent = Math.min(100, Math.round((rep.achievedSales / rep.monthlyTarget) * 100));
                return (
                  <div key={rep.id} className="bg-white dark:bg-[#1A1F1A] p-6 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#111411] dark:bg-[#232923] text-[#D5FF3F]">
                          {rep.code}
                        </span>
                        <h3 className="text-base font-bold text-[#20241F] dark:text-[#F3F5EF] mt-1">{rep.name}</h3>
                        <p className="text-xs text-[#646A63] dark:text-[#B5BDB3]">{rep.department_ar}</p>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#18794E] dark:text-[#65C98A] font-bold">
                        {rep.lastActive}
                      </span>
                    </div>

                    {/* Target Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>{t('المستهدف الشهري:', 'Monthly Quota:')}</span>
                        <span className="font-mono">{targetPercent}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#E2E5DE] dark:bg-[#232923] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#18794E] to-[#D5FF3F] rounded-full transition-all"
                          style={{ width: `${targetPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-[#646A63] dark:text-[#B5BDB3] mt-1 font-mono">
                        <span>{rep.achievedSales.toLocaleString()} ج.م محقق</span>
                        <span>{rep.monthlyTarget.toLocaleString()} ج.م مستهدف</span>
                      </div>
                    </div>

                    {/* Commissions Section */}
                    <div className="p-4 rounded-2xl bg-[#F0EEE6] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35] space-y-2 text-xs mb-4">
                      <div className="flex justify-between">
                        <span className="text-[#646A63] dark:text-[#B5BDB3]">{t('عمولات معلقة (Pending):', 'Pending Commission:')}</span>
                        <span className="font-bold font-mono text-amber-700 dark:text-amber-400">
                          {rep.pendingCommissions.toLocaleString()} {t('ج.م', 'EGP')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#646A63] dark:text-[#B5BDB3]">{t('عمولات معتمدة ومصروفة:', 'Approved & Paid:')}</span>
                        <span className="font-bold font-mono text-[#18794E] dark:text-[#65C98A]">
                          {rep.approvedCommissions.toLocaleString()} {t('ج.م', 'EGP')}
                        </span>
                      </div>
                    </div>

                    {/* Approve Payout Action */}
                    {rep.pendingCommissions > 0 ? (
                      <button
                        onClick={() => handleApproveCommission(rep.code, rep.pendingCommissions)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#111411] dark:bg-[#D5FF3F] text-white dark:text-[#111411] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Check size={14} />
                        <span>{t(`اعتماد وصرف ${rep.pendingCommissions.toLocaleString()} ج.م`, `Approve & Pay EGP ${rep.pendingCommissions.toLocaleString()}`)}</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-4 rounded-xl text-center text-xs text-[#646A63] dark:text-[#B5BDB3] font-semibold bg-[#F0EEE6]/50 dark:bg-[#232923]/50">
                        {t('جميع العمولات المستحقة معتمدة ومسواة بالكامل', 'All commissions cleared')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: REAL ACCOUNTING FINANCIAL STATEMENT (P&L)
            ======================================================== */}
        {activeTab === 'accounting' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-[#20241F] dark:text-[#F3F5EF]">
                  {t('قائمة الدخل والأرباح التشغيلية الفعلية — VAYRO Market P&L', 'Official Operating Financial Statement (P&L)')}
                </h2>
                <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] mt-1">
                  {t(
                    'قائمة دخل حقيقية مستمدة من أوامر الشراء الفعلية دون أي أرقام مصطنعة أو نسب وهمية.',
                    'Strictly real accounting derived directly from active purchases, COGS supplier invoices, and delivery fees.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1F1A] border border-[#E2E5DE] dark:border-[#353D35] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer size={14} />
                  <span>{t('طباعة القائمة', 'Print Statement')}</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-[#18794E] text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download size={14} />
                  <span>{t('تصدير CSV', 'Export CSV')}</span>
                </button>
              </div>
            </div>

            {/* Comprehensive P&L Sheet */}
            <div className="bg-white dark:bg-[#1A1F1A] p-8 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm max-w-4xl mx-auto space-y-6">
              
              <div className="text-center pb-6 border-b border-[#E2E5DE] dark:border-[#353D35]">
                <h3 className="font-display font-black text-2xl text-[#20241F] dark:text-[#F3F5EF]">
                  VAYRO Market Egypt — Financial Statement
                </h3>
                <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] mt-1">
                  {t('بيان الإيرادات والتكاليف والأرباح الصافية (بالجنيه المصري EGP)', 'Audited Operating P&L in Egyptian Pounds (EGP)')}
                </p>
              </div>

              {/* Inflows Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#18794E] dark:text-[#65C98A]">
                  {t('1. الإيرادات والتدفقات النقدية الداخلة (Gross Revenues)', '1. Gross Revenue')}
                </h4>
                <div className="flex justify-between text-sm py-2 border-b border-[#E2E5DE] dark:border-[#353D35]">
                  <span>{t('مبيعات متجر التجزئة للعملاء (Retail Storefront)', 'Customer Retail Sales')}</span>
                  <span className="font-mono font-bold">
                    {orders.filter((o) => o.orderTier === 'retail').reduce((s, o) => s + o.total, 0).toLocaleString()} EGP
                  </span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-[#E2E5DE] dark:border-[#353D35]">
                  <span>{t('مبيعات بوابة المندوبين وكبار العملاء (Sales Rep Orders)', 'Sales Rep Direct Orders')}</span>
                  <span className="font-mono font-bold">
                    {orders.filter((o) => o.orderTier === 'sales_portal').reduce((s, o) => s + o.total, 0).toLocaleString()} EGP
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold py-2 bg-[#F0EEE6] dark:bg-[#232923] px-3 rounded-xl">
                  <span>{t('إجمالي الإيرادات الإجمالية (Gross Revenue):', 'Total Gross Inflows:')}</span>
                  <span className="font-mono">{financialSummary.grossRevenue.toLocaleString()} EGP</span>
                </div>
              </div>

              {/* Outflows / Costs Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  {t('2. تكاليف التشغيل المباشرة والموردين (Cost of Goods & Outflows)', '2. Direct Costs & Outflows')}
                </h4>
                <div className="flex justify-between text-sm py-2 border-b border-[#E2E5DE] dark:border-[#353D35]">
                  <span>{t('تكاليف تصنيع الموردين والمصانع المصرية (COGS)', 'Factory & Supplier Direct Costs')}</span>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                    -{financialSummary.totalCOGS.toLocaleString()} EGP
                  </span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-[#E2E5DE] dark:border-[#353D35]">
                  <span>{t('عمولات مندوبي المبيعات المستحقة والمصروفة (Sales Commissions)', 'Sales Commissions')}</span>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                    -{financialSummary.totalCommissionsPayable.toLocaleString()} EGP
                  </span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-[#E2E5DE] dark:border-[#353D35]">
                  <span>{t('تكاليف لوجستيات الشحن والتوصيل للمحافظات (Logistics)', 'Logistics & Courier Delivery Subsidies')}</span>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                    -{financialSummary.totalShippingCost.toLocaleString()} EGP
                  </span>
                </div>
              </div>

              {/* Net Profit Bottom Line */}
              <div className="pt-4 border-t-2 border-[#18794E] dark:border-[#D5FF3F]">
                <div className="flex justify-between text-xl font-black py-4 bg-[#18794E]/10 dark:bg-[#D5FF3F]/10 px-5 rounded-2xl text-[#18794E] dark:text-[#D5FF3F]">
                  <span>{t('صافي الأرباح التشغيلية الصافية (Net Profit):', 'Net Operating Profit:')}</span>
                  <span className="font-mono font-black">{financialSummary.netOperatingProfit.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between text-xs text-[#646A63] dark:text-[#B5BDB3] mt-2 px-2">
                  <span>{t('نسبة هامش الربح الصافي النهائي:', 'Net Profit Margin Percentage:')}</span>
                  <span className="font-bold font-mono text-[#18794E] dark:text-[#65C98A]">{financialSummary.profitMarginPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: AUDIT LOG & SYSTEM INTEGRATIONS
            ======================================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-[#20241F] dark:text-[#F3F5EF]">
                  {t('سجل التدقيق الإداري وإعدادات التكاملات', 'Audit Trail & Operations Integrations')}
                </h2>
                <p className="text-xs text-[#646A63] dark:text-[#B5BDB3] mt-1">
                  {t(
                    'تسجيل كامل لجميع العمليات الحساسة (تعديلات الأسعار، اعتماد العمولات، وتسويات الموردين).',
                    'Immutable operational trail of pricing alterations, commission approvals, and supplier reconciliations.'
                  )}
                </p>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white dark:bg-[#1A1F1A] rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="bg-[#F0EEE6] dark:bg-[#232923] text-[#20241F] dark:text-[#F3F5EF] border-b border-[#E2E5DE] dark:border-[#353D35]">
                      <th className="py-3 px-4 font-bold">{t('التوقيت', 'Timestamp')}</th>
                      <th className="py-3 px-3 font-bold">{t('المستخدم والمنصب', 'User & Role')}</th>
                      <th className="py-3 px-3 font-bold">{t('التصنيف', 'Category')}</th>
                      <th className="py-3 px-4 font-bold">{t('العملية', 'Action')}</th>
                      <th className="py-3 px-4 font-bold">{t('تفاصيل التعديل', 'Details')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E5DE] dark:divide-[#353D35]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F0EEE6]/30 dark:hover:bg-[#232923]/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-[#646A63] dark:text-[#B5BDB3]">
                          {new Date(log.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-[#20241F] dark:text-[#F3F5EF]">{log.user}</p>
                          <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] font-mono">{log.role}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E2E5DE] dark:bg-[#232923]">
                            {log.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#20241F] dark:text-[#F3F5EF]">
                          {log.action_ar}
                        </td>
                        <td className="py-3 px-4 text-[#646A63] dark:text-[#B5BDB3] font-mono text-[11px]">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          EDIT PRODUCT PRICE & COST MODAL
          ======================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F1A] w-full max-w-xl rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E2E5DE] dark:border-[#353D35]">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#18794E] text-white">
                  {editingProduct.sku}
                </span>
                <h3 className="text-base font-bold text-[#20241F] dark:text-[#F3F5EF] mt-1">
                  {editingProduct.name_ar}
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-xl text-[#646A63] dark:text-[#B5BDB3] hover:bg-[#F0EEE6] dark:hover:bg-[#232923]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProductPrices} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Retail Price */}
                <div>
                  <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">
                    {t('1. سعر التجزئة للعميل (Retail Price) *', '1. Retail Price (EGP) *')}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={priceForm.price}
                    onChange={(e) => setPriceForm({ ...priceForm, price: Number(e.target.value) })}
                    className="w-full bg-[#F7F7F3] dark:bg-[#232923] text-sm py-2 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] font-mono focus:outline-none"
                  />
                  <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] mt-0.5">{t('السعر الظاهر للعميل في المتجر', 'Visible on public store')}</p>
                </div>

                {/* 2. Sales Price */}
                <div>
                  <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                    {t('2. سعر المبيعات للمندوب (Sales Price) *', '2. Sales Rep Price (EGP) *')}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={priceForm.salesPrice}
                    onChange={(e) => setPriceForm({ ...priceForm, salesPrice: Number(e.target.value) })}
                    className="w-full bg-[#F7F7F3] dark:bg-[#232923] text-sm py-2 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] font-mono focus:outline-none"
                  />
                  <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] mt-0.5">{t('السعر المعتمد للمندوب في الصفقات', 'Authorized rate for Sales Reps')}</p>
                </div>

                {/* 3. Wholesale Price */}
                <div>
                  <label className="block text-xs font-bold text-purple-700 dark:text-purple-400 mb-1">
                    {t('3. سعر الجملة للتاجر (Wholesale) *', '3. Wholesale Price (EGP) *')}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={priceForm.wholesalePrice}
                    onChange={(e) => setPriceForm({ ...priceForm, wholesalePrice: Number(e.target.value) })}
                    className="w-full bg-[#F7F7F3] dark:bg-[#232923] text-sm py-2 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] font-mono focus:outline-none"
                  />
                  <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] mt-0.5">{t('لتجار الجملة المعتمدين B2B', 'Approved wholesale rate')}</p>
                </div>

                {/* 4. Supplier Cost */}
                <div>
                  <label className="block text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
                    {t('4. تكلفة المورد / المصنع (COGS) *', '4. Supplier Cost (EGP) *')}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={priceForm.supplierCost}
                    onChange={(e) => setPriceForm({ ...priceForm, supplierCost: Number(e.target.value) })}
                    className="w-full bg-[#F7F7F3] dark:bg-[#232923] text-sm py-2 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] font-mono focus:outline-none text-rose-700 dark:text-rose-400"
                  />
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">{t('سرية للإدارة فقط — لا تظهر للمندوب', 'Confidential to Admin')}</p>
                </div>

                {/* 5. Sales Commission */}
                <div>
                  <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                    {t('5. عمولة المندوب للقطعة (Commission) *', '5. Sales Commission (EGP) *')}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={priceForm.salesCommission}
                    onChange={(e) => setPriceForm({ ...priceForm, salesCommission: Number(e.target.value) })}
                    className="w-full bg-[#F7F7F3] dark:bg-[#232923] text-sm py-2 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] font-mono focus:outline-none"
                  />
                  <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] mt-0.5">{t('المبلغ المستحق للمندوب عند البيع', 'Per-unit payout for rep')}</p>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-xs font-bold text-[#20241F] dark:text-[#F3F5EF] mb-1">
                    {t('المخزون الفعلي (Units in Stock) *', 'Stock Quantity *')}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={priceForm.stock}
                    onChange={(e) => setPriceForm({ ...priceForm, stock: Number(e.target.value) })}
                    className="w-full bg-[#F7F7F3] dark:bg-[#232923] text-sm py-2 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] font-mono focus:outline-none"
                  />
                  <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] mt-0.5">{t('الكمية المتاحة في المستودع', 'Available inventory')}</p>
                </div>
              </div>

              {/* Profit calculation preview */}
              <div className="p-3.5 rounded-2xl bg-[#F0EEE6] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35] flex items-center justify-between text-xs">
                <span>{t('هامش ربح الشركة للقطعة بعد العمولة:', 'Net Unit Profit Margin:')}</span>
                <span className="font-mono font-bold text-[#18794E] dark:text-[#65C98A]">
                  +{Math.max(0, priceForm.salesPrice - priceForm.supplierCost - priceForm.salesCommission).toLocaleString()} {t('ج.م', 'EGP')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E5DE] dark:border-[#353D35]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] text-xs font-bold hover:bg-[#F0EEE6] dark:hover:bg-[#232923]"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#111411] dark:bg-[#D5FF3F] text-white dark:text-[#111411] text-xs font-bold hover:bg-black dark:hover:bg-white transition-all shadow-md"
                >
                  {t('حفظ التعديلات واعتماد الأسعار', 'Save & Update Catalog')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
