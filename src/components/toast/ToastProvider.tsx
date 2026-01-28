'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

// toast types (style variants)
type ToastVariant = 'success' | 'error' | 'info' | 'warning';

// structure for each toast item
export type Toast = {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number; // milliseconds visible
};

// methods exposed by the toast context
type ToastContextValue = {
  show: (t: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  success: (
    message: string,
    opts?: Omit<Toast, 'id' | 'message' | 'variant'>,
  ) => string;
  error: (
    message: string,
    opts?: Omit<Toast, 'id' | 'message' | 'variant'>,
  ) => string;
  info: (
    message: string,
    opts?: Omit<Toast, 'id' | 'message' | 'variant'>,
  ) => string;
  warning: (
    message: string,
    opts?: Omit<Toast, 'id' | 'message' | 'variant'>,
  ) => string;
};

const ToastContext = createContext<ToastContextValue | null>(null);

// generate simple random id
const makeId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

// provider wraps app and manages toast state
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});

  // remove toast and clear its timer
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timers.current[id];
    if (handle) {
      window.clearTimeout(handle);
      delete timers.current[id];
    }
  }, []);

  // create and display a new toast
  const show = useCallback(
    ({
      title,
      message,
      variant = 'info',
      duration = 4000,
    }: Omit<Toast, 'id'>) => {
      const id = makeId();
      const toast: Toast = { id, title, message, variant, duration };
      setToasts((prev) => [toast, ...prev]);
      timers.current[id] = window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  // quick helpers for each variant (success, error, etc.)
  const factory =
    (variant: ToastVariant) =>
    (message: string, opts?: Omit<Toast, 'id' | 'message' | 'variant'>) =>
      show({ message, variant, ...opts });

  // memoized context value
  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      dismiss,
      success: factory('success'),
      error: factory('error'),
      info: factory('info'),
      warning: factory('warning'),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// hook to use inside components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}

// renders list of active toasts
function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-1000 flex max-w-md flex-col gap-3"
      aria-live="polite"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

// single toast card UI
function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const { title, message, variant = 'info' } = toast;

  // variant-specific styling
  const styles: Record<ToastVariant, string> = {
    success:
      'border-green-200 bg-green-50 text-green-900 dark:border-green-900/30 dark:bg-green-950 dark:text-green-100',
    error:
      'border-red-200 bg-red-50 text-red-900 dark:border-red-900/30 dark:bg-red-950 dark:text-red-100',
    info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/30 dark:bg-blue-950 dark:text-blue-100',
    warning:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/30 dark:bg-amber-950 dark:text-amber-100',
  };

  const badge: Record<ToastVariant, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div
      className={`pointer-events-auto w-full rounded-2xl border p-4 shadow-lg backdrop-blur-sm ${styles[variant]}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-xl leading-none">{badge[variant]}</div>
        <div className="flex-1">
          {title && <div className="font-semibold">{title}</div>}
          <div className="text-sm opacity-90">{message}</div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm hover:opacity-80 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          aria-label="Dismiss notification"
        >
          ✖
        </button>
      </div>
    </div>
  );
}
