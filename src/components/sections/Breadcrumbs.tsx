import { Breadcrumbs as MuiBreadcrumbs, Skeleton } from '@mui/material';
import Link from 'next/link';

export type BreadcrumbItem =
  | {
      label: string;
      href?: string;
    }
  | string;

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const normalizedItems = items.map((item) =>
    typeof item === 'string'
      ? { text: item }
      : { text: item.label, href: item.href },
  );

  if (normalizedItems.length === 0) {
    return null;
  }

  return (
    <MuiBreadcrumbs
      aria-label="Breadcrumb"
      className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200"
      separator={
        <span className="mx-2 text-slate-600 dark:text-slate-400">/</span>
      }
    >
      {normalizedItems.slice(0, -1).map(({ text, href }, index) => {
        if (text === 'loading') {
          return (
            <Skeleton
              key={`${text}-${index}`}
              variant="text"
              className="w-16"
            />
          );
        }
        if (href) {
          return (
            <Link
              key={`${text}-${href}`}
              href={href}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 transition hover:text-black dark:hover:text-white"
            >
              {text}
            </Link>
          );
        }
        return (
          <span
            key={`${text}-${index}`}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200"
          >
            {text}
          </span>
        );
      })}
      {normalizedItems.length &&
        (normalizedItems[normalizedItems.length - 1]?.text === 'loading' ? (
          <Skeleton variant="text" className="w-16" />
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">
            {normalizedItems[normalizedItems.length - 1]?.text}
          </span>
        ))}
    </MuiBreadcrumbs>
  );
}
