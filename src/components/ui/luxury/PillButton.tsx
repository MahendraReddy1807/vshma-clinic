'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface PillButtonProps {
  children: React.ReactNode;
  variant?: 'dark' | 'light' | 'outline' | 'brass';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  target?: string;
  rel?: string;
}

export default function PillButton({
  children,
  variant = 'dark',
  size = 'md',
  href,
  onClick,
  icon,
  iconPosition = 'right',
  className = '',
  disabled = false,
  type = 'button',
  target,
  rel,
}: PillButtonProps) {
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-2.5',
  }[size];

  const variantStyles = {
    dark: 'bg-[#121A15] hover:bg-[#1F2B23] text-[#F7F3EC] border border-[#121A15]/40 shadow-xs hover:shadow-md active:bg-[#0A0F0C]',
    light: 'bg-[#F7F3EC] hover:bg-white text-[#121A15] border border-[#D8D0BD] shadow-xs hover:shadow-md active:bg-[#EDE6D3]',
    outline: 'bg-transparent hover:bg-[#121A15] text-[#121A15] hover:text-[#F7F3EC] border border-[#121A15]/30 hover:border-[#121A15] active:bg-[#0A0F0C]',
    brass: 'bg-[#B89B5E] hover:bg-[#CEB57D] text-[#121A15] font-medium border border-[#B89B5E]/50 shadow-xs hover:shadow-md active:bg-[#987E45]',
  }[variant];

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5">{icon}</span>}
      <span className="tracking-wide font-sans font-medium">{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">{icon}</span>}
    </>
  );

  const baseClasses = `group inline-flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none ${sizeStyles} ${variantStyles} ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses} target={target} rel={rel}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={baseClasses}
    >
      {content}
    </motion.button>
  );
}
