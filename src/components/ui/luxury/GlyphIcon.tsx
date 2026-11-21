import React from 'react';

export type GlyphName = 'crescent' | 'semi-stacked' | 'half-leaf' | 'orbital-cross';

export interface GlyphIconProps {
  name: GlyphName;
  className?: string;
  size?: number;
}

export default function GlyphIcon({ name, className = 'w-5 h-5 text-current', size = 20 }: GlyphIconProps) {
  switch (name) {
    case 'crescent':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C14.7614 22 17.2614 20.8807 19.0711 19.0711C15.5 18 13 15 13 12C13 9 15.5 6 19.0711 4.92893C17.2614 3.11929 14.7614 2 12 2Z"
            fill="currentColor"
          />
        </svg>
      );

    case 'semi-stacked':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          {/* Top Semicircle */}
          <path d="M4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10H4Z" fill="currentColor" />
          {/* Bottom Inverted Semicircle */}
          <path d="M20 14C20 18.4183 16.4183 22 12 22C7.58172 22 4 18.4183 4 14H20Z" fill="currentColor" opacity="0.75" />
        </svg>
      );

    case 'half-leaf':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          {/* Botanical Half-Leaf Archetype */}
          <path
            d="M20.5 3.5C12 3.5 3.5 12 3.5 20.5C12 20.5 20.5 12 20.5 3.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 20.5C9.5 14.5 15.5 8.5 20.5 3.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'orbital-cross':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          {/* Symmetrical Apothecary Cross with Outer Half-Arcs */}
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M18.5 12C18.5 8.41015 15.5899 5.5 12 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M5.5 12C5.5 15.5899 8.41015 18.5 12 18.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      );

    default:
      return null;
  }
}
