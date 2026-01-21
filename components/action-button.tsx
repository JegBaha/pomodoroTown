import React from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './themed-text';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'solid' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  gradient?: [string, string, string];
  style?: ViewStyle;
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onPress,
  disabled = false,
  variant = 'solid',
  size = 'md',
  loading = false,
  gradient = ['#5ac8ff', '#7dd8c8', '#ffe8a3'],
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSmall,
        size === 'lg' && styles.buttonLarge,
        variant === 'ghost' && styles.buttonGhost,
        { opacity: disabled ? 0.4 : pressed ? 0.92 : 1 },
        style,
      ]}>
      {variant === 'solid' && !loading && (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'ghost' ? '#5ac8ff' : '#fff'} />
      ) : (
        <ThemedText 
          style={[
            variant === 'ghost' ? styles.buttonGhostText : styles.buttonText,
            size === 'sm' && styles.buttonTextSmall,
          ]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(92,230,255,0.24)',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,20,32,0.9)',
  },
  buttonSmall: {
    minWidth: 50,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  buttonLarge: {
    minWidth: 140,
    paddingVertical: 12,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1.2,
  },
  buttonText: {
    color: '#e7f2ff',
    fontWeight: '700',
    letterSpacing: 0.05,
    fontSize: 14,
  },
  buttonTextSmall: {
    fontSize: 12,
  },
  buttonGhostText: {
    color: '#e7f2ff',
    fontWeight: '600',
    letterSpacing: 0.05,
    fontSize: 14,
  },
});
