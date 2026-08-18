import { Skeleton, Typography } from '@mui/material';
import React, { type ReactNode } from 'react';
import { BaseCard } from '@src/components/common/BaseCard';

interface PanelPropsBase {
  heading?: ReactNode;
  description?: ReactNode;
  startAdornment?: React.JSX.Element;
  endAdornment?: React.JSX.Element;
  smallPadding?: boolean;
}

interface PanelProps extends PanelPropsBase {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  children?: ReactNode;
}

const Panel = ({
  children,
  heading,
  description,
  startAdornment,
  endAdornment,
  smallPadding = false,
  className,
  style,
  id,
}: PanelProps) => {
  return (
    <BaseCard
      className={`flex flex-col gap-2 ${smallPadding ? 'p-5' : 'max-sm:px-2 max-sm:py-4 sm:px-14 sm:py-10'} max-w-6xl min-w-0 ${className ?? ''}`}
      {...(id ? { id } : {})}
      style={style}
    >
      {(startAdornment || heading || endAdornment) && (
        <div
          className={`flex items-center gap-2 ${smallPadding ? '' : 'ml-2'}`}
        >
          {startAdornment}
          {heading && (
            <Typography variant="h2" className="text-xl font-bold">
              {heading}
            </Typography>
          )}
          {endAdornment}
        </div>
      )}
      {description && (
        <div
          className={`mb-4 text-sm text-slate-600 dark:text-slate-400 ${smallPadding ? '' : 'ml-2'}`}
        >
          {description}
        </div>
      )}
      {children}
    </BaseCard>
  );
};

export default Panel;

interface PanelSkeletonProps {
  className?: string;
}

export const PanelSkeleton = (props: PanelSkeletonProps) => {
  return (
    <Skeleton
      className={
        'flex w-6xl min-w-0 flex-col gap-2 rounded-lg max-sm:px-2 max-sm:py-4 sm:px-14 sm:py-10 ' +
        props.className
      }
      variant="rounded"
      height={512}
    ></Skeleton>
  );
};
