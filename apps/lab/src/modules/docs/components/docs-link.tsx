import type { ComponentProps } from 'react';

import { Link } from '@/i18n/navigation';

const isExternal = (href: string): boolean => /^[a-z]+:/i.test(href);

/* Links written in the pages: external ones open in a new tab, internal ones keep the reader's language. */
export const DocsLink = ({ href = '', children, className }: ComponentProps<'a'>) => {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  if (href.startsWith('#')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};
