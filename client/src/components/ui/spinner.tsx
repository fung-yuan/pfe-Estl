'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'lg';
}

export function Spinner({ className, size = 'sm', ...props }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    lg: 'h-8 w-8',
  };

  return (
    <div
      role="status"
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <Loader2 className={cn('animate-spin text-current', sizes[size])} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}