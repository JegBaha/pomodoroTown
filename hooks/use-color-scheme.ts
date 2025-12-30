import React, { createContext, useContext, useMemo, useState } from 'react';
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
  const systemScheme = useRNColorScheme();
  const [scheme, setScheme] = useState<ColorSchemeName>(defaultScheme ?? systemScheme ?? 'dark');

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
