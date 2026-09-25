import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedLogo = ({
  size = 'large', // 'small' | 'medium' | 'large' | 'hero'
  showText = true,
  className = '',
  animated = true,
}) => {
  const sizeClasses = {
    small: 'h-10 w-auto',
    medium: 'h-16 w-auto',
    large: 'h-24 w-auto',
    hero: 'h-40 md:h-52 w-auto',
  };

  const containerSizes = {
    small: 'p-1.5',
    medium: 'p-3',
    large: 'p-5',
    hero: 'p-8',
  };

  return (
    <div className={`flex flex-col items-center justify-center relative ${className}`}>
      {/* Radiant Golden Glow Aura */}
      {animated && (
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -inset-4 bg-gradient-to-r from-gold-300 via-gold-500 to-amber-400 rounded-full blur-2xl -z-10 opacity-40 pointer-events-none"
        />
      )}

      {/* Orbiting Subtle Glow Rings for Hero Size */}
      {animated && size === 'hero' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute w-72 h-72 rounded-full border border-dashed border-gold-300/40 pointer-events-none -z-10"
        />
      )}

      {/* Animated Logo Container */}
      <motion.div
        animate={
          animated
            ? {
                y: [0, -10, 0],
                rotate: [0, 0.5, 0, -0.5, 0],
              }
            : {}
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{
          scale: 1.05,
          filter: 'drop-shadow(0 12px 24px rgba(230, 162, 60, 0.45))',
        }}
        className={`relative flex items-center justify-center rounded-3xl bg-white/90 backdrop-blur-md shadow-soft-md border border-gold-200/80 transition-all duration-300 ${containerSizes[size] || 'p-4'}`}
      >
        <img
          src="/logo.png"
          alt="Hari-Saurabh Hostel Logo"
          className={`${sizeClasses[size] || sizeClasses.medium} object-contain transition-transform duration-300`}
          onError={(e) => {
            // If image path needs fallback
            e.target.src = '/public/logo.png';
          }}
        />

        {/* Floating Sparkle Dot */}
        {animated && size === 'hero' && (
          <motion.div
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-2 right-2 w-3.5 h-3.5 bg-gradient-to-tr from-gold-400 to-amber-300 rounded-full shadow-gold-glow"
          />
        )}
      </motion.div>

      {/* Optional Tagline & Title */}
      {showText && size === 'hero' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mt-6"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#4A4A4A] tracking-tight">
            HARI-SAURABH <span className="gold-gradient-text">HOSTEL</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base font-medium text-gray-500 tracking-wide uppercase">
            Smart Hostel Administration & Student Directory
          </p>
        </motion.div>
      )}
    </div>
  );
};
