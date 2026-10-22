import { Pagination, PaginationInfo } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Pagination', group: 'Navigatsiya', order: 3 };

export default function Page() {
  const [page, setPage] = useState(5);
  const [blogPage, setBlogPage] = useState(1);

  return (
    <DemoPage
      title="Pagination"
      description="Sahifalash: hisob getPagination (@akhatmirzo/hooks) da. getHref berilsa — haqiqiy <a href> havolalar (SEO). 640px dan tor ekranda avtomatik ixcham ‹ 3 / 24 › ko‘rinish."
    >
      <DemoSection title="Asosiy" description={<Code>total=230 pageSize=10</Code>}>
        <DemoRow>
          <Pagination page={page} onPageChange={setPage} total={230} pageSize={10} />
        </DemoRow>
        <DemoRow>
          <PaginationInfo page={page} pageSize={10} total={230} />
        </DemoRow>
      </DemoSection>

      <DemoSection title="O‘lchamlar" description="sm — 32px, md — 40px">
        <DemoRow label="sm">
          <Pagination defaultPage={3} pageCount={12} size="sm" compact={false} />
        </DemoRow>
        <DemoRow label="md">
          <Pagination defaultPage={3} pageCount={12} compact={false} />
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Birinchi / oxirgi va siblings"
        description={
          <>
            <Code>showFirstLast</Code>, <Code>siblings=2</Code>
          </>
        }
      >
        <DemoRow>
          <Pagination defaultPage={10} pageCount={40} siblings={2} showFirstLast compact={false} />
        </DemoRow>
      </DemoSection>

      <DemoSection title="Ixcham" description={<Code>compact</Code>}>
        <DemoRow>
          <Pagination defaultPage={3} pageCount={24} compact />
          <Pagination defaultPage={3} pageCount={24} compact size="sm" showFirstLast />
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Havolalar (SEO)"
        description={
          <>
            <Code>getHref</Code> — sahifa raqamlari <Code>&lt;a href&gt;</Code>;{' '}
            <Code>renderLink</Code> — o‘z havola komponenti (bu yerda o‘tish to‘xtatilgan).
          </>
        }
      >
        <DemoRow>
          <Pagination
            page={blogPage}
            onPageChange={setBlogPage}
            pageCount={8}
            getHref={(p) => `/blog?page=${p}`}
            renderLink={({ page: _page, onClick, ...link }) => (
              <a
                {...link}
                onClick={(event) => {
                  event.preventDefault();
                  onClick?.(event);
                }}
              />
            )}
          />
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
