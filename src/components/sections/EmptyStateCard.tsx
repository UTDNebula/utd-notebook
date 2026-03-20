import type { SvgIconComponent } from '@mui/icons-material';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import { BaseCard } from '@src/components/common/BaseCard';

type EmptyStateCardProps = {
  title: string;
  description: string;
  icon?: SvgIconComponent;
};

export default function EmptyStateCard({
  title,
  description,
  icon: Icon = FolderOffIcon,
}: EmptyStateCardProps) {
  return (
    <BaseCard className="px-6 py-8 text-center">
      <Icon
        className="mx-auto mb-3 text-slate-400 dark:text-slate-500"
        sx={{ fontSize: 48 }}
      />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </BaseCard>
  );
}
