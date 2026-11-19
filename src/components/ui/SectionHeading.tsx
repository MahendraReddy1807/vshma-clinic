'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
  light?: boolean;
}

export default function SectionHeading({
  title,
  subtitle,
  align = 'center',
  className,
  light = false,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={cn(
        'mb-12',
        align === 'center' && 'text-center',
        className,
      )}
    >
      <h2
        className={cn(
          'font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-tight',
          light ? 'text-white' : 'text-forest',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-4 text-lg max-w-2xl',
            align === 'center' && 'mx-auto',
            light ? 'text-sage-light' : 'text-gray-600',
          )}
        >
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          'mt-4 h-1 w-16 rounded-full',
          align === 'center' && 'mx-auto',
          light ? 'bg-gold' : 'bg-gold',
        )}
      />
    </motion.div>
  );
}
