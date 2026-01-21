import React from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './themed-text';

type GamePanelProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  gradient?: [string, string];
  icon?: string;
};

export const GamePanel: React.FC<GamePanelProps> = ({
  title,
  subtitle,
  children,
  collapsible = false,
  isExpanded = true,
  onToggle,
  gradient = ['rgba(255,255,255,0.9)', 'rgba(244,249,255,0.85)'],
  icon,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={styles.panel}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.panelBorder} />
      
      {collapsible ? (
        <Pressable onPress={onToggle} style={styles.panelHeaderCollapsible}>
          <View style={styles.panelHeaderContent}>
            <ThemedText style={styles.sectionLabel}>
              {icon} {title}
            </ThemedText>
            {subtitle && isMobile === false && (
              <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
            )}
          </View>
          <ThemedText style={styles.collapseIcon}>
            {isExpanded ? '▼' : '▶'}
          </ThemedText>
        </Pressable>
      ) : (
        <View style={styles.panelContent}>
          <ThemedText style={styles.sectionLabel}>
            {icon} {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          )}
        </View>
      )}

      {!collapsible || isExpanded ? (
        <View style={collapsible ? styles.panelContentCollapsed : null}>
          {children}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(92,230,255,0.14)',
    shadowColor: '#5ac8ff',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    backgroundColor: 'rgba(10,20,32,0.94)',
  },
  panelBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(92,230,255,0.14)',
  },
  panelContent: {
    gap: 10,
    padding: 14,
  },
  panelHeaderCollapsible: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 8,
  },
  panelHeaderContent: {
    flex: 1,
    gap: 4,
  },
  panelContentCollapsed: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  collapseIcon: {
    color: '#8ab4cc',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionLabel: {
    color: '#e7f2ff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#8ab4cc',
    fontSize: 13,
  },
});
