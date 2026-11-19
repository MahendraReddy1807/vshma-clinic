import { cn } from '@/lib/utils';

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-white p-6 shadow-sm animate-pulse', className)}>
      <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4" />
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-10 w-10 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-16" />
    </div>
  );
}
