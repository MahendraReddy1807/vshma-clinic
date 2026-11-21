'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface StepCardProps {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  note: string;
  variant?: 'dark' | 'light';
  delay?: number;
}

export default function StepCard({
  step,
  title,
  subtitle,
  description,
  icon: Icon,
  note,
  variant = 'dark',
  delay = 0,
}: StepCardProps) {
  const isDark = variant === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={`group relative p-7 sm:p-8 rounded-[18px] border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 ${
        isDark
          ? 'bg-[#121A15] border-white/10 hover:border-[#B89B5E]/50 text-[#F7F3EC] shadow-lg'
          : 'bg-[#F7F3EC] border-[#D8D0BD] hover:border-[#B89B5E] text-[#161815] shadow-xs'
      }`}
    >
      <div className="space-y-6">
        {/* Top: Step Number & Icon */}
        <div className="flex items-center justify-between">
          <span className="font-display text-4xl sm:text-5xl font-light text-[#B89B5E]">
            {step}
          </span>
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
              isDark ? 'bg-white/10 text-[#D4D8BA]' : 'bg-[#121A15] text-[#F7F3EC]'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <span
            className={`text-[10px] uppercase font-bold tracking-[0.2em] block font-sans ${
              isDark ? 'text-[#D8D0BD]/70' : 'text-[#987E45]'
            }`}
          >
            {subtitle}
          </span>
          <h3
            className={`font-display font-light text-2xl sm:text-3xl leading-snug ${
              isDark ? 'text-[#F7F3EC]' : 'text-[#121A15]'
            }`}
          >
            {title}
          </h3>
        </div>

        {/* Description */}
        <p
          className={`text-sm sm:text-base leading-relaxed font-sans font-light ${
            isDark ? 'text-[#D8D0BD]/80' : 'text-[#161815]/75'
          }`}
        >
          {description}
        </p>
      </div>

      {/* Bottom Note Badge */}
      <div
        className={`pt-5 mt-6 border-t flex items-center justify-between text-xs font-sans ${
          isDark ? 'border-white/10 text-[#D8D0BD]/75' : 'border-[#D8D0BD]/60 text-[#161815]/75'
        }`}
      >
        <span className="font-medium">{note}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#B89B5E]" />
      </div>
    </motion.div>
  );
}
