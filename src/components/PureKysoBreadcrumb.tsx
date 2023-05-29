import type { BreadcrumbItem } from '@/model/breadcrum-item.model';
import Link from 'next/link';

type IPureKysoBreadcrumbProps = {
  breadcrumbs: BreadcrumbItem[] | [];
};

const PureKysoBreadcrumb = (props: IPureKysoBreadcrumbProps) => {
  const { breadcrumbs = [] } = props;

  return (
    <>
      {breadcrumbs.map((page) => (
        <div key={page.href} className="flex items-center">
          <Link
            href={page.href}
            className={page.current ? 'text-sm hover:underline font-medium text-gray-800 hover:text-black' : 'text-sm hover:underline  font-medium text-gray-500 hover:text-gray-700'}
            aria-current={page.current ? 'page' : undefined}
          >
            {page.name}
          </Link>
        </div>
      ))}
    </>
  );
};

export { PureKysoBreadcrumb };
