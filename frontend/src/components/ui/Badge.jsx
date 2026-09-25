import React from 'react';

export const Badge = ({
  children,
  variant = 'gold', // 'gold' | 'gray' | 'birthday' | 'success' | 'warning' | 'error'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-lg font-medium',
    md: 'text-xs px-3 py-1 rounded-xl font-semibold',
    lg: 'text-sm px-4 py-1.5 rounded-xl font-bold',
  };

  const variantStyles = {
    gold: 'bg-gold-100 text-gold-800 border border-gold-300/60',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200',
    birthday: 'bg-gradient-to-r from-amber-400 to-gold-500 text-white shadow-gold-glow animate-pulse',
    success: 'bg-green-100 text-green-700 border border-green-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-300',
    error: 'bg-red-100 text-red-700 border border-red-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
