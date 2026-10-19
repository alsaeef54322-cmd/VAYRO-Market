import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Eye,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';

interface SalesOrdersListProps {
  orders: Order[];
  onOpenCreateOrder: () => void;
}

export const SalesOrdersList: React.FC<SalesOrdersListProps> = ({ orders, onOpenCreateOrder }) => {
  const { t, language } = useLanguage();
  const { currentStaffRep } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders related to sales portal or attributed to current rep
  const repOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalSalesVolume = repOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCommissions = repOrders.reduce((sum, o) => sum + (o.salesCommissionEarned || 0), 0);
  const collectedCommissions = repOrders
    .filter((o) => o.paymentStatus === 'collected' || o.paymentStatus === 'remitted')
    .reduce((sum, o) => sum + (o.salesCommissionEarned || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1A1F1A] p-5 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm flex items-center justify-between">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-[#646A63] dark:text-[#B5BDB3] font-bold">
              {t('إجمالي طلبات المبيعات', 'TOTAL SALES ORDERS')}
            </span>
            <h3 className="text-2xl font-black text-[#20241F] dark:text-[#F3F5EF] mt-1">
              {repOrders.length} {t('طلب', 'orders')}
            </h3>
            <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] mt-0.5">
              {t('بقيمة:', 'Volume:')} <strong className="font-mono text-[#20241F] dark:text-[#F3F5EF]">{totalSalesVolume.toLocaleString()} ج.م</strong>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F0EEE6] dark:bg-[#232923] text-[#20241F] dark:text-[#F3F5EF] flex items-center justify-center font-bold">
            <Package size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1F1A] p-5 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm flex items-center justify-between">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-[#18794E] dark:text-[#65C98A] font-bold">
              {t('إجمالي العمولات المستحقة', 'EARNED COMMISSIONS')}
            </span>
            <h3 className="text-2xl font-black text-[#18794E] dark:text-[#65C98A] mt-1 font-mono">
              {totalCommissions.toLocaleString()} <span className="text-xs font-sans">ج.م</span>
            </h3>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              {t('محسوبة تلقائيًا بناءً على أسعار المناديب', 'Auto-calculated on sales prices')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#18794E] dark:text-[#65C98A] flex items-center justify-center font-bold">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1F1A] p-5 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm flex items-center justify-between">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-[#646A63] dark:text-[#B5BDB3] font-bold">
              {t('عمولات تم تحصيلها نقدًا', 'COLLECTED COMMISSIONS')}
            </span>
            <h3 className="text-2xl font-black text-[#20241F] dark:text-[#F3F5EF] mt-1 font-mono">
              {collectedCommissions.toLocaleString()} <span className="text-xs font-sans">ج.م</span>
            </h3>
            <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] mt-0.5">
              {t('متاح للصرف في حساب الموظف', 'Ready for payroll disbursement')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#D5FF3F]/30 text-[#18794E] dark:text-[#65C98A] flex items-center justify-center font-bold">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1A1F1A] p-4 rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search size={15} className="absolute inset-y-0 start-3.5 my-auto text-[#646A63] dark:text-[#B5BDB3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('بحث برقم الطلب، اسم العميل، الهاتف...', 'Search order #, customer name...')}
              className="w-full bg-[#F7F7F3] dark:bg-[#232923] text-xs py-2 ps-10 pe-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] focus:outline-none text-[#20241F] dark:text-[#F3F5EF]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F7F7F3] dark:bg-[#232923] text-xs py-2 px-3 rounded-xl border border-[#E2E5DE] dark:border-[#353D35] text-[#20241F] dark:text-[#F3F5EF] focus:outline-none font-medium"
          >
            <option value="all">{t('جميع حالات الطلب', 'All Statuses')}</option>
            <option value="confirmed">{t('مؤكد جديد', 'Confirmed')}</option>
            <option value="processing">{t('قيد التجهيز', 'Processing')}</option>
            <option value="shipped">{t('خرج مع المندوب', 'Shipped')}</option>
            <option value="delivered">{t('تم التوصيل بنجاح', 'Delivered')}</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onOpenCreateOrder}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#20241F] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#111411] hover:bg-black dark:hover:bg-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <span>+ {t('تسجيل طلب عميل جديد', 'Register New Client Order')}</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#1A1F1A] rounded-3xl border border-[#E2E5DE] dark:border-[#353D35] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="bg-[#F0EEE6] dark:bg-[#232923] text-[#20241F] dark:text-[#F3F5EF] border-b border-[#E2E5DE] dark:border-[#353D35]">
                <th className="py-3.5 px-4 font-bold">{t('رقم الطلب والتاريخ', 'Order & Date')}</th>
                <th className="py-3.5 px-4 font-bold">{t('بيانات العميل', 'Customer Info')}</th>
                <th className="py-3.5 px-3 font-bold text-center">{t('عدد القطع', 'Items')}</th>
                <th className="py-3.5 px-3 font-bold text-center">{t('قيمة الطلب (سعر المندوب)', 'Order Total')}</th>
                <th className="py-3.5 px-3 font-bold text-center text-[#18794E] dark:text-[#65C98A]">
                  {t('عمولتك المقررة', 'Your Commission')}
                </th>
                <th className="py-3.5 px-3 font-bold text-center">{t('حالة الشحن', 'Shipping Status')}</th>
                <th className="py-3.5 px-3 font-bold text-center">{t('التحصيل المالي', 'Payment Status')}</th>
                <th className="py-3.5 px-4 font-bold text-center">{t('تفاصيل', 'Details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5DE] dark:divide-[#353D35]">
              {repOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#646A63] dark:text-[#B5BDB3]">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-bold">{t('لا توجد طلبات مسجلة تطابق البحث', 'No matching orders found')}</p>
                    <button
                      type="button"
                      onClick={onOpenCreateOrder}
                      className="mt-3 text-xs text-[#18794E] dark:text-[#65C98A] font-bold hover:underline"
                    >
                      {t('اضغط هنا لتسجيل أول طلب عميل بسعر المندوب', 'Click here to log your first order')}
                    </button>
                  </td>
                </tr>
              ) : (
                repOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F0EEE6]/40 dark:hover:bg-[#232923]/40 transition-colors">
                    {/* Order Number & Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#20241F] dark:text-[#F3F5EF]">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#18794E]/10 text-[#18794E] dark:text-[#65C98A] font-bold">
                          {ord.orderTier === 'sales_portal' ? t('مندوب', 'Rep') : t('متجر', 'Retail')}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] block mt-0.5 font-mono">
                        {ord.createdAt.slice(0, 10)}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#20241F] dark:text-[#F3F5EF]">{ord.customer.name}</p>
                      <p className="text-[10px] text-[#646A63] dark:text-[#B5BDB3] font-mono mt-0.5">
                        {ord.customer.phone} • {ord.customer.city}
                      </p>
                    </td>

                    {/* Items count */}
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-[#20241F] dark:text-[#F3F5EF]">
                      {ord.items.reduce((sum, it) => sum + it.quantity, 0)}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-3 text-center font-mono font-black text-sm text-[#20241F] dark:text-[#F3F5EF]">
                      {ord.total.toLocaleString()} {t('ج.م', 'EGP')}
                    </td>

                    {/* Commission Earned */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-black text-sm text-[#18794E] dark:text-[#65C98A] block">
                        +{(ord.salesCommissionEarned || 0).toLocaleString()} {t('ج.م', 'EGP')}
                      </span>
                      <span className="text-[9px] text-[#646A63] dark:text-[#B5BDB3]">
                        {ord.paymentStatus === 'collected' ? t('مؤكدة', 'Collected') : t('قيد التحصيل', 'Pending')}
                      </span>
                    </td>

                    {/* Shipping Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : ord.status === 'shipped'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}>
                        {ord.status === 'delivered'
                          ? t('تم التوصيل', 'Delivered')
                          : ord.status === 'shipped'
                          ? t('مع المندوب', 'Shipped')
                          : t('قيد التجهيز', 'Processing')}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                        ord.paymentStatus === 'collected' || ord.paymentStatus === 'remitted'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}>
                        {ord.paymentStatus === 'collected'
                          ? t('تم التحصيل', 'Paid')
                          : t('عند الاستلام', 'COD')}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="py-1 px-2.5 rounded-lg border border-[#E2E5DE] dark:border-[#353D35] hover:bg-[#F0EEE6] dark:hover:bg-[#232923] text-[11px] font-bold text-[#20241F] dark:text-[#F3F5EF] transition-colors"
                      >
                        {t('معاينة', 'View')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A1F1A] rounded-3xl max-w-lg w-full p-6 border border-[#E2E5DE] dark:border-[#353D35] shadow-2xl relative text-right">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5DE] dark:border-[#353D35] mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#18794E] dark:text-[#65C98A] font-bold">
                  {t('تفاصيل طلب العميل', 'CLIENT ORDER DETAILS')}
                </span>
                <h3 className="text-base font-bold text-[#20241F] dark:text-[#F3F5EF]">
                  #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-[#646A63] dark:text-[#B5BDB3] hover:bg-[#F0EEE6] dark:hover:bg-[#232923]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F7F3] dark:bg-[#232923] space-y-1">
                <p><strong>{t('العميل:', 'Client:')}</strong> {selectedOrder.customer.name}</p>
                <p><strong>{t('الهاتف:', 'Phone:')}</strong> {selectedOrder.customer.phone}</p>
                <p><strong>{t('العنوان:', 'Address:')}</strong> {selectedOrder.customer.addressLine}, {selectedOrder.customer.city}</p>
                <p><strong>{t('طريقة الدفع:', 'Payment:')}</strong> {selectedOrder.paymentMethod.toUpperCase()}</p>
              </div>

              <div>
                <p className="font-bold text-[#20241F] dark:text-[#F3F5EF] mb-2">{t('المنتجات المطلوبة:', 'Items:')}</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#F0EEE6] dark:bg-[#232923]">
                      <span>{it.product.name_ar} (x{it.quantity})</span>
                      <span className="font-mono font-bold">
                        {((it.unitPrice ?? it.product.price) * it.quantity).toLocaleString()} ج.م
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E5DE] dark:border-[#353D35] flex justify-between font-bold text-sm">
                <span>{t('إجمالي المطلوب من العميل:', 'Total Billed:')}</span>
                <span className="font-mono">{selectedOrder.total.toLocaleString()} ج.م</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#D5FF3F]/20 dark:bg-[#D5FF3F]/15 flex justify-between font-bold text-[#18794E] dark:text-[#65C98A]">
                <span>{t('عمولة المندوب لهذا الطلب:', 'Your Commission:')}</span>
                <span className="font-mono">+{(selectedOrder.salesCommissionEarned || 0).toLocaleString()} ج.م</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-4 py-2.5 rounded-xl bg-[#20241F] dark:bg-[#D5FF3F] text-[#D5FF3F] dark:text-[#111411] font-bold text-xs"
            >
              {t('إغلاق', 'Close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
