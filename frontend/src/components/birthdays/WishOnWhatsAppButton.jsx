import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { cleanWhatsAppNumber } from '../../utils/helpers';

/**
 * WishOnWhatsAppButton
 * 
 * IMPORTANT: DO NOT send WhatsApp messages automatically.
 * Opens direct WhatsApp chat with student phone number in a new tab / mobile app.
 * URL Target: https://wa.me/{student_phone_number}
 * No backend APIs, Twilio, or Meta Cloud API integration.
 */
export const WishOnWhatsAppButton = ({
  studentPhone,
  studentName = '',
  variant = 'primary', // 'primary' | 'whatsapp' | 'secondary' | 'outline' | 'compact'
  size = 'md', // 'sm' | 'md' | 'lg'
  customMessage = '',
  includeMessage = false,
  className = '',
  label = 'Wish on WhatsApp',
  icon: CustomIcon,
  onClick,
  disabled = false,
}) => {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(e);

    const cleanNumber = cleanWhatsAppNumber(studentPhone);
    if (!cleanNumber) {
      console.warn('No valid phone number provided for WhatsApp wish');
      return;
    }

    let url = `https://wa.me/${cleanNumber}`;
    if (includeMessage || customMessage) {
      const message = customMessage || (studentName 
        ? `Happy Birthday ${studentName}! 🎂 Wishing you a wonderful day from Hari-Saurabh Hostel.`
        : 'Happy Birthday! 🎂 Wishing you a wonderful day from Hari-Saurabh Hostel.');
      url += `?text=${encodeURIComponent(message)}`;
    }

    // Direct manual WhatsApp redirect (Mobile opens WhatsApp app, Desktop opens Web WhatsApp)
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5 font-bold',
    md: 'text-xs sm:text-sm px-4 py-2 rounded-2xl gap-2 font-bold shadow-soft-sm',
    lg: 'text-sm sm:text-base px-6 py-3 rounded-2xl gap-2.5 font-extrabold shadow-soft-md',
    compact: 'p-2 rounded-xl',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-gold-500 via-amber-500 to-gold-600 hover:from-gold-600 hover:to-amber-600 text-white shadow-gold-subtle hover:shadow-gold-glow border border-gold-400/40',
    whatsapp:
      'bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-soft-sm hover:shadow-md border border-green-400/30',
    secondary:
      'bg-gold-50/90 hover:bg-gold-100 text-gold-800 border border-gold-300 shadow-soft-sm hover:border-gold-500',
    outline:
      'bg-white hover:bg-gold-50 text-[#4A4A4A] hover:text-gold-600 border border-gray-200 hover:border-gold-400 shadow-soft-sm',
  };

  const IconComponent = CustomIcon || MessageCircle;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      type="button"
      onClick={handleClick}
      disabled={disabled || !studentPhone}
      title={`Wish ${studentName || 'Student'} on WhatsApp (${studentPhone || 'No Phone'})`}
      className={`inline-flex items-center justify-center transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.primary} ${className}`}
    >
      <IconComponent className={size === 'sm' || size === 'compact' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {size !== 'compact' && <span>{label}</span>}
    </motion.button>
  );
};
