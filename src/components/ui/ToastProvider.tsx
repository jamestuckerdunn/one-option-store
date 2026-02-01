'use client';

import { Toaster } from 'sonner';

/**
 * Toast notification provider.
 * Wraps the app to enable toast notifications via sonner.
 *
 * Usage in components:
 * ```tsx
 * import { toast } from 'sonner';
 * toast.success('Action completed!');
 * toast.error('Something went wrong');
 * ```
 */
export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      expand={false}
      richColors
      toastOptions={{
        className: 'rounded-xl shadow-lg',
        duration: 4000,
      }}
    />
  );
}
