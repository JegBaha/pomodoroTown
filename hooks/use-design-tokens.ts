import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useColorScheme } from './use-color-scheme';
import {
  palette,
  spacing,
  typography,
  radius,
  shadows,
  breakpoints,
  durations,
  zIndex,
  type ColorPalette,
} from '../constants/design-tokens';

export type DesignTokens = {
  colors: ColorPalette;
  spacing: typeof spacing;
  typography: typeof typography;
  radius: typeof radius;
  shadows: typeof shadows;
  breakpoints: typeof breakpoints;
  durations: typeof durations;
  zIndex: typeof zIndex;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isDark: boolean;
};

/**
 * Hook to access all design tokens with responsive helpers
 */
export function useDesignTokens(): DesignTokens {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const isDark = colorScheme === 'dark';
    const colors = isDark ? palette.dark : palette.light;
    const isMobile = width < breakpoints.tablet;
    const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
    const isDesktop = width >= breakpoints.desktop;

    return {
      colors,
      spacing,
      typography,
      radius,
      shadows,
      breakpoints,
      durations,
      zIndex,
      isMobile,
      isTablet,
      isDesktop,
      isDark,
    };
  }, [colorScheme, width]);
}

/**
 * Hook to get only colors (lighter weight)
 */
export function useColors(): ColorPalette {
  const colorScheme = useColorScheme();
  return useMemo(
    () => (colorScheme === 'dark' ? palette.dark : palette.light),
    [colorScheme]
  );
}

/**
 * Hook to check if device is mobile
 */
export function useIsMobile(): boolean {
  const { width } = useWindowDimensions();
  return width < breakpoints.tablet;
}

export default useDesignTokens;
