import React from 'react';

export interface GridLinesProps {
  className?: string;
  horizontalLines?: number;
  verticalLines?: number;
  opacity?: string;
}

export default function GridLines({
  className = '',
  horizontalLines = 2,
  verticalLines = 3,
  opacity = 'opacity-30',
}: GridLinesProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${opacity} ${className}`}
    >
      {/* Outer Hairline Border */}
      <div className="absolute inset-4 sm:inset-8 lg:inset-12 border border-[#D8D0BD]/40 rounded-[28px]" />

      {/* Vertical Hairline Dividers */}
      <div className="absolute inset-x-4 sm:inset-x-8 lg:inset-x-12 inset-y-0 flex justify-between">
        {Array.from({ length: verticalLines }).map((_, idx) => (
          <div key={`v-${idx}`} className="w-px h-full bg-gradient-to-b from-transparent via-[#D8D0BD]/35 to-transparent" />
        ))}
      </div>

      {/* Horizontal Hairline Dividers */}
      <div className="absolute inset-y-4 sm:inset-y-8 lg:inset-y-12 inset-x-0 flex flex-col justify-between">
        {Array.from({ length: horizontalLines }).map((_, idx) => (
          <div key={`h-${idx}`} className="h-px w-full bg-gradient-to-r from-transparent via-[#D8D0BD]/35 to-transparent" />
        ))}
      </div>
    </div>
  );
}
