import React from 'react';
import { motion } from 'framer-motion';
import logoImg from '../../assets/logo.png';

export const AnimatedLogo = ({
  size = 'hero', // 'small' | 'medium' | 'large' | 'hero'
  showText = false,
  className = '',
  animated = true,
}) => {
  const sizeConfig = {
    small: {
      img: 'w-16 h-16',
      card: 'p-2 rounded-2xl',
      ring: 'w-24 h-24',
    },
    medium: {
      img: 'w-24 h-24',
      card: 'p-3.5 rounded-2xl',
      ring: 'w-36 h-36',
    },
    large: {
      img: 'w-36 h-36',
      card: 'p-5 rounded-3xl',
      ring: 'w-48 h-48',
    },
    hero: {
      img: 'w-44 sm:w-52 h-auto max-h-52',
      card: 'p-6 sm:p-7 rounded-[32px]',
      ring: 'w-64 sm:w-72 h-64 sm:h-72',
    },
  };

  const current = sizeConfig[size] || sizeConfig.hero;

  return (
    <div className={`flex flex-col items-center justify-center relative ${className}`}>
      {/* 1. Golden Radiant Atmosphere Glow */}
      {animated && (
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.75, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -inset-6 bg-gradient-to-r from-gold-300 via-amber-400 to-gold-500 rounded-full blur-3xl -z-10 opacity-50 pointer-events-none"
        />
      )}

      {/* 2. Rotating Subtle Gold Accent Ring */}
      {animated && (size === 'hero' || size === 'large') && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className={`absolute ${current.ring} rounded-full border border-dashed border-gold-400/50 pointer-events-none -z-10`}
        />
      )}

      {/* 3. Floating Glassmorphic Logo Plinth */}
      <motion.div
        animate={
          animated
            ? {
                y: [0, -8, 0],
              }
            : {}
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{
          scale: 1.04,
          boxShadow: '0 20px 40px rgba(230, 162, 60, 0.35)',
        }}
        className={`relative flex items-center justify-center bg-white/95 backdrop-blur-md shadow-soft-lg border-2 border-gold-200/90 transition-all duration-300 ${current.card}`}
      >
        {/* Crystal Clear Logo Image */}
        <img
          src={logoImg}
          alt="Hari-Saurabh Hostel Logo"
          className={`${current.img} object-contain transition-transform duration-300 select-none`}
        />

        {/* Floating Sparkle Dot on Top-Right Corner */}
        {animated && (size === 'hero' || size === 'large') && (
          <motion.div
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-2.5 right-2.5 w-3 h-3 bg-gradient-to-tr from-gold-400 to-amber-400 rounded-full shadow-gold-glow"
          />
        )}
      </motion.div>

      {/* Optional Subtext */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mt-4"
        >
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A4A4A] tracking-tight">
            HARI-SAURABH <span className="gold-gradient-text">HOSTEL</span>
          </h2>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-0.5">
            Smart Administration System
          </p>
        </motion.div>
      )}
    </div>
  );
};
