import React, { useState } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './themed-text';
import { useDesignTokens } from '@/hooks/use-design-tokens';

type CardProps = {
  title?: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon,
  children,
  collapsible = false,
  defaultExpanded = true,
  variant = 'default',
  padding = 'md',
  style,
}) => {
  const { colors, spacing, radius, shadows, isDark } = useDesignTokens();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const paddingMap = {
    none: 0,
    sm: spacing.sm,
    md: spacing.lg,
    lg: spacing.xl,
  };

  const cardStyle: ViewStyle = {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: variant === 'elevated' ? colors.surfaceElevated : colors.surface,
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: colors.border,
    ...(variant === 'elevated' ? shadows.md : shadows.sm),
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: paddingMap[padding],
    gap: spacing.sm,
  };

  const contentStyle: ViewStyle = {
    padding: paddingMap[padding],
    paddingTop: title ? 0 : paddingMap[padding],
  };

  const titleStyle = {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  };

  const subtitleStyle = {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  };

  const renderHeader = () => {
    if (!title && !collapsible) return null;

    const headerContent = (
      <View style={styles.headerContent}>
        <View style={styles.titleRow}>
          {icon ? <ThemedText style={styles.icon}>{icon}</ThemedText> : null}
          {title ? <ThemedText style={titleStyle}>{title}</ThemedText> : null}
        </View>
        {subtitle ? <ThemedText style={subtitleStyle}>{subtitle}</ThemedText> : null}
      </View>
    );

    if (collapsible) {
      return (
        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          style={({ pressed }) => [
            headerStyle,
            { opacity: pressed ? 0.8 : 1 },
          ]}>
          {headerContent}
          <ThemedText style={{ color: colors.textMuted, fontSize: 12 }}>
            {isExpanded ? '▼' : '▶'}
          </ThemedText>
        </Pressable>
      );
    }

    return <View style={headerStyle}>{headerContent}</View>;
  };

  return (
    <View style={[cardStyle, style]}>
      {isDark && variant === 'elevated' && (
        <LinearGradient
          colors={[colors.surface, colors.surfaceSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {renderHeader()}
      {(!collapsible || isExpanded) && (
        <View style={contentStyle}>{children}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
});

export default Card;
