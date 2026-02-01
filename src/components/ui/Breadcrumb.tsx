import Link from 'next/link';
import { ChevronRightIcon } from './Icons';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav aria-label="Breadcrumb" className="font-sans text-sm text-gray-500">
          <ol className="flex items-center gap-2 flex-wrap">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              // Use href + label combination for unique key, fallback to label-index for items without href
              const uniqueKey = item.href ? `${item.href}-${item.label}` : `${item.label}-${index}`;

              return (
                <li key={uniqueKey} className="flex items-center gap-2">
                  {index > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-300" aria-hidden="true" />}
                  {item.href && !isLast ? (
                    <Link href={item.href} className="hover:text-black transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-gray-900 font-medium' : ''} aria-current={isLast ? 'page' : undefined}>
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
