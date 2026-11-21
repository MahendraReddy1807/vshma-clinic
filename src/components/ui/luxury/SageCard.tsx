'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface SageCardProps {
  children: React.ReactNode;
  variant?: 'sage' | 'bone' | 'cream' | 'forest' | 'white';
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export default function SageCard({
  children,
  variant = 'sage',
  className = '',
  hoverEffect = true,
  onClick,
}: SageCardProps) {
  const variantStyles = {
    sage: 'bg-[#D4D8BA] text-[#161815] border border-[#161815]/10 shadow-[0_4px_20px_-8px_rgba(18,26,21,0.08)]',
    bone: 'bg-[#E3E4DC] text-[#161815] border border-[#161815]/10 shadow-[0_4px_20px_-8px_rgba(18,26,21,0.06)]',
    cream: 'bg-[#EDE6D3] text-[#161815] border border-[#161815]/10 shadow-[0_4px_20px_-8px_rgba(18,26,21,0.06)]',
    forest: 'bg-[#121A15] text-[#F7F3EC] border border-white/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)]',
    white: 'bg-white text-[#161815] border border-[#D8D0BD]/70 shadow-[0_4px_24px_-10px_rgba(18,26,21,0.08)]',
  }[variant];

  return (
    <motion.div
      onClick={onClick}
      whileHover={
        hoverEffect
          ? {
              y: -5,
              transition: { duration: 0.35, ease: [0.2, 0.7, 0.2, 1] },
            }
          : undefined
      }
      className={`relative rounded-[18px] p-6 sm:p-8 transition-colors duration-300 ${variantStyles} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
