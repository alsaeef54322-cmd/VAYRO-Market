import React from 'react';
import { CheckCircle2, Package, Truck, MapPin, Printer, ArrowLeft, ArrowRight, Clock, Phone, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { EGYPTIAN_GOVERNORATES } from '../../data/products';

export const OrderConfirmation: React.FC = () => {
  const { t, dir } = useLanguage();
  const { latestOrder, setCurrentPage } = useStore();

  if (!latestOrder) {
    return (
      <div className="bg-[#F5F2E9] min-h-screen py-20 text-center">
        <h2 className="text-xl font-bold text-[#111310]">{t('لا يوجد طلب نشط حاليًا', 'No active order found')}</h2>
        <button
          onClick={() => setCurrentPage('home')}
          className="mt-4 py-2.5 px-6 rounded-xl bg-[#111310] text-[#D5FF3F] text-xs font-bold"
        >
          {t('العودة للرئيسية', 'Back to Home')}
        </button>
      </div>
    );
  }

  const governorate = EGYPTIAN_GOVERNORATES.find((g) => g.id === latestOrder.customer.governorateId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#F5F2E9] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Celebration Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#111310]/10 shadow-sm text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#D5FF3F] text-[#111310] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <CheckCircle2 size={36} />
          </div>

          <span className="text-[11px] font-mono tracking-widest uppercase text-[#586249] font-bold">
            {t('تم تسجيل وتأكيد الطلب بنجاح', 'ORDER CONFIRMED')}
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-[#111310] mt-1 tracking-tight">
            {t('شكرًا لاختيارك VAYRO Market!', 'Thank You for Choosing VAYRO!')}
          </h1>

          <p className="text-xs sm:text-sm text-[#111310]/70 mt-2 max-w-lg mx-auto leading-relaxed">
            {t(
              `تم استلام طلبك رقم #${latestOrder.orderNumber} وسيتم إرسال رسالة نصية لتأكيد موعد التوصيل على رقم هاتفك ${latestOrder.customer.phone}.`,
              `Your order #${latestOrder.orderNumber} has been scheduled. An SMS delivery confirmation will be dispatched to ${latestOrder.customer.phone}.`
            )}
          </p>

          <div className="mt-6 inline-flex items-center gap-3 bg-[#F5F2E9] px-4 py-2 rounded-2xl border border-[#111310]/10 text-xs font-mono font-bold text-[#111310]">
            <span>{t('رقم التتبع والطلب:', 'Tracking ID:')}</span>
            <span className="text-base text-[#111310] font-black">{latestOrder.orderNumber}</span>
          </div>
        </div>

        {/* Live Order Timeline Progress */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#111310]/10 shadow-sm mb-8 text-right">
          <h3 className="text-sm font-bold text-[#111310] mb-6 flex items-center gap-2">
            <Clock size={16} />
            <span>{t('مراحل تجهيز وشحن طلبك', 'Live Order Timeline')}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-2">✓</span>
              <p className="font-bold text-xs">{t('تم تأكيد الطلب', 'Order Placed')}</p>
              <p className="text-[10px] text-emerald-800 mt-0.5">{t('تم حجز القطع من المستودع', 'Reserved from hubs')}</p>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-2xl bg-[#D5FF3F]/30 border border-[#D5FF3F] text-[#111310]">
              <span className="w-6 h-6 rounded-full bg-[#111310] text-[#D5FF3F] text-xs font-bold flex items-center justify-center mb-2 animate-pulse">2</span>
              <p className="font-bold text-xs">{t('جاري التجهيز والفحص', 'Processing')}</p>
              <p className="text-[10px] text-[#111310]/70 mt-0.5">{t('فحص الجودة والتغليف الفاخر', 'Quality check & packaging')}</p>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-2xl bg-[#F5F2E9] border border-[#111310]/10 text-[#111310]/60">
              <span className="w-6 h-6 rounded-full bg-[#111310]/20 text-[#111310] text-xs font-bold flex items-center justify-center mb-2">3</span>
              <p className="font-bold text-xs">{t('مع مندوب الشحن', 'With Courier')}</p>
              <p className="text-[10px] text-[#111310]/50 mt-0.5">{latestOrder.estimatedDeliveryDate}</p>
            </div>

            {/* Step 4 */}
            <div className="p-3 rounded-2xl bg-[#F5F2E9] border border-[#111310]/10 text-[#111310]/60">
              <span className="w-6 h-6 rounded-full bg-[#111310]/20 text-[#111310] text-xs font-bold flex items-center justify-center mb-2">4</span>
              <p className="font-bold text-xs">{t('الاستلام والفحص', 'Delivered')}</p>
              <p className="text-[10px] text-[#111310]/50 mt-0.5">{t('عند باب منزلك', 'Doorstep delivery')}</p>
            </div>
          </div>
        </div>

        {/* Order Details Breakdown Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#111310]/10 shadow-sm text-right mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-[#111310]/10 mb-6">
            <h3 className="text-base font-bold text-[#111310]">
              {t('تفاصيل المنتجات والفاتورة', 'Items & Invoice Breakdown')}
            </h3>
            <button
              onClick={handlePrint}
              className="text-xs font-bold text-[#111310] flex items-center gap-1.5 hover:underline"
            >
              <Printer size={14} />
              <span>{t('طباعة الفاتورة', 'Print Invoice')}</span>
            </button>
          </div>

          {/* Items */}
          <div className="divide-y divide-[#111310]/5 mb-6">
            {latestOrder.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product.images[0]}
                    alt=""
                    className="w-12 h-14 object-cover rounded-lg bg-[#F5F2E9]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#111310]">
                      {t(item.product.name_ar, item.product.name_en)}
                    </p>
                    <p className="text-[11px] text-[#111310]/60">
                      {item.selectedColor} • {item.selectedSize} • {t('الكمية:', 'Qty:')} {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#111310]">
                  {(item.product.price * item.quantity).toLocaleString()} {t('ج.م', 'EGP')}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="space-y-1.5 text-xs text-[#111310]/70 pt-4 border-t border-[#111310]/10 max-w-xs ml-auto mr-0">
            <div className="flex justify-between">
              <span>{t('المجموع الفرعي:', 'Subtotal:')}</span>
              <span>{latestOrder.subtotal.toLocaleString()} {t('ج.م', 'EGP')}</span>
            </div>
            {latestOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>{t('الخصم:', 'Discount:')}</span>
                <span>-{latestOrder.discount.toLocaleString()} {t('ج.م', 'EGP')}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#111310]/10 flex justify-between text-base font-black text-[#111310]">
              <span>{t('المبلغ النهائي:', 'Grand Total:')}</span>
              <span>{latestOrder.total.toLocaleString()} {t('ج.م', 'EGP')}</span>
            </div>
          </div>

          {/* Delivery and Customer Info Pill */}
          <div className="mt-8 pt-6 border-t border-[#111310]/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#111310]/80">
            <div>
              <p className="font-bold text-[#111310] mb-1">{t('عنوان التسليم:', 'Delivery Address:')}</p>
              <p>{latestOrder.customer.name}</p>
              <p>{latestOrder.customer.addressLine}, {latestOrder.customer.city}</p>
              <p>{governorate ? t(governorate.name_ar, governorate.name_en) : ''} - مصر</p>
            </div>
            <div>
              <p className="font-bold text-[#111310] mb-1">{t('طريقة الدفع والتواصل:', 'Payment & Contact:')}</p>
              <p>{latestOrder.paymentMethod === 'cod' ? t('الدفع نقدًا عند الاستلام', 'Cash on Delivery') : t('دفع إلكتروني', 'Digital Payment')}</p>
              <p dir="ltr">{latestOrder.customer.phone}</p>
              <p>{latestOrder.customer.email}</p>
            </div>
          </div>
        </div>

        {/* Actions Button Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage('account')}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#111310] text-[#D5FF3F] hover:bg-black font-bold text-xs transition-all shadow-md"
          >
            {t('عرض طلباتي وتتبع الشحنة في حسابي', 'View in My Orders')}
          </button>

          <button
            onClick={() => setCurrentPage('home')}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-white border border-[#111310]/20 text-[#111310] hover:bg-[#F5F2E9] font-bold text-xs transition-all"
          >
            {t('متابعة التسوق في VAYRO', 'Continue Shopping')}
          </button>
        </div>

      </div>
    </div>
  );
};
