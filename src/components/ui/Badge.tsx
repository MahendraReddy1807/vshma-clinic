import React from 'react';
import { cn } from '@/lib/utils';
import type { AppointmentStatus } from '@/types';

interface BadgeProps {
  status: AppointmentStatus | string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border',
        statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200',
        className,
      )}
    >
      {status}
    </span>
  );
}
