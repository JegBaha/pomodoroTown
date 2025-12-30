import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { type ColorSchemeName, useColorScheme as useRNColorScheme } from 'react-native';

type ColorSchemeContextValue = {
  colorScheme: ColorSchemeName;
  setColorScheme: (scheme: ColorSchemeName) => void;
  toggleColorScheme: () => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue>({
  colorScheme: 'dark',
  setColorScheme: () => {},
  toggleColorScheme: () => {},
});

export const ColorSchemeProvider = ({
  children,
  defaultScheme = 'dark',
}: {
  children: React.ReactNode;
  defaultScheme?: ColorSchemeName;
}) => {
  const system = useRNColorScheme();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [scheme, setScheme] = useState<ColorSchemeName>(defaultScheme ?? system ?? 'dark');

  useEffect(() => {
    setHasHydrated(true);
    if (system) {
      setScheme(system);
    }
  }, [system]);

  const value = useMemo(
    () => ({
      colorScheme: scheme,
      setColorScheme: setScheme,
      toggleColorScheme: () => setScheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [scheme],
  );

  return React.createElement(ColorSchemeContext.Provider, { value }, children);
};

export function useColorScheme() {
  return useContext(ColorSchemeContext).colorScheme;
}

export function useColorSchemeController() {
  return useContext(ColorSchemeContext);
}

export default ColorSchemeProvider;
