import React from 'react';

export interface SectionTagProps {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'brass';
  pulseDot?: boolean;
  className?: string;
}

export default function SectionTag({
  children,
  variant = 'light',
  pulseDot = true,
  className = '',
}: SectionTagProps) {
  const variantStyles = {
    light: 'bg-white/80 border-[#D8D0BD] text-[#121A15] shadow-2xs',
    dark: 'bg-white/10 border-white/15 text-[#F7F3EC] shadow-xs',
    brass: 'bg-[#B89B5E]/15 border-[#B89B5E]/40 text-[#987E45]',
  }[variant];

  const dotColor = {
    light: 'bg-[#B89B5E]',
    dark: 'bg-[#CEB57D]',
    brass: 'bg-[#B89B5E]',
  }[variant];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border backdrop-blur-md text-[11px] font-sans font-semibold uppercase tracking-[0.22em] select-none ${variantStyles} ${className}`}
    >
      {pulseDot && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}
