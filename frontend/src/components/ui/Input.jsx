import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative rounded-[14px]">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full h-[52px] ${Icon ? 'pl-11' : 'pl-4'} pr-4 bg-white border ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-[#DADADA] focus:border-gold-500 focus:ring-gold-200'
          } rounded-[14px] text-sm text-[#4A4A4A] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-opacity-40 transition-all duration-200 shadow-sm ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
