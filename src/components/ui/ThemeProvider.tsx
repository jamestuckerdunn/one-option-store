'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider for dark mode support.
 * Wraps the app to enable theme switching.
 *
 * Usage:
 * ```tsx
 * import { useTheme } from 'next-themes';
 * const { theme, setTheme } = useTheme();
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
