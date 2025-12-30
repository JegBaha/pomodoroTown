import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocale } from '@/src/locale/i18n';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useLocale();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: `⏱️ ${t('tab.pomodoro')}`,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="timer" color={color} />,
        }}
      />
      <Tabs.Screen
        name="town"
        options={{
          title: `🏡 ${t('tab.town')}`,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="tree.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: `📝 ${t('tab.notes')}`,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="note.text" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: `👤 ${t('tab.profile')}`,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
