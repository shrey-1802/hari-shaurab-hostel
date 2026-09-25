import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  glass = false,
  hover = true,
  onClick,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={`rounded-[24px] bg-white border border-[#DADADA]/80 p-6 shadow-soft-sm transition-all duration-300 ${
        glass ? 'glass-card' : ''
      } ${hover ? 'hover:shadow-soft-md hover:border-gold-300/80' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
