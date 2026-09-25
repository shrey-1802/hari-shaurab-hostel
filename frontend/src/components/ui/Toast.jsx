import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const Toast = () => {
  const { toast } = useNotifications();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-gold-500" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="pointer-events-auto flex items-center gap-3 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-soft-lg border border-gold-200 text-sm font-medium text-[#4A4A4A] max-w-md"
        >
          {icons[toast.type] || icons.info}
          <span className="flex-1">{toast.message}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
