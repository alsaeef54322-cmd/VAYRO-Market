import React, { useState } from 'react';
import {
  User,
  Package,
  Heart,
  MapPin,
  MessageSquare,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Plus,
  Trash2,
  LogOut,
  Bell,
  Check,
  AlertCircle,
  Star
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import { PRODUCTS, EGYPTIAN_GOVERNORATES } from '../../data/products';
import { api } from '../../services/api';
import { ReturnRequest, SupportTicket, AddressItem, Order } from '../../types';
import { OrderTrackingModal } from './OrderTrackingModal';

export const AccountPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const {
    currentUser,
    setCurrentUser,
    openAuthModal,
    logoutCustomer,
    wishlist,
    setCurrentPage,
    showToast,
    openReviewModal,
    navigateToProduct
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'returns' | 'support' | 'wishlist' | 'preferences'>('orders');
  
  // Order Tracking Modal State
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingSearchInput, setTrackingSearchInput] = useState('');

  // Customer Profile Form
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || 'أحمد محمود العبد',
    email: currentUser?.email || 'ahmed.m@example.com',
    phone: currentUser?.phone || '01012345678',
    governorateId: currentUser?.governorateId || 'cairo',
    city: currentUser?.city || 'المعادي',
    addressLine: currentUser?.addressLine || 'شارع 9، عمارة 14، الدور الثالث'
  });

  // Addresses State
  const [addresses, setAddresses] = useState<AddressItem[]>(() =>
    currentUser ? api.getAddresses(currentUser.id) : []
  );
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: '',
    recipientName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    governorateId: 'cairo',
    city: '',
    addressLine: '',
    isDefault: false
  });

  // Return Requests State
  const [returns, setReturns] = useState<ReturnRequest[]>(() =>
    currentUser ? api.getReturnRequests(currentUser.id) : []
  );
  const [isFilingReturn, setIsFilingReturn] = useState(false);
  const [newReturn, setNewReturn] = useState({
    orderNumber: 'VYR-72819',
    itemName: 'قميص كاجوال بخامة مريحة - مقاس L',
    reason: 'size_mismatch' as const,
    notes: ''
  });

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    currentUser ? api.getSupportTickets(currentUser.id) : []
  );
  const [isFilingTicket, setIsFilingTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<SupportTicket['category']>('shipping');
  const [ticketMessage, setTicketMessage] = useState('');

  // Communication Preferences State
  const [prefs, setPrefs] = useState({
    smsUpdates: currentUser?.communicationPreferences?.smsUpdates ?? true,
    whatsappAlerts: currentUser?.communicationPreferences?.whatsappAlerts ?? true,
    newsletter: currentUser?.communicationPreferences?.newsletter ?? true
  });

  const savedOrders = api.getSavedOrders();
  const wishlistProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  // If not logged in, show polished guest account CTA
  if (!currentUser) {
    return (
      <div className="bg-[#F7F7F3] min-h-[70vh] py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-white rounded-3xl p-8 border border-[#20241F]/10 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#20241F] text-[#D5FF3F] flex items-center justify-center mx-auto mb-5 font-black text-2xl shadow-md">
            <User size={30} />
          </div>
          <h2 className="text-2xl font-black text-[#20241F]">
            {t('مرحبًا بك في VAYRO Market', 'Welcome to VAYRO Market')}
          </h2>
          <p className="text-xs text-[#20241F]/60 mt-2 leading-relaxed">
            {t(
              'يرجى تسجيل الدخول أو إنشاء حساب عميل جديد للوصول إلى طلباتك المسجلة، تتبع الشحنات، وإدارة العناوين والمفضلة.',
              'Sign in or register as a customer to access your past orders, delivery tracking, and addresses.'
            )}
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => openAuthModal('login')}
              className="py-3 px-6 rounded-xl bg-[#20241F] text-[#D5FF3F] hover:bg-black font-bold text-xs shadow-md"
            >
              {t('تسجيل الدخول إلى حسابي', 'Sign In to My Account')}
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="py-3 px-6 rounded-xl bg-[#F7F7F3] text-[#20241F] hover:bg-[#ECEAE1] font-bold text-xs border border-[#20241F]/15"
            >
              {t('إنشاء حساب عميل جديد', 'Create New Account')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      const updated = api.updateCustomerProfile(currentUser.id, profileForm);
      if (updated) {
        setCurrentUser(updated);
        showToast(t('تم تحديث بياناتك الشخصية بنجاح!', 'Profile updated successfully!'), 'success');
      }
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.label || !newAddr.addressLine || !newAddr.city) {
      showToast(t('يرجى ملء جميع حقول العنوان', 'Please fill all address fields'), 'error');
      return;
    }
    const created = api.addAddress(currentUser.id, newAddr);
    setAddresses(api.getAddresses(currentUser.id));
    setIsAddingAddress(false);
    showToast(t('تمت إضافة العنوان الجديد بنجاح!', 'Address added successfully!'), 'success');
    setNewAddr({
      label: '',
      recipientName: currentUser.name,
      phone: currentUser.phone,
      governorateId: 'cairo',
      city: '',
      addressLine: '',
      isDefault: false
    });
  };

  const handleDeleteAddress = (id: string) => {
    api.deleteAddress(currentUser.id, id);
    setAddresses(api.getAddresses(currentUser.id));
    showToast(t('تم حذف العنوان', 'Address deleted'), 'info');
  };

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const created = api.createReturnRequest(currentUser.id, {
      orderId: 'ord_sample_1',
      orderNumber: newReturn.orderNumber,
      itemName: newReturn.itemName,
      reason: newReturn.reason,
      notes: newReturn.notes
    });
    setReturns(api.getReturnRequests(currentUser.id));
    setIsFilingReturn(false);
    showToast(t('تم تسجيل طلب الاسترجاع / الاستبدال بنجاح! سيتواصل معك المندوب لاستلام القطعة.', 'Return request submitted successfully.'), 'success');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    const created = api.createSupportTicket(currentUser.id, {
      subject: ticketSubject,
      category: ticketCategory,
      initialMessage: ticketMessage
    });
    setTickets(api.getSupportTickets(currentUser.id));
    setIsFilingTicket(false);
    setTicketSubject('');
    setTicketMessage('');
    showToast(t('تم فتح تذكرة الدعم بنجاح! سيتم الرد خلال ساعة.', 'Support ticket submitted.'), 'success');
  };

  const handleSavePreferences = () => {
    if (currentUser) {
      api.updateCustomerProfile(currentUser.id, { communicationPreferences: prefs });
      showToast(t('تم حفظ تفضيلات التواصل بنجاح!', 'Preferences saved!'), 'success');
    }
  };

  return (
    <div className="bg-[#F7F7F3] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Customer Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20241F]/10 shadow-sm mb-8 text-right flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#20241F] text-[#D5FF3F] flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#20241F]">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#D5FF3F] text-[#20241F] text-[10px] font-mono font-bold">
                  {t('عميل موثق', 'VERIFIED CUSTOMER')}
                </span>
              </div>
              <p className="text-xs text-[#20241F]/60 mt-1" dir="ltr">
                {currentUser.phone} {currentUser.email ? `• ${currentUser.email}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={logoutCustomer}
              className="py-2 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>{t('تسجيل الخروج', 'Log Out')}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar (3 Cols) */}
          <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-[#20241F]/10 shadow-sm text-right space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[#20241F] text-[#D5FF3F]'
                  : 'text-[#20241F] hover:bg-[#F7F7F3]'
              }`}
            >
              <Package size={16} />
              <span>{t('سجل الطلبات والتتبع', 'Orders & Tracking')}</span>
              <span className="mr-auto px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                {savedOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-colors ${
                activeTab === 'addresses'
                  ? 'bg-[#20241F] text-[#D5FF3F]'
                  : 'text-[#20241F] hover:bg-[#F7F7F3]'
              }`}
            >
              <MapPin size={16} />
              <span>{t('عناوين الشحن المحفوظة', 'Saved Addresses')}</span>
              <span className="mr-auto px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                {addresses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('returns')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-colors ${
                activeTab === 'returns'
                  ? 'bg-[#20241F] text-[#D5FF3F]'
                  : 'text-[#20241F] hover:bg-[#F7F7F3]'
              }`}
            >
              <RotateCcw size={16} />
              <span>{t('طلبات الاستبدال والإرجاع', 'Returns & Exchanges')}</span>
              <span className="mr-auto px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                {returns.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-colors ${
                activeTab === 'support'
                  ? 'bg-[#20241F] text-[#D5FF3F]'
                  : 'text-[#20241F] hover:bg-[#F7F7F3]'
              }`}
            >
              <MessageSquare size={16} />
              <span>{t('تذاكر الدعم الفني', 'Support Tickets')}</span>
              <span className="mr-auto px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                {tickets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-colors ${
                activeTab === 'wishlist'
                  ? 'bg-[#20241F] text-[#D5FF3F]'
                  : 'text-[#20241F] hover:bg-[#F7F7F3]'
              }`}
            >
              <Heart size={16} />
              <span>{t('قائمة المفضلة', 'Wishlist')}</span>
              <span className="mr-auto px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                {wishlist.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-colors ${
                activeTab === 'preferences'
                  ? 'bg-[#20241F] text-[#D5FF3F]'
                  : 'text-[#20241F] hover:bg-[#F7F7F3]'
              }`}
            >
              <Bell size={16} />
              <span>{t('تفضيلات الإشعارات والتواصل', 'Communication Prefs')}</span>
            </button>
          </div>

          {/* Main Content Pane (9 Cols) */}
          <div className="lg:col-span-9 text-right">
            
            {/* 1. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <h2 className="text-lg font-black text-[#20241F]">
                      {t('طلباتك المسجلة وحالة الشحن', 'Your Orders & Tracking')}
                    </h2>
                    <p className="text-xs text-[#20241F]/60 mt-0.5">
                      {t('شحن آمن مع تتبع فوري لمندوب التوصيل لباب منزلك في مصر', 'Insured Egyptian fulfillment')}
                    </p>
                  </div>
                </div>

                {/* Instant Order Tracking Lookup Bar */}
                <div className="bg-white p-4 rounded-3xl border border-[#20241F]/10 shadow-sm flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full relative">
                    <input
                      type="text"
                      value={trackingSearchInput}
                      onChange={(e) => setTrackingSearchInput(e.target.value)}
                      placeholder={t('أدخل رقم الطلب أو بوليصة الشحن (مثال: VYR-72819)', 'Enter Order # or Waybill to track (e.g. VYR-72819)')}
                      className="w-full bg-[#F7F7F3] text-xs py-2.5 px-4 rounded-xl border border-[#20241F]/15 focus:outline-none focus:border-[#20241F] font-mono text-[#20241F] placeholder:font-sans"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const query = trackingSearchInput.trim().toLowerCase();
                      const match = savedOrders.find((o) =>
                        o.orderNumber.toLowerCase().includes(query)
                      ) || savedOrders[0];
                      if (match) {
                        setSelectedOrderForTracking(match);
                        setIsTrackingModalOpen(true);
                      } else {
                        showToast(t('لم يتم العثور على طلب بهذا الرقم', 'Order not found'), 'warning');
                      }
                    }}
                    className="w-full sm:w-auto py-2.5 px-5 bg-[#20241F] text-[#D5FF3F] hover:bg-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
                  >
                    <Truck size={15} />
                    <span>{t('تتبع دورة الشحنة الحية', 'Track Shipment')}</span>
                  </button>
                </div>

                {savedOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-3xl p-6 border border-[#20241F]/10 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#20241F]/10 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#20241F]">
                            #{order.orderNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#18794E] text-white">
                            {order.status === 'confirmed' ? t('تم التأكيد', 'Confirmed') : t('قيد الشحن', 'In Transit')}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#20241F]/50 mt-1">
                          {t('تاريخ الشراء:', 'Date:')} {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>

                      <div className="text-left">
                        <span className="text-sm font-black text-[#20241F]">
                          {order.total.toLocaleString()} {t('ج.م', 'EGP')}
                        </span>
                        <p className="text-[10px] text-[#20241F]/50">
                          {order.paymentMethod === 'cod' ? t('دفع عند الاستلام', 'Cash on Delivery') : t('دفع إلكتروني', 'Digital Payment')}
                        </p>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="py-4 divide-y divide-[#20241F]/5">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div
                            onClick={() => navigateToProduct(item.product.id)}
                            className="flex items-center gap-3 cursor-pointer group flex-1"
                          >
                            <img
                              src={item.product.images[0]}
                              alt=""
                              className="w-12 h-14 object-cover rounded-xl bg-[#F7F7F3] group-hover:opacity-90 transition-opacity"
                            />
                            <div>
                              <p className="text-xs font-bold text-[#20241F] group-hover:text-[#18794E] transition-colors">
                                {t(item.product.name_ar, item.product.name_en)}
                              </p>
                              <p className="text-[10px] text-[#20241F]/60">
                                {item.selectedColor} • {item.selectedSize} • {t('الكمية:', 'Qty:')} {item.quantity}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
                            <span className="text-xs font-black text-[#20241F]">
                              {(item.product.price * item.quantity).toLocaleString()} {t('ج.م', 'EGP')}
                            </span>
                            <button
                              type="button"
                              onClick={() => openReviewModal(item.product, order.orderNumber)}
                              className="py-1.5 px-3 rounded-xl bg-[#F7F7F3] hover:bg-[#20241F] hover:text-[#D5FF3F] text-[#20241F] text-[11px] font-bold flex items-center gap-1.5 transition-all border border-[#20241F]/10 shadow-sm"
                            >
                              <Star size={13} className="fill-amber-400 text-amber-400" />
                              <span>{t('تقييم المنتج', 'Review')}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery ETA & Actions with Order Tracker */}
                    <div className="mt-2 p-3.5 rounded-2xl bg-[#F7F7F3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-[#18794E] font-bold">
                        <Truck size={16} />
                        <span>{t('موعد التوصيل المقدر:', 'Estimated Transit:')} {order.estimatedDeliveryDate}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForTracking(order);
                            setIsTrackingModalOpen(true);
                          }}
                          className="py-1.5 px-3.5 rounded-xl bg-[#20241F] text-[#D5FF3F] hover:bg-black text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Truck size={13} />
                          <span>{t('تتبع دورة الطلب الحية', 'Track Lifecycle')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('returns');
                            setNewReturn((prev) => ({
                              ...prev,
                              orderNumber: order.orderNumber,
                              itemName: `${order.items[0]?.product.name_ar} - ${order.items[0]?.selectedSize}`
                            }));
                            setIsFilingReturn(true);
                          }}
                          className="text-[11px] font-bold text-[#20241F] hover:underline px-2 py-1"
                        >
                          {t('طلب استبدال / إرجاع', 'Request Return')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20241F]/10 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#20241F]/10">
                  <div>
                    <h2 className="text-base font-bold text-[#20241F]">
                      {t('عناوين التوصيل المسجلة في مصر', 'Saved Delivery Addresses')}
                    </h2>
                    <p className="text-xs text-[#20241F]/60 mt-0.5">
                      {t('يمكنك حفظ أكثر من عنوان وتعيين العنوان الافتراضي لتسريع الشحن.', 'Manage home and office addresses for 1-click checkout.')}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddingAddress(!isAddingAddress)}
                    className="py-2 px-3.5 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={14} />
                    <span>{t('إضافة عنوان جديد', 'Add Address')}</span>
                  </button>
                </div>

                {/* Add Address Form Accordion */}
                {isAddingAddress && (
                  <form onSubmit={handleAddAddress} className="mb-6 p-5 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10 space-y-3">
                    <h3 className="text-xs font-bold text-[#20241F] mb-2">{t('بيانات العنوان الجديد:', 'New Address Details:')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold block mb-1">{t('تسمية العنوان (المنزل، العمل)', 'Label')}</label>
                        <input
                          type="text"
                          required
                          value={newAddr.label}
                          onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                          placeholder={t('مثال: المنزل، بيت الإسكندرية', 'e.g. Home, Office')}
                          className="w-full bg-white border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold block mb-1">{t('اسم المستلم', 'Recipient Name')}</label>
                        <input
                          type="text"
                          required
                          value={newAddr.recipientName}
                          onChange={(e) => setNewAddr({ ...newAddr, recipientName: e.target.value })}
                          className="w-full bg-white border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold block mb-1">{t('المحافظة', 'Governorate')}</label>
                        <select
                          value={newAddr.governorateId}
                          onChange={(e) => setNewAddr({ ...newAddr, governorateId: e.target.value })}
                          className="w-full bg-white border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                        >
                          {EGYPTIAN_GOVERNORATES.map((g) => (
                            <option key={g.id} value={g.id}>{t(g.name_ar, g.name_en)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold block mb-1">{t('المدينة أو الحي', 'City / District')}</label>
                        <input
                          type="text"
                          required
                          value={newAddr.city}
                          onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                          placeholder={t('مثال: مصر الجديدة', 'e.g. Heliopolis')}
                          className="w-full bg-white border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold block mb-1">{t('العنوان التفصيلي (الشارع ورقم العمارة والشقة)', 'Detailed Address')}</label>
                        <input
                          type="text"
                          required
                          value={newAddr.addressLine}
                          onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                          placeholder={t('شارع، عمارة، شقة', 'Street, Building, Flat')}
                          className="w-full bg-white border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                        />
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="py-2 px-4 rounded-xl border text-xs"
                      >
                        {t('إلغاء', 'Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="py-2 px-5 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold"
                      >
                        {t('حفظ العنوان', 'Save Address')}
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        addr.isDefault
                          ? 'border-[#20241F] bg-[#F7F7F3] shadow-sm'
                          : 'border-[#20241F]/15 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#20241F]">
                          <MapPin size={14} className="text-[#18794E]" />
                          <span>{addr.label}</span>
                        </div>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full bg-[#20241F] text-[#D5FF3F] text-[10px] font-bold">
                            {t('افتراضي', 'Default')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#20241F] font-semibold">{addr.recipientName}</p>
                      <p className="text-xs text-[#20241F]/70 mt-1">{addr.addressLine}</p>
                      <p className="text-xs text-[#20241F]/70">{addr.city}، {addr.governorateId} - مصر</p>
                      <div className="mt-3 pt-2.5 border-t border-[#20241F]/10 flex justify-between items-center text-xs">
                        <span className="font-mono text-[11px] text-[#20241F]/60" dir="ltr">{addr.phone}</span>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                          title={t('حذف', 'Delete')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. RETURNS & EXCHANGES TAB */}
            {activeTab === 'returns' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20241F]/10 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#20241F]/10">
                  <div>
                    <h2 className="text-base font-bold text-[#20241F]">
                      {t('طلبات الاستبدال والاسترجاع', 'Exchange & Return Requests')}
                    </h2>
                    <p className="text-xs text-[#20241F]/60 mt-0.5">
                      {t('سياسة VAYRO تتيح لك 14 يومًا استرجاع أو استبدال مجاني.', 'Enjoy a 14-day complimentary return & size exchange guarantee.')}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsFilingReturn(!isFilingReturn)}
                    className="py-2 px-3.5 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={14} />
                    <span>{t('طلب استبدال جديد', 'New Return')}</span>
                  </button>
                </div>

                {isFilingReturn && (
                  <form onSubmit={handleCreateReturn} className="mb-6 p-5 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10 space-y-3">
                    <h3 className="text-xs font-bold text-[#20241F] mb-1">{t('تسجيل طلب استبدال أو استرجاع:', 'File Return Details:')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold block mb-1">{t('رقم الطلب', 'Order Number')}</label>
                        <input
                          type="text"
                          required
                          value={newReturn.orderNumber}
                          onChange={(e) => setNewReturn({ ...newReturn, orderNumber: e.target.value })}
                          className="w-full bg-white border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold block mb-1">{t('القطعة المراد استبدالها', 'Product Item')}</label>
                        <input
                          type="text"
                          required
                          value={newReturn.itemName}
                          onChange={(e) => setNewReturn({ ...newReturn, itemName: e.target.value })}
                          className="w-full bg-white border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold block mb-1">{t('سبب الاستبدال أو الإرجاع', 'Reason')}</label>
                        <select
                          value={newReturn.reason}
                          onChange={(e) => setNewReturn({ ...newReturn, reason: e.target.value as any })}
                          className="w-full bg-white border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                        >
                          <option value="size_mismatch">{t('المقاس غير مناسب (مطلوب مقاس آخر)', 'Size Mismatch (Exchange size)')}</option>
                          <option value="color_different">{t('درجة اللون مختلفة عن الصور', 'Color looks different')}</option>
                          <option value="defective">{t('ملاحظة في خامة أو تقفيل القطعة', 'Defective material or finishing')}</option>
                          <option value="changed_mind">{t('تغيير الرأي (استرداد المبلغ)', 'Changed mind (Refund)')}</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold block mb-1">{t('ملاحظات إضافية للمندوب', 'Courier Notes')}</label>
                        <textarea
                          rows={2}
                          value={newReturn.notes}
                          onChange={(e) => setNewReturn({ ...newReturn, notes: e.target.value })}
                          placeholder={t('اكتب أية تفاصيل تفضل مشاركتها...', 'Additional notes for pickup...')}
                          className="w-full bg-white border border-[#20241F]/15 rounded-xl p-2.5 text-xs"
                        />
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsFilingReturn(false)}
                        className="py-2 px-4 rounded-xl border text-xs"
                      >
                        {t('إلغاء', 'Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="py-2 px-5 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold"
                      >
                        {t('إرسال الطلب', 'Submit Request')}
                      </button>
                    </div>
                  </form>
                )}

                {/* Returns list */}
                <div className="space-y-3">
                  {returns.map((ret) => (
                    <div key={ret.id} className="p-4 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#20241F]">{ret.itemName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D5FF3F] text-[#20241F]">
                            {ret.status === 'inspecting' ? t('جاري فحص المندوب', 'Inspection Scheduled') : t('قيد المراجعة', 'Pending')}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#20241F]/60 mt-1">
                          {t('تابع لطلب رقم:', 'Order:')} #{ret.orderNumber} • {new Date(ret.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                        {ret.notes && (
                          <p className="text-[11px] text-[#20241F]/80 mt-1 italic">"{ret.notes}"</p>
                        )}
                      </div>
                      <span className="text-xs text-[#18794E] font-semibold">{t('مندوب الاستلام سيتواصل معك', 'Courier will call for pickup')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SUPPORT TICKETS TAB */}
            {activeTab === 'support' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20241F]/10 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#20241F]/10">
                  <div>
                    <h2 className="text-base font-bold text-[#20241F]">
                      {t('خدمة عملاء VAYRO Market', 'Customer Care Concierge')}
                    </h2>
                    <p className="text-xs text-[#20241F]/60 mt-0.5">
                      {t('تواصل مباشر مع فريق الدعم لحل أي استفسارات تخص الشحنات والمقاسات.', 'Dedicated direct ticket history and resolution.')}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsFilingTicket(!isFilingTicket)}
                    className="py-2 px-3.5 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={14} />
                    <span>{t('تذكرة جديدة', 'New Ticket')}</span>
                  </button>
                </div>

                {isFilingTicket && (
                  <form onSubmit={handleCreateTicket} className="mb-6 p-5 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10 space-y-3">
                    <h3 className="text-xs font-bold text-[#20241F] mb-1">{t('فتح تذكرة دعم فني جديدة:', 'Open Support Ticket:')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold block mb-1">{t('موضوع التذكرة', 'Subject')}</label>
                        <input
                          type="text"
                          required
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          placeholder={t('مثال: استفسار عن مواعيد تسليم المعادي', 'e.g. Delivery schedule inquiry')}
                          className="w-full bg-white border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold block mb-1">{t('التصنيف', 'Category')}</label>
                        <select
                          value={ticketCategory}
                          onChange={(e) => setTicketCategory(e.target.value as any)}
                          className="w-full bg-white border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                        >
                          <option value="shipping">{t('الشحن والتوصيل', 'Shipping & Transit')}</option>
                          <option value="sizing">{t('المقاسات والخامات', 'Sizing & Fabrics')}</option>
                          <option value="return">{t('استبدال واسترجاع', 'Returns')}</option>
                          <option value="wholesale">{t('تجارة الجملة والشركات', 'Wholesale Inquiry')}</option>
                          <option value="general">{t('استفسار عام', 'General')}</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold block mb-1">{t('نص الرسالة أو الاستفسار', 'Message')}</label>
                        <textarea
                          rows={3}
                          required
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          placeholder={t('اكتب استفسارك بالتفصيل...', 'Provide details...')}
                          className="w-full bg-white border border-[#20241F]/15 rounded-xl p-3 text-xs"
                        />
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsFilingTicket(false)}
                        className="py-2 px-4 rounded-xl border text-xs"
                      >
                        {t('إلغاء', 'Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="py-2 px-5 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold"
                      >
                        {t('إرسال التذكرة', 'Submit Ticket')}
                      </button>
                    </div>
                  </form>
                )}

                {/* Ticket cards */}
                <div className="space-y-4">
                  {tickets.map((tkt) => (
                    <div key={tkt.id} className="p-5 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10">
                      <div className="flex justify-between items-center pb-3 border-b border-[#20241F]/10 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#20241F]">#{tkt.ticketNumber}</span>
                          <span className="font-bold text-xs text-[#20241F]">{tkt.subject}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#18794E] text-white">
                          {tkt.status === 'in_progress' ? t('قيد المتابعة مع الفريق', 'In Progress') : t('مفتوحة', 'Open')}
                        </span>
                      </div>

                      {/* Messages Thread */}
                      <div className="space-y-2.5 text-xs">
                        {tkt.messages.map((m) => (
                          <div
                            key={m.id}
                            className={`p-3 rounded-xl max-w-lg ${
                              m.sender === 'customer'
                                ? 'bg-white ml-auto border border-[#20241F]/5 text-right'
                                : 'bg-[#D5FF3F]/30 mr-auto text-right text-[#20241F]'
                            }`}
                          >
                            <div className="flex justify-between text-[10px] text-[#20241F]/50 mb-1">
                              <span className="font-bold text-[#20241F]">
                                {m.sender === 'customer' ? t('أنت', 'You') : t('فريق خدمة عملاء VAYRO', 'VAYRO Concierge')}
                              </span>
                              <span>{m.timestamp}</span>
                            </div>
                            <p>{m.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-[#20241F]">
                    {t('القطع المحفوظة في مفضلتك', 'Your Saved Wishlist')} ({wishlistProducts.length})
                  </h2>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-[#20241F]/10">
                    <Heart size={36} className="mx-auto text-[#20241F]/30 mb-4" />
                    <h3 className="text-base font-bold text-[#20241F]">
                      {t('لم تحفظ أي قطع في المفضلة بعد', 'Your wishlist is empty')}
                    </h3>
                    <p className="text-xs text-[#20241F]/60 mt-1 max-w-sm mx-auto">
                      {t('اضغط على رمز القلب لحفظ القطع المفضلة والرجوع إليها لاحقًا.', 'Save pieces to view them anytime.')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlistProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. COMMUNICATION PREFERENCES & PROFILE SETTINGS */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20241F]/10 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[#20241F]">
                    {t('تفضيلات الإشعارات والخصوصية', 'Communication & Privacy Preferences')}
                  </h2>
                  <p className="text-xs text-[#20241F]/60 mt-1">
                    {t('تحكم في قنوات التواصل والرسائل التي تفضل استقبالها من متجر VAYRO مصر.', 'Control channels and frequency of operational and promotional updates.')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F7F3] border border-[#20241F]/10 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-[#20241F]">{t('إشعارات الشحن عبر رسائل SMS', 'SMS Delivery Updates')}</p>
                      <p className="text-[11px] text-[#20241F]/60">{t('إرسال كود التتبع وموعد وصول مندوب الشحن.', 'Order tracking updates and courier ETA.')}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.smsUpdates}
                      onChange={(e) => setPrefs({ ...prefs, smsUpdates: e.target.checked })}
                      className="w-4 h-4 rounded text-[#18794E] accent-[#20241F]"
                    />
                  </label>

                  <div className="border-t border-[#20241F]/10 my-2" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-[#20241F]">{t('تنبيهات فورية عبر الواتساب (WhatsApp)', 'WhatsApp Notifications')}</p>
                      <p className="text-[11px] text-[#20241F]/60">{t('تأكيد الطلبات ورابط تتبع الشحنة المباشر.', 'Instant confirmations and direct concierge chat.')}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.whatsappAlerts}
                      onChange={(e) => setPrefs({ ...prefs, whatsappAlerts: e.target.checked })}
                      className="w-4 h-4 rounded text-[#18794E] accent-[#20241F]"
                    />
                  </label>

                  <div className="border-t border-[#20241F]/10 my-2" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-[#20241F]">{t('نشرة VAYRO الحصرية والخصومات', 'VAYRO Journal & Drops')}</p>
                      <p className="text-[11px] text-[#20241F]/60">{t('إشعارات المجموعات الجديدة وكوبونات الخصم الموسمية.', 'Invitations to seasonal drops and promo codes.')}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs.newsletter}
                      onChange={(e) => setPrefs({ ...prefs, newsletter: e.target.checked })}
                      className="w-4 h-4 rounded text-[#18794E] accent-[#20241F]"
                    />
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSavePreferences}
                    className="py-2.5 px-6 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold hover:bg-black transition-colors"
                  >
                    {t('حفظ التفضيلات', 'Save Preferences')}
                  </button>
                </div>

                {/* Edit Profile Section */}
                <div className="pt-6 border-t border-[#20241F]/10">
                  <h3 className="text-sm font-bold text-[#20241F] mb-4">
                    {t('تعديل البيانات الشخصية للعميل', 'Edit Customer Profile')}
                  </h3>

                  <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1">{t('الاسم بالكامل', 'Full Name')}</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">{t('رقم الموبايل المصري', 'Phone Number')}</label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold block mb-1">{t('البريد الإلكتروني', 'Email')}</label>
                      <input
                        type="email"
                        dir="ltr"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full bg-[#F7F7F3] border border-[#20241F]/15 rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        className="py-2.5 px-6 rounded-xl bg-[#20241F] text-[#D5FF3F] text-xs font-bold hover:bg-black"
                      >
                        {t('حفظ التعديلات', 'Update Profile')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Visual Order Lifecycle Tracking Modal */}
      <OrderTrackingModal
        order={selectedOrderForTracking}
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
      />
    </div>
  );
};
