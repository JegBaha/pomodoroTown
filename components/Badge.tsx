import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from './themed-text';
import { useDesignTokens } from '@/hooks/use-design-tokens';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'gold' | 'wood' | 'stone' | 'food';
type BadgeSize = 'sm' | 'md' | 'lg';

type BadgeProps = {
  label?: string;
  value: string | number;
  icon?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  value,
  icon,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const { colors, spacing, radius, shadows } = useDesignTokens();

  const sizeStyles = {
    sm: {
      paddingH: spacing.sm,
      paddingV: spacing.xs,
      fontSize: 11,
      valueFontSize: 13,
      minWidth: 60,
    },
    md: {
      paddingH: spacing.md,
      paddingV: spacing.sm,
      fontSize: 12,
      valueFontSize: 15,
      minWidth: 75,
    },
    lg: {
      paddingH: spacing.lg,
      paddingV: spacing.md,
      fontSize: 13,
      valueFontSize: 17,
      minWidth: 90,
    },
  };

  const getColors = (): { bg: string; text: string; border: string } => {
    switch (variant) {
      case 'primary':
        return { bg: colors.accentSoft, text: colors.accent, border: colors.accent };
      case 'success':
        return { bg: colors.successSoft, text: colors.success, border: colors.success };
      case 'warning':
        return { bg: colors.warningSoft, text: colors.warning, border: colors.warning };
      case 'error':
        return { bg: colors.errorSoft, text: colors.error, border: colors.error };
      case 'gold':
        return { bg: colors.warningSoft, text: colors.gold, border: colors.gold };
      case 'wood':
        return { bg: `${colors.wood}15`, text: colors.wood, border: colors.wood };
      case 'stone':
        return { bg: `${colors.stone}15`, text: colors.stone, border: colors.stone };
      case 'food':
        return { bg: colors.successSoft, text: colors.food, border: colors.food };
      default:
        return { bg: colors.surfaceSecondary, text: colors.textPrimary, border: colors.border };
    }
  };

  const currentSize = sizeStyles[size];
  const variantColors = getColors();

  const badgeStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: currentSize.paddingH,
    paddingVertical: currentSize.paddingV,
    borderRadius: radius.md,
    backgroundColor: variantColors.bg,
    borderWidth: 1,
    borderColor: `${variantColors.border}30`,
    minWidth: currentSize.minWidth,
    ...shadows.sm,
  };

  return (
    <View style={[badgeStyle, style]}>
      {icon ? (
        <ThemedText style={{ fontSize: currentSize.fontSize }}>{icon}</ThemedText>
      ) : null}
      <View style={styles.content}>
        {label ? (
          <ThemedText
            style={{
              color: colors.textMuted,
              fontSize: currentSize.fontSize - 1,
              fontWeight: '500',
            }}>
            {label}
          </ThemedText>
        ) : null}
        <ThemedText
          style={{
            color: variantColors.text,
            fontSize: currentSize.valueFontSize,
            fontWeight: '700',
          }}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
};

// Resource Badge - Convenience component for resources
type ResourceBadgeProps = {
  type: 'gold' | 'wood' | 'stone' | 'food';
  value: number;
  size?: BadgeSize;
  showLabel?: boolean;
  style?: ViewStyle;
};

const resourceIcons: Record<string, string> = {
  gold: '💰',
  wood: '🪵',
  stone: '🪨',
  food: '🍞',
};

const resourceLabels: Record<string, string> = {
  gold: 'Gold',
  wood: 'Wood',
  stone: 'Stone',
  food: 'Food',
};

export const ResourceBadge: React.FC<ResourceBadgeProps> = ({
  type,
  value,
  size = 'md',
  showLabel = true,
  style,
}) => {
  return (
    <Badge
      icon={resourceIcons[type]}
      label={showLabel ? resourceLabels[type] : undefined}
      value={value}
      variant={type}
      size={size}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'column',
  },
});

export default Badge;
