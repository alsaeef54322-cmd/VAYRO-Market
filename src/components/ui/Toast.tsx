import React from 'react';
import { CheckCircle, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Toast: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle size={18} className="text-[#D5FF3F]" />,
    info: <Info size={18} className="text-[#D5FF3F]" />,
    warning: <AlertTriangle size={18} className="text-amber-400" />,
    error: <AlertCircle size={18} className="text-rose-400" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300 pointer-events-none">
      <div className="bg-[#111310] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 max-w-sm pointer-events-auto">
        {icons[toast.type || 'success']}
        <p className="text-xs font-semibold leading-snug">{toast.message}</p>
      </div>
    </div>
  );
};
