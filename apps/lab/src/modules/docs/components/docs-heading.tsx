import type { ComponentProps } from 'react';

/* The slug plugin gives every heading an id; the hash link makes it visible on hover. */
const HeadingAnchor = ({ id }: { id: string | undefined }) =>
  id === undefined ? null : (
    <a
      href={`#${id}`}
      aria-hidden="true"
      tabIndex={-1}
      className="ml-2 font-normal text-muted-foreground no-underline opacity-0 transition-opacity group-hover:opacity-100"
    >
      #
    </a>
  );

export const DocsHeading2 = ({ id, children, ...props }: ComponentProps<'h2'>) => (
  <h2 id={id} className="group scroll-mt-24" {...props}>
    {children}
    <HeadingAnchor id={id} />
  </h2>
);

export const DocsHeading3 = ({ id, children, ...props }: ComponentProps<'h3'>) => (
  <h3 id={id} className="group scroll-mt-24" {...props}>
    {children}
    <HeadingAnchor id={id} />
  </h3>
);
