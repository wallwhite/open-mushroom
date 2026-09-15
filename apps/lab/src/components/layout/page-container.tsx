import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/* Content width: the header, the page and the footer share one wide centred column. */
export const PageContainer = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('mx-auto w-full max-w-[1600px] px-4 sm:px-8', className)} {...props} />
);
