import type { ComponentProps } from 'react';

/* Reference tables are wider than a phone; the wrapper scrolls instead of the page. */
export const DocsTable = (props: ComponentProps<'table'>) => (
  <div className="my-5 overflow-x-auto">
    <table className="my-0" {...props} />
  </div>
);
