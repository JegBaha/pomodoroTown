import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ColorSchemeProvider, useColorScheme } from '@/hooks/use-color-scheme';
import { GameProvider } from '@/src/game/game-provider';
import { LocaleProvider } from '@/src/locale/i18n';

// Temporary debug to identify undefined components causing "Element type is invalid"
// Remove once the root layout renders cleanly.
// eslint-disable-next-line no-console
console.log('RootLayout deps', {
  Stack: typeof Stack,
  ThemeProvider: typeof ThemeProvider,
  ColorSchemeProvider: typeof ColorSchemeProvider,
  GameProvider: typeof GameProvider,
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ColorSchemeProvider defaultScheme="dark">
      <AppShell />
    </ColorSchemeProvider>
  );
}

const AppShell = () => {
  const colorScheme = useColorScheme();

  return (
    <LocaleProvider>
      <GameProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </GameProvider>
    </LocaleProvider>
  );
};
