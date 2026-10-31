import { BaseCard } from '@nebula-library/components/BaseCard';
import Link from 'next/link';
import Breadcrumbs, {
  type BreadcrumbItem,
} from '@src/lib/components/Breadcrumbs';

type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  detailBreadcrumbs?: BreadcrumbItem[];
  metaLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
};

export default function SectionHeader({
  title,
  eyebrow,
  description,
  detailBreadcrumbs,
  metaLabel,
  breadcrumbs = [],
}: SectionHeaderProps) {
  const detailItems = (detailBreadcrumbs ?? []).filter(Boolean);

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <div className="flex flex-col gap-2">
        {breadcrumbs.length > 0 ? (
          <Breadcrumbs items={breadcrumbs} />
        ) : (
          <span className="text-xs font-semibold tracking-[0.25em] uppercase">
            {eyebrow}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-display text-4xl font-extrabold md:text-5xl">
            {title}
          </h1>
          {metaLabel && (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="bg-royal dark:bg-cornflower-300 h-2 w-2 rounded-full" />
              <span>{metaLabel}</span>
            </div>
          )}
        </div>
        {description && (
          <p className="max-w-2xl text-sm text-slate-800 md:text-base dark:text-slate-200">
            {description}
          </p>
        )}
        {detailItems.length > 0 && <Breadcrumbs items={detailItems} />}
      </div>

      <Link
        href="/notes/create"
        className="bg-royal hover:bg-royal/90 text-white flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow transition-colors shrink-0"
      >
        <span>+ Add Note</span>
      </Link>
    </div>
  );
}
