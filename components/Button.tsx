import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './themed-text';
import { useDesignTokens } from '@/hooks/use-design-tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  style,
}) => {
  const { colors, spacing, radius, shadows } = useDesignTokens();

  const sizeStyles: Record<ButtonSize, { paddingH: number; paddingV: number; minWidth: number; fontSize: number }> = {
    sm: { paddingH: spacing.sm, paddingV: spacing.sm, minWidth: 44, fontSize: 12 },
    md: { paddingH: spacing.lg, paddingV: spacing.md, minWidth: 80, fontSize: 14 },
    lg: { paddingH: spacing.xl, paddingV: spacing.lg, minWidth: 120, fontSize: 16 },
  };

  const currentSize = sizeStyles[size];

  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.accent;
      case 'secondary':
        return colors.surfaceSecondary;
      case 'ghost':
      case 'outline':
        return 'transparent';
      default:
        return colors.accent;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.textInverse;
      case 'secondary':
      case 'ghost':
      case 'outline':
        return colors.textPrimary;
      default:
        return colors.textInverse;
    }
  };

  const getBorderColor = (): string => {
    switch (variant) {
      case 'outline':
        return colors.border;
      case 'primary':
        return colors.accent;
      default:
        return 'transparent';
    }
  };

  const buttonStyle: ViewStyle = {
    paddingHorizontal: currentSize.paddingH,
    paddingVertical: currentSize.paddingV,
    minWidth: fullWidth ? undefined : currentSize.minWidth,
    minHeight: 44, // Accessibility: minimum touch target
    borderRadius: radius.md,
    backgroundColor: getBackgroundColor(),
    borderWidth: variant === 'outline' ? 1.5 : 0,
    borderColor: getBorderColor(),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...(variant === 'primary' ? shadows.sm : shadows.none),
  };

  const textStyle: TextStyle = {
    color: getTextColor(),
    fontSize: currentSize.fontSize,
    fontWeight: '600',
    letterSpacing: 0.2,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        buttonStyle,
        fullWidth && styles.fullWidth,
        {
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        style,
      ]}>
      {variant === 'primary' && !loading && (
        <LinearGradient
          colors={[colors.accent, colors.accentHover]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: radius.md }]}
        />
      )}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.textInverse : colors.accent}
        />
      ) : (
        <>
          {icon ? <ThemedText style={textStyle}>{icon}</ThemedText> : null}
          <ThemedText style={textStyle}>{label}</ThemedText>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
});

export default Button;
