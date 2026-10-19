import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Tag, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';

export const CartDrawer: React.FC = () => {
  const { t, dir } = useLanguage();
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    freeShippingThreshold,
    amountUntilFreeShipping,
    appliedCoupon,
    setAppliedCoupon,
    setCurrentPage,
    showToast
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    const result = await api.validateCoupon(couponInput.trim());
    setIsApplyingCoupon(false);

    if (result.valid) {
      setAppliedCoupon({ code: couponInput.trim().toUpperCase(), discountPercentage: result.discountPercentage });
      showToast(t(result.message_ar, result.message_en), 'success');
      setCouponInput('');
    } else {
      showToast(t(result.message_ar, result.message_en), 'error');
    }
  };

  const discountAmount = appliedCoupon ? Math.round((cartSubtotal * appliedCoupon.discountPercentage) / 100) : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-[#111310]/70 backdrop-blur-sm flex justify-end">
      {/* Backdrop click to dismiss */}
      <div className="flex-1" onClick={() => setIsCartDrawerOpen(false)} />

      {/* Drawer Container */}
      <div className="w-full max-w-md bg-white dark:bg-[#181C17] text-[#111310] dark:text-[#F7F7F3] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#111310]/10 dark:border-white/10 flex items-center justify-between bg-[#F5F2E9]/70 dark:bg-[#141713]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#111310] dark:text-[#D5FF3F]" />
            <h3 className="font-bold text-base text-[#111310] dark:text-[#F7F7F3]">
              {t('حقيبة التسوق', 'Shopping Bag')}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#111310] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#111310] text-xs font-mono font-bold">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-[#111310] dark:text-[#F7F7F3] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Delivery Service Banner */}
        <div className="p-3.5 bg-[#F5F2E9] border-b border-[#111310]/10 text-right flex items-center justify-between text-xs text-[#111310]/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#18794E]" />
            <span className="font-semibold">{t('توصيل لباب المنزل لكافة محافظات مصر', 'Nationwide Door-to-Door Delivery')}</span>
          </div>
          <span className="text-[11px] font-mono text-[#111310]/60">24-48h</span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#111310]/10 text-right">
          {cart.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#F5F2E9] flex items-center justify-center text-[#111310]/40 mb-4">
                <ShoppingBag size={28} />
              </div>
              <h4 className="font-bold text-base text-[#111310]">
                {t('حقيبتك فارغة حاليًا', 'Your bag is empty')}
              </h4>
              <p className="text-xs text-[#111310]/60 mt-1 max-w-xs">
                {t('استكشف تشكيلاتنا الجديدة واكتشف قطعًا مصنوعة بعناية تليق بذوقك.', 'Explore our seasonal drops and find distinct pieces for your collection.')}
              </p>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  setCurrentPage('catalog');
                }}
                className="mt-6 py-2.5 px-6 rounded-xl bg-[#111310] text-[#D5FF3F] text-xs font-bold hover:bg-black transition-all"
              >
                {t('بدء التسوق الآن', 'Start Shopping')}
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-center">
                {/* Product Thumbnail */}
                <img
                  src={item.product.images[0]}
                  alt={item.product.name_ar}
                  className="w-20 h-24 object-cover rounded-xl bg-[#F5F2E9] shrink-0 border border-[#111310]/5"
                />

                {/* Info & Quantity controls */}
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-[#111310] line-clamp-1">
                        {t(item.product.name_ar, item.product.name_en)}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#111310]/40 hover:text-rose-600 transition-colors p-1"
                        title={t('حذف من السلة', 'Remove')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Variant specs */}
                    <div className="text-[11px] text-[#111310]/60 mt-0.5 flex items-center gap-2">
                      {item.selectedColor && (
                        <span>{item.selectedColor}</span>
                      )}
                      {item.selectedSize && (
                        <>
                          <span>•</span>
                          <span>{t('المقاس:', 'Size:')} {item.selectedSize}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-[#111310]/20 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-[#F5F2E9] text-[#111310] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2.5 text-xs font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-[#F5F2E9] text-[#111310] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="text-xs font-black text-[#111310]">
                      {(item.product.price * item.quantity).toLocaleString()} {t('ج.م', 'EGP')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Coupon Code Input */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-[#111310]/10 bg-[#F5F2E9]/40">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <Tag size={13} className="text-emerald-700" />
                  <span>{appliedCoupon.code} ({appliedCoupon.discountPercentage}% OFF)</span>
                </div>
                <button
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
                >
                  {t('إلغاء', 'Remove')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t('كوبون خصم (مثال: VAYRO10)', 'Coupon code (e.g. VAYRO10)')}
                  className="flex-1 bg-white text-[#111310] text-xs py-2 px-3 rounded-xl border border-[#111310]/15 uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon}
                  className="py-2 px-4 rounded-xl bg-[#111310] text-[#D5FF3F] text-xs font-bold hover:bg-black transition-colors"
                >
                  {isApplyingCoupon ? '...' : t('تطبيق', 'Apply')}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Drawer Footer with Subtotal & Proceed to Checkout */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#111310]/10 dark:border-white/10 bg-white dark:bg-[#181C17]">
            <div className="space-y-1.5 text-xs text-right mb-4">
              <div className="flex justify-between text-[#111310]/70 dark:text-[#F7F7F3]/70">
                <span>{t('المجموع الفرعي:', 'Subtotal:')}</span>
                <span>{cartSubtotal.toLocaleString()} {t('ج.م', 'EGP')}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>{t('خصم الكوبون:', 'Discount:')}</span>
                  <span>-{discountAmount.toLocaleString()} {t('ج.م', 'EGP')}</span>
                </div>
              )}

              <div className="pt-2 border-t border-[#111310]/10 dark:border-white/10 flex justify-between text-base font-black text-[#111310] dark:text-[#F7F7F3]">
                <span>{t('الإجمالي:', 'Total:')}</span>
                <span>{finalTotal.toLocaleString()} {t('ج.م', 'EGP')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartDrawerOpen(false);
                setCurrentPage('checkout');
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-[#111310] dark:bg-[#D5FF3F] text-white dark:text-[#111310] hover:bg-black dark:hover:bg-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg group"
            >
              <span>{t('متابعة الدفع الآمن', 'Proceed to Checkout')}</span>
              <ArrowLeft size={15} className={dir === 'ltr' ? 'rotate-180' : ''} />
            </button>

            <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-[#111310]/50 dark:text-[#F7F7F3]/50">
              <ShieldCheck size={13} className="text-[#586249] dark:text-[#D5FF3F]" />
              <span>{t('دفع موثوق ومشفر 100% داخل مصر', '100% Encrypted & Insured Checkout')}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
