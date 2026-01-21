import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

type StatPillProps = {
  label: string;
  value: number | string;
  onPress?: () => void;
};

export const StatPill: React.FC<StatPillProps> = ({ label, value, onPress }) => {
  const onPressWrapper = onPress ? 
    <Pressable onPress={onPress} style={styles.pressable}>
      <View style={styles.statPill}>
        <ThemedText style={styles.statLabel}>{label}</ThemedText>
        <ThemedText style={styles.statValue}>{value}</ThemedText>
      </View>
    </Pressable> 
    : 
    <View style={styles.statPill}>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
    </View>;

  return onPressWrapper;
};

const styles = StyleSheet.create({
  pressable: {
    flex: 0,
  },
  statPill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(92,230,255,0.24)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 85,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '600',
  },
  statValue: {
    fontWeight: '700',
    fontSize: 15,
  },
});
