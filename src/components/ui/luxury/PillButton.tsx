'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCapability } from '@/lib/useCapability';

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
  const { isTouch, prefersReducedMotion } = useCapability();
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled || isTouch || prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) * 0.18;
    const dy = (e.clientY - centerY) * 0.18;
    setMagneticOffset({ x: dx, y: dy });
  };

  const handleMouseLeave = () => {
    setMagneticOffset({ x: 0, y: 0 });
  };

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
      {/* Fill-sweep hover sheen */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out bg-white/10 pointer-events-none rounded-full"
      />
      {icon && iconPosition === 'left' && (
        <span className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5">
          {icon}
        </span>
      )}
      <span className="relative z-10">{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">
          {icon}
        </span>
      )}
    </>
  );

  const baseClasses = `relative group inline-flex items-center justify-center rounded-full font-sans tracking-wide transition-colors duration-300 select-none overflow-hidden ${sizeStyles} ${variantStyles} ${
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
  } ${className}`;

  if (href) {
    return (
      <motion.div
        animate={{ x: magneticOffset.x, y: magneticOffset.y }}
        transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.2 }}
        className="inline-block"
      >
        <Link
          href={href}
          onClick={onClick}
          target={target}
          rel={rel}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={baseClasses}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ x: magneticOffset.x, y: magneticOffset.y }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.2 }}
      className="inline-block"
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={baseClasses}
      >
        {content}
      </button>
    </motion.div>
  );
}
