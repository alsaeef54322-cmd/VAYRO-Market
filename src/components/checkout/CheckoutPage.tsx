import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { EGYPTIAN_GOVERNORATES } from '../../data/products';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

export const CheckoutPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const {
    cart,
    cartSubtotal,
    appliedCoupon,
    clearCart,
    setCurrentPage,
    setLatestOrder,
    showToast
  } = useStore();

  const [formData, setFormData] = useState({
    name: 'أحمد محمود العبد',
    email: 'ahmed.m@example.com',
    phone: '01012345678',
    governorateId: 'cairo',
    city: 'المعادي',
    addressLine: 'شارع 9، عمارة 14، الدور الثالث',
    notes: ''
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '•••• •••• •••• 4242',
    expiry: '12/28',
    cvv: '•••'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedGov = EGYPTIAN_GOVERNORATES.find((g) => g.id === formData.governorateId) || EGYPTIAN_GOVERNORATES[0];
  // Internal logistics shipping cost retained for backend fulfillment without customer exposure
  const internalShippingFee = deliveryMethod === 'express' ? selectedGov.shippingFee + 35 : selectedGov.shippingFee;
  const discountAmount = appliedCoupon ? Math.round((cartSubtotal * appliedCoupon.discountPercentage) / 100) : 0;
  // Customer-facing grand total is clear with no hidden shipping fees
  const grandTotal = Math.max(0, cartSubtotal - discountAmount);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errs.name = t('يرجى إدخال الاسم بالكامل', 'Please enter your full name');
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = t('يرجى إدخال بريد إلكتروني صحيح', 'Please enter a valid email address');
    }

    // Egyptian phone validation: starts with 010, 011, 012, 015 and has 11 digits
    const cleanedPhone = formData.phone.replace(/[\s-]/g, '');
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      errs.phone = t('يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015', 'Valid Egyptian mobile number required (010, 011, 012, 015)');
    }

    if (!formData.city.trim()) {
      errs.city = t('يرجى تحديد المنطقة أو المدينة', 'City or district is required');
    }

    if (!formData.addressLine.trim() || formData.addressLine.trim().length < 5) {
      errs.addressLine = t('يرجى كتابة عنوان الشحن بالتفصيل (الشارع والعمارة)', 'Detailed shipping address is required');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast(t('يرجى مراجعة الحقول المطلوبة والتأكد من صحة رقم الهاتف', 'Please correct the highlighted form errors'), 'error');
      return;
    }

    if (cart.length === 0) {
      showToast(t('السلة فارغة، أضف منتجات قبل إتمام الدفع', 'Your cart is empty'), 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.createOrder({
        items: cart,
        customer: {
          id: `cust_${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          governorateId: formData.governorateId,
          city: formData.city,
          addressLine: formData.addressLine
        },
        deliveryMethod,
        paymentMethod,
        subtotal: cartSubtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        shippingFee: internalShippingFee,
        total: grandTotal
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }

      setLatestOrder(response.data);
      clearCart();
      setCurrentPage('order-success');
    } catch (err) {
      showToast(t('حدث خطأ أثناء معالجة الطلب، حاول مرة أخرى', 'An error occurred while creating your order'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F5F2E9] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Page Title */}
        <div className="mb-8 text-right">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#AAB5A0] font-bold block mb-1">
            {t('الدفع والبيانات', 'SECURE CHECKOUT')}
          </span>
          <h1 className="text-3xl font-black text-[#111310] tracking-tight">
            {t('إتمام الطلب والشحن', 'Finalize Your Order')}
          </h1>
          <p className="text-xs text-[#111310]/60 mt-1">
            {t('بياناتك مشفرة ومحمية بأعلى معايير الأمان المعتمدة في مصر.', 'Your personal and delivery details are protected with 256-bit encryption.')}
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Details & Form Inputs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-right">
            
            {/* 1. Customer Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#111310]/10 shadow-sm">
              <h2 className="text-base font-bold text-[#111310] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#111310] text-[#D5FF3F] text-xs flex items-center justify-center font-bold">1</span>
                <span>{t('بيانات العميل والتواصل', 'Customer Information')}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#111310] block mb-1.5">
                    {t('الاسم بالكامل *', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full bg-[#F5F2E9]/40 border rounded-xl py-2.5 px-3.5 text-xs text-[#111310] focus:outline-none ${
                      errors.name ? 'border-rose-500' : 'border-[#111310]/15'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-rose-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111310] block mb-1.5">
                    {t('رقم الموبايل المصري (للتواصل وتأكيد الشحنة) *', 'Egyptian Phone (01xxxxxxxxx) *')}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01012345678"
                    className={`w-full bg-[#F5F2E9]/40 border rounded-xl py-2.5 px-3.5 text-xs text-[#111310] focus:outline-none ${
                      errors.phone ? 'border-rose-500' : 'border-[#111310]/15'
                    }`}
                  />
                  {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#111310] block mb-1.5">
                    {t('البريد الإلكتروني (لتأكيد الطلب والفاتورة) *', 'Email Address *')}
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-[#F5F2E9]/40 border rounded-xl py-2.5 px-3.5 text-xs text-[#111310] focus:outline-none ${
                      errors.email ? 'border-rose-500' : 'border-[#111310]/15'
                    }`}
                  />
                  {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#111310]/10 shadow-sm">
              <h2 className="text-base font-bold text-[#111310] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#111310] text-[#D5FF3F] text-xs flex items-center justify-center font-bold">2</span>
                <span>{t('عنوان التوصيل في مصر', 'Egyptian Delivery Address')}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#111310] block mb-1.5">
                    {t('المحافظة *', 'Governorate *')}
                  </label>
                  <select
                    value={formData.governorateId}
                    onChange={(e) => setFormData({ ...formData, governorateId: e.target.value })}
                    className="w-full bg-[#F5F2E9]/40 border border-[#111310]/15 rounded-xl py-2.5 px-3 text-xs text-[#111310] focus:outline-none"
                  >
                    {EGYPTIAN_GOVERNORATES.map((gov) => (
                      <option key={gov.id} value={gov.id}>
                        {t(gov.name_ar, gov.name_en)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111310] block mb-1.5">
                    {t('المدينة / الحي أو المنطقة *', 'City / District *')}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={t('مثال: التجمع الخامس، مصر الجديدة، سموحة...', 'e.g. New Cairo, Smouha...')}
                    className={`w-full bg-[#F5F2E9]/40 border rounded-xl py-2.5 px-3.5 text-xs text-[#111310] focus:outline-none ${
                      errors.city ? 'border-rose-500' : 'border-[#111310]/15'
                    }`}
                  />
                  {errors.city && <p className="text-[10px] text-rose-600 mt-1">{errors.city}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#111310] block mb-1.5">
                    {t('العنوان التفصيلي (الشارع، رقم العمارة، رقم الشقة) *', 'Street Address, Building & Flat *')}
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine}
                    onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                    className={`w-full bg-[#F5F2E9]/40 border rounded-xl py-2.5 px-3.5 text-xs text-[#111310] focus:outline-none ${
                      errors.addressLine ? 'border-rose-500' : 'border-[#111310]/15'
                    }`}
                  />
                  {errors.addressLine && <p className="text-[10px] text-rose-600 mt-1">{errors.addressLine}</p>}
                </div>
              </div>

              {/* Delivery Speed Options */}
              <div className="mt-5 pt-4 border-t border-[#111310]/10">
                <label className="text-xs font-bold text-[#111310] block mb-2">
                  {t('خيار سرعة التوصيل:', 'Delivery Option:')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setDeliveryMethod('standard')}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      deliveryMethod === 'standard'
                        ? 'border-[#111310] bg-[#F5F2E9]/60 ring-2 ring-[#D5FF3F]'
                        : 'border-[#111310]/15 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck size={18} className="text-[#111310]" />
                      <div>
                        <p className="text-xs font-bold text-[#111310]">{t('شحن قياسي موثوق', 'Standard Delivery')}</p>
                        <p className="text-[10px] text-[#111310]/60">{selectedGov.deliveryDays}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#18794E] px-2 py-0.5 rounded-md bg-[#18794E]/10">
                      {t('توصيل لبابك', 'Doorstep')}
                    </span>
                  </label>

                  <label
                    onClick={() => setDeliveryMethod('express')}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      deliveryMethod === 'express'
                        ? 'border-[#111310] bg-[#F5F2E9]/60 ring-2 ring-[#D5FF3F]'
                        : 'border-[#111310]/15 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={18} className="text-[#899723]" />
                      <div>
                        <p className="text-xs font-bold text-[#111310]">{t('شحن إكسبريس (خلال 24 ساعة)', 'Express 24h Delivery')}</p>
                        <p className="text-[10px] text-[#111310]/60">{t('أولوية تجهيز فورية في نفس اليوم', 'Same-day priority')}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#20241F] px-2 py-0.5 rounded-md bg-[#D5FF3F]">
                      {t('أولوية سريعة', 'Priority')}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 3. Payment Methods */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#111310]/10 shadow-sm">
              <h2 className="text-base font-bold text-[#111310] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#111310] text-[#D5FF3F] text-xs flex items-center justify-center font-bold">3</span>
                <span>{t('طريقة الدفع المعتمدة', 'Payment Method')}</span>
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery (COD) */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#111310] bg-[#F5F2E9]/60 ring-2 ring-[#D5FF3F]'
                      : 'border-[#111310]/15 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote size={20} className="text-[#111310]" />
                    <div>
                      <p className="text-xs font-bold text-[#111310]">{t('الدفع نقدًا عند الاستلام (COD)', 'Cash on Delivery (COD)')}</p>
                      <p className="text-[11px] text-[#111310]/60">{t('عاين طلبك وادفع لمندوب الشحن عند باب منزلك بدون رسوم إضافية.', 'Inspect your order and pay the courier directly.')}</p>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded-full border-2 border-[#111310] flex items-center justify-center">
                    {paymentMethod === 'cod' && <span className="w-2 h-2 rounded-full bg-[#111310]" />}
                  </span>
                </label>

                {/* Credit / Debit Card */}
                <label
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#111310] bg-[#F5F2E9]/60 ring-2 ring-[#D5FF3F]'
                      : 'border-[#111310]/15 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} className="text-[#111310]" />
                    <div>
                      <p className="text-xs font-bold text-[#111310]">{t('بطاقة بنكية (Visa / MasterCard / Meeza)', 'Credit or Debit Card')}</p>
                      <p className="text-[11px] text-[#111310]/60">{t('دفع آمن عبر بوابة الدفع الإلكتروني المشفرة.', 'Encrypted gateway via official banking channels.')}</p>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded-full border-2 border-[#111310] flex items-center justify-center">
                    {paymentMethod === 'card' && <span className="w-2 h-2 rounded-full bg-[#111310]" />}
                  </span>
                </label>
              </div>

              {/* Note on PCI Compliance */}
              <div className="mt-4 flex items-center gap-2 text-[10px] text-[#111310]/50 bg-[#F5F2E9] p-3 rounded-xl">
                <Lock size={13} className="shrink-0" />
                <span>{t('متجر VAYRO لا يقوم بحفظ بيانات بطاقتك البنكية؛ يتم الدفع عبر مشغلي الدفع المعتمدين من البنك المركزي المصري.', 'VAYRO does not store payment credentials. Transactions are handled by official CBE-regulated payment processors.')}</span>
              </div>
            </div>

          </div>

          {/* Order Summary Sidebar (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#111310]/10 shadow-sm text-right sticky top-28">
            <h2 className="text-base font-bold text-[#111310] pb-4 border-b border-[#111310]/10 mb-4">
              {t('ملخص طلبك', 'Order Summary')} ({cart.length} {t('عناصر', 'items')})
            </h2>

            {/* Cart Items list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-[#111310]/5 mb-6 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name_ar}
                    className="w-12 h-14 object-cover rounded-lg bg-[#F5F2E9] shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#111310] line-clamp-1">
                      {t(item.product.name_ar, item.product.name_en)}
                    </p>
                    <p className="text-[10px] text-[#111310]/60">
                      {item.selectedColor} • {item.selectedSize} • {t('الكمية:', 'Qty:')} {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-black text-[#111310]">
                    {(item.product.price * item.quantity).toLocaleString()} {t('ج.م', 'EGP')}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-[#111310]/70 pb-4 border-b border-[#111310]/10">
              <div className="flex justify-between">
                <span>{t('المجموع الفرعي:', 'Subtotal:')}</span>
                <span>{cartSubtotal.toLocaleString()} {t('ج.م', 'EGP')}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>{t('كوبون الخصم:', 'Coupon Discount:')} ({appliedCoupon.code})</span>
                  <span>-{discountAmount.toLocaleString()} {t('ج.م', 'EGP')}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#111310]/10 flex justify-between text-lg font-black text-[#111310]">
                <span>{t('المبلغ الإجمالي:', 'Grand Total:')}</span>
                <span>{grandTotal.toLocaleString()} {t('ج.م', 'EGP')}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full mt-6 py-4 px-6 rounded-xl bg-[#111310] text-[#D5FF3F] hover:bg-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xl group disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{t('جاري تأكيد وتسجيل الطلب...', 'Confirming Order with Backend...')}</span>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>{t('تأكيد وإرسال الطلب الآن', 'Confirm & Place Order')}</span>
                  <ArrowLeft size={14} className={dir === 'ltr' ? 'rotate-180' : ''} />
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#111310]/50">
              <ShieldCheck size={14} className="text-[#586249]" />
              <span>{t('ضمان فحص المنتج قبل الدفع عند الاستلام', 'Inspection prior to payment is fully guaranteed')}</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
