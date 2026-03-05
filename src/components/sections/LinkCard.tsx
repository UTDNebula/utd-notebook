import Link from 'next/link';
import { BaseCard } from '@src/components/common/BaseCard';

type LinkCardProps = {
  href: string;
  title: string;
  subtitle?: string;
  description?: string;
  meta?: string;
};

export default function LinkCard({
  href,
  title,
  subtitle,
  description,
  meta,
}: LinkCardProps) {
  return (
    <BaseCard variant="interactive" className="h-full">
      <Link href={href} className="flex h-full flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold" title={title}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {subtitle}
            </p>
          )}
        </div>

        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {description}
          </p>
        )}

        {meta && (
          <div className="mt-auto text-xs font-semibold text-royal dark:text-cornflower-300">
            {meta}
          </div>
        )}
      </Link>
    </BaseCard>
  );
}
