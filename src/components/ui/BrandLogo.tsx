import Image from 'next/image';
import Link from 'next/link';
import { CLINIC_INFO } from '@/lib/constants';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
  showSubtitle?: boolean;
}

export default function BrandLogo({
  className = '',
  size = 'md',
  theme = 'dark',
  showSubtitle = true,
}: BrandLogoProps) {
  const iconSize = size === 'sm' ? 34 : size === 'lg' ? 48 : 40;
  const titleClass =
    size === 'sm'
      ? 'text-xl'
      : size === 'lg'
      ? 'text-3xl sm:text-4xl'
      : 'text-2xl sm:text-[1.65rem]';

  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Bespoke Luxury V-Emblem */}
      <div
        className="relative rounded-[1.15rem] overflow-hidden shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 shrink-0 border border-gold/40"
        style={{ width: iconSize, height: iconSize }}
      >
        <Image
          src="/icon.svg"
          alt={`${CLINIC_INFO.name} Emblem`}
          width={iconSize}
          height={iconSize}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <span
          className={`font-heading font-bold tracking-tight leading-none transition-colors ${
            theme === 'light' ? 'text-white' : 'text-forest group-hover:text-forest-dark'
          } ${titleClass}`}
        >
          {CLINIC_INFO.name}
        </span>
        {showSubtitle && (
          <span
            className={`text-[9.5px] uppercase tracking-[0.22em] font-semibold mt-1 block ${
              theme === 'light' ? 'text-sage' : 'text-sage-dark'
            }`}
          >
            Homeopathy Clinic
          </span>
        )}
      </div>
    </div>
  );
}
