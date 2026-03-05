import { BaseCard } from '@src/components/common/BaseCard';

type EmptyStateCardProps = {
  title: string;
  description: string;
};

export default function EmptyStateCard({
  title,
  description,
}: EmptyStateCardProps) {
  return (
    <BaseCard className="px-6 py-5 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </BaseCard>
  );
}
