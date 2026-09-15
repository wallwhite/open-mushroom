import type { ReactNode } from 'react';

import { DocsSidebar } from '@/modules/docs/components/docs-sidebar';
import { PageContainer } from '@/components/layout/page-container';

/* Sidebar column from lg, stacked below; the article column never grows past the container. */
const DocsLayout = ({ children }: { children: ReactNode }) => (
  <main className="py-6">
    <PageContainer className="flex flex-col gap-6 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
      <DocsSidebar />
      <div className="min-w-0">{children}</div>
    </PageContainer>
  </main>
);

export default DocsLayout;
