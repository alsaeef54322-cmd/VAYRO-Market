import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  DollarSign,
  Package,
  CheckCircle,
  Truck,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  Tag,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { Product, Order } from '../../types';
import { EGYPTIAN_GOVERNORATES } from '../../data/products';

interface OrderItemEntry {
  product: Product;
  color: string;
  size: string;
  quantity: number;
}

interface SalesCreateOrderModalProps {
  initialProduct?: Product | null;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

export const SalesCreateOrderModal: React.FC<SalesCreateOrderModalProps> = ({
  initialProduct,
  onClose,
  onOrderCreated
}) => {
  const { t, dir } = useLanguage();
  const { products, currentStaffRep, showToast } = useStore();

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    governorateId: 'cairo',
    city: 'القاهرة الجديدة',
    addressLine: ''
  });

  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('cod');
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Items for this sales order
  const [items, setItems] = useState<OrderItemEntry[]>(() => {
    if (initialProduct) {
      return [
        {
          product: initialProduct,
          color: initialProduct.colors[0]?.name_ar || 'افتراضي',
          size: initialProduct.sizes[0] || 'Standard',
          quantity: 1
        }
      ];
    }
    const first = products[0];
    return first
      ? [
          {
            product: first,
            color: first.colors[0]?.name_ar || 'افتراضي',
            size: first.sizes[0] || 'Standard',
            quantity: 1
          }
        ]
      : [];
  });

  // Calculate order totals
  const totalSalesPrice = items.reduce((sum, item) => {
    const sPrice = item.product.salesPrice ?? Math.round(item.product.price * 0.88);
    return sum + sPrice * item.quantity;
  }, 0);

  const totalRetailPrice = items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const totalClientSavings = Math.max(0, totalRetailPrice - totalSalesPrice);

  const totalRepCommission = items.reduce((sum, item) => {
    const comm = item.product.salesCommission ?? Math.round(item.product.price * 0.08);
    return sum + comm * item.quantity;
  }, 0);

  const handleAddItem = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) => [
      ...prev,
      {
        product: prod,
        color: prod.colors[0]?.name_ar || 'افتراضي',
        size: prod.sizes[0] || 'Standard',
        quantity: 1
      }
    ]);
  };

  const handleUpdateItem = (index: number, updates: Partial<OrderItemEntry>) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.name.trim() || customer.name.length < 3) {
      showToast(t('يرجى إدخال اسم العميل بالكامل', 'Please enter customer full name'), 'error');
      return;
    }

    const cleanPhone = customer.phone.replace(/[\s-]/g, '');
    if (!/^01[0125][0-9]{8}$/.test(cleanPhone)) {
      showToast(t('رقم الهاتف يجب أن يكون رقم مصري صحيح (11 رقم)', 'Valid Egyptian phone required (010, 011, 012, 015)'), 'error');
      return;
    }

    if (!customer.addressLine.trim()) {
      showToast(t('يرجى إدخال عنوان التوصيل بالتفصيل', 'Please enter delivery address'), 'error');
      return;
    }

    if (items.length === 0) {
      showToast(t('يرجى إضافة منتج واحد على الأقل للطلب', 'Please add at least one item to order'), 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.createSalesOrder({
        repCode: 'EMP-101',
        repName: currentStaffRep || 'مندوب المبيعات',
        customer: {
          name: customer.name.trim(),
          phone: cleanPhone,
          email: customer.email.trim() || undefined,
          governorateId: customer.governorateId,
          city: customer.city.trim() || 'القاهرة',
          addressLine: customer.addressLine.trim()
        },
        items: items.map((it) => ({
          productId: it.product.id,
          color: it.color,
          size: it.size,
          quantity: it.quantity
        })),
        paymentMethod,
        deliveryMethod,
        notes: notes.trim() || undefined
      });

      setIsSubmitting(false);

      if (res && res.data) {
        showToast(
          t(
            `تم تسجيل الطلب #${res.data.orderNumber} بنجاح! عمولتك المقررة: ${res.data.salesCommissionEarned || totalRepCommission} ج.م`,
            `Order #${res.data.orderNumber} placed! Commission earned: ${res.data.salesCommissionEarned || totalRepCommission} EGP`
          ),
          'success'
        );
        onOrderCreated(res.data);
        onClose();
      }
    } catch (err) {
      setIsSubmitting(false);
      showToast(t('حدث خطأ أثناء تسجيل الطلب', 'Error submitting order'), 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1A1F1A] rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-[#E2E5DE] dark:border-[#353D35] shadow-2xl relative text-right my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E5DE] dark:border-[#353D35] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#20241F] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#111411] flex items-center justify-center shadow-md font-black">
              <Package size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#18794E] text-white">
                  {t('بوابة المندوب', 'SALES REP')}
                </span>
                <span className="text-xs text-[#646A63] dark:text-[#B5BDB3]">
                  {t('المسؤول:', 'Rep:')} <strong className="text-[#20241F] dark:text-[#F3F5EF]">{currentStaffRep}</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold font-display text-[#20241F] dark:text-[#F3F5EF] mt-0.5">
                {t('تسجيل طلب عميل جديد بسعر المندوب المعتمد', 'Create Client Order at Authorized Sales Price')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#646A63] dark:text-[#B5BDB3] hover:bg-[#F0EEE6] dark:hover:bg-[#232923] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Customer Information */}
          <div className="p-5 rounded-2xl bg-[#F7F7F3] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35] space-y-4">
            <h3 className="text-xs font-bold text-[#20241F] dark:text-[#F3F5EF] flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <User size={15} className="text-[#18794E] dark:text-[#65C98A]" />
              <span>{t('١. بيانات العميل والتوصيل', '1. Client Contact & Delivery Address')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#646A63] dark:text-[#B5BDB3] mb-1 font-medium">
                  {t('اسم العميل بالكامل *', 'Full Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder={t('مثال: م. أحمد منصور', 'e.g. Ahmed Mansour')}
                  className="w-full bg-white dark:bg-[#1A1F1A] text-[#20241F] dark:text-[#F3F5EF] p-2.5 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#646A63] dark:text-[#B5BDB3] mb-1 font-medium">
                  {t('رقم الموبايل المصري *', 'Egyptian Mobile Number *')}
                </label>
                <input
                  type="tel"
                  required
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="01012345678"
                  className="w-full bg-white dark:bg-[#1A1F1A] text-[#20241F] dark:text-[#F3F5EF] p-2.5 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#646A63] dark:text-[#B5BDB3] mb-1 font-medium">
                  {t('المحافظة *', 'Governorate *')}
                </label>
                <select
                  value={customer.governorateId}
                  onChange={(e) => setCustomer({ ...customer, governorateId: e.target.value })}
                  className="w-full bg-white dark:bg-[#1A1F1A] text-[#20241F] dark:text-[#F3F5EF] p-2.5 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none"
                >
                  {EGYPTIAN_GOVERNORATES.map((gov) => (
                    <option key={gov.id} value={gov.id}>
                      {t(gov.name_ar, gov.name_en)} ({gov.deliveryDays})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#646A63] dark:text-[#B5BDB3] mb-1 font-medium">
                  {t('المدينة / الحي *', 'City / District *')}
                </label>
                <input
                  type="text"
                  required
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  placeholder={t('مثال: التجمع الخامس، المعادي...', 'e.g. New Cairo')}
                  className="w-full bg-white dark:bg-[#1A1F1A] text-[#20241F] dark:text-[#F3F5EF] p-2.5 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#646A63] dark:text-[#B5BDB3] mb-1 font-medium">
                  {t('عنوان الشارع والعمارة والشقة *', 'Street Address, Building & Flat *')}
                </label>
                <input
                  type="text"
                  required
                  value={customer.addressLine}
                  onChange={(e) => setCustomer({ ...customer, addressLine: e.target.value })}
                  placeholder={t('مثال: شارع التسعين الجنوبي، عمارة 14، الدور الثالث', 'Detailed address')}
                  className="w-full bg-white dark:bg-[#1A1F1A] text-[#20241F] dark:text-[#F3F5EF] p-2.5 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Order Items Selection */}
          <div className="p-5 rounded-2xl bg-[#F7F7F3] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#20241F] dark:text-[#F3F5EF] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Package size={15} className="text-[#18794E] dark:text-[#65C98A]" />
                <span>{t('٢. المنتجات المطلوبة (بسعر المندوب المعتمد)', '2. Selected Items (Sales Rep Pricing)')}</span>
              </h3>

              {/* Add product dropdown */}
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddItem(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="text-xs bg-white dark:bg-[#1A1F1A] text-[#20241F] dark:text-[#F3F5EF] py-1.5 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>+ {t('إضافة موديل للطلب...', '+ Add item to order...')}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {t(p.name_ar, p.name_en)} — {p.salesPrice ?? Math.round(p.price * 0.88)} {t('ج.م', 'EGP')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {items.map((item, idx) => {
                const sPrice = item.product.salesPrice ?? Math.round(item.product.price * 0.88);
                const comm = item.product.salesCommission ?? Math.round(item.product.price * 0.08);

                return (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#1A1F1A] border border-[#E2E5DE] dark:border-[#353D35] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name_ar}
                        className="w-12 h-14 rounded-xl object-cover shrink-0 border border-[#E2E5DE] dark:border-[#353D35]"
                      />
                      <div className="text-right">
                        <p className="font-bold text-[#20241F] dark:text-[#F3F5EF] line-clamp-1">
                          {t(item.product.name_ar, item.product.name_en)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] line-through font-mono">
                            {item.product.price} {t('ج.م', 'EGP')}
                          </span>
                          <span className="text-xs font-black text-[#18794E] dark:text-[#65C98A] font-mono">
                            {sPrice} {t('ج.م', 'EGP')}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            +{comm} {t('ج.م عمولة', 'EGP comm')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      {/* Color */}
                      {item.product.colors.length > 1 && (
                        <select
                          value={item.color}
                          onChange={(e) => handleUpdateItem(idx, { color: e.target.value })}
                          className="bg-[#F0EEE6] dark:bg-[#232923] p-1.5 rounded-lg border border-[#E2E5DE] dark:border-[#353D35] text-[11px]"
                        >
                          {item.product.colors.map((c) => (
                            <option key={c.name_ar} value={c.name_ar}>{c.name_ar}</option>
                          ))}
                        </select>
                      )}

                      {/* Size */}
                      {item.product.sizes.length > 0 && (
                        <select
                          value={item.size}
                          onChange={(e) => handleUpdateItem(idx, { size: e.target.value })}
                          className="bg-[#F0EEE6] dark:bg-[#232923] p-1.5 rounded-lg border border-[#E2E5DE] dark:border-[#353D35] text-[11px]"
                        >
                          {item.product.sizes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}

                      {/* Quantity */}
                      <div className="flex items-center gap-1 border border-[#E2E5DE] dark:border-[#353D35] rounded-lg px-2 py-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateItem(idx, { quantity: Math.max(1, item.quantity - 1) })}
                          className="text-[#646A63] dark:text-[#B5BDB3] hover:text-[#20241F] font-bold px-1"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItem(idx, { quantity: item.quantity + 1 })}
                          className="text-[#646A63] dark:text-[#B5BDB3] hover:text-[#20241F] font-bold px-1"
                        >
                          +
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Payment & Financial Summary */}
          <div className="p-5 rounded-2xl bg-[#F0EEE6] dark:bg-[#232923] border border-[#E2E5DE] dark:border-[#353D35] space-y-4">
            <h3 className="text-xs font-bold text-[#20241F] dark:text-[#F3F5EF] flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <DollarSign size={15} className="text-[#18794E] dark:text-[#65C98A]" />
              <span>{t('٣. طريقة السداد وحساب الأرباح والعمولة', '3. Payment & Commission Computation')}</span>
            </h3>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'cod', label: 'الدفع عند الاستلام (COD)' },
                { id: 'card', label: 'بطاقة بنكية / فيزا' },
                { id: 'fawry', label: 'فوري كود فوري' },
                { id: 'instapay', label: 'إنستاباي InstaPay' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    paymentMethod === m.id
                      ? 'bg-[#20241F] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#111411] border-[#20241F] dark:border-[#D5FF3F] shadow-sm'
                      : 'bg-white dark:bg-[#1A1F1A] text-[#20241F] dark:text-[#F3F5EF] border-[#E2E5DE] dark:border-[#353D35]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Financial Summary Box */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1F1A] border border-[#E2E5DE] dark:border-[#353D35] space-y-2 text-xs">
              <div className="flex justify-between text-[#646A63] dark:text-[#B5BDB3]">
                <span>{t('إجمالي قيمة الطلب بسعر المتجر العادي:', 'Store Retail Total:')}</span>
                <span className="line-through font-mono">{totalRetailPrice.toLocaleString()} {t('ج.م', 'EGP')}</span>
              </div>

              {totalClientSavings > 0 && (
                <div className="flex justify-between text-amber-700 dark:text-amber-400 font-bold">
                  <span>{t('خصم المندوب الممنوح للعميل:', 'Sales Rep Discount:')}</span>
                  <span className="font-mono">-{totalClientSavings.toLocaleString()} {t('ج.م', 'EGP')}</span>
                </div>
              )}

              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                <span>{t('الشحن والتوصيل للعميل:', 'Shipping:')}</span>
                <span className="font-bold">{t('شحن مجاني / مشمول في الخدمة', 'Free / Included')}</span>
              </div>

              <div className="pt-2 border-t border-[#E2E5DE] dark:border-[#353D35] flex justify-between text-sm font-black text-[#20241F] dark:text-[#F3F5EF]">
                <span>{t('المبلغ المطلوب تحصيله من العميل:', 'Total Billed to Customer:')}</span>
                <span className="font-mono text-base">{totalSalesPrice.toLocaleString()} {t('ج.م', 'EGP')}</span>
              </div>

              {/* Commission Highlight Bar */}
              <div className="pt-2.5 border-t border-[#E2E5DE] dark:border-[#353D35] flex justify-between items-center bg-[#D5FF3F]/20 dark:bg-[#D5FF3F]/15 -mx-4 -mb-4 p-3 rounded-b-2xl">
                <span className="font-bold text-[#20241F] dark:text-[#F3F5EF] flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#18794E] dark:text-[#65C98A]" />
                  <span>{t('إجمالي عمولة المندوب المقررة لهذا الطلب:', 'Your Net Sales Commission:')}</span>
                </span>
                <span className="font-black text-sm text-[#18794E] dark:text-[#65C98A] font-mono">
                  +{totalRepCommission.toLocaleString()} {t('ج.م', 'EGP')}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#20241F] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#111411] hover:bg-black dark:hover:bg-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle size={16} />
              <span>{isSubmitting ? t('جاري تسجيل الطلب...', 'Placing Order...') : t('تأكيد وإرسال طلب العميل الآن', 'Confirm & Submit Sales Order')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3.5 px-5 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] text-xs font-bold text-[#646A63] dark:text-[#B5BDB3] hover:bg-[#F0EEE6] dark:hover:bg-[#232923] transition-colors"
            >
              {t('إلغاء', 'Cancel')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
