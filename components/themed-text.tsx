import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { typography } from '@/constants/design-tokens';

export type TextVariant =
  | 'default'
  | 'caption'
  | 'body'
  | 'bodyMedium'
  | 'bodySemiBold'
  | 'subtitle'
  | 'title'
  | 'headline'
  | 'display'
  | 'link'
  | 'defaultSemiBold'; // Legacy support

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: TextVariant;
  // Legacy support
  variant?: TextVariant;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type,
  variant,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const textType = variant || type || 'default';

  return (
    <Text
      style={[
        { color },
        styles[textType] || styles.default,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.weight,
  },
  caption: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.weight,
  },
  body: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.weight,
  },
  bodyMedium: {
    fontSize: typography.bodyMedium.size,
    lineHeight: typography.bodyMedium.lineHeight,
    fontWeight: typography.bodyMedium.weight,
  },
  bodySemiBold: {
    fontSize: typography.bodySemiBold.size,
    lineHeight: typography.bodySemiBold.lineHeight,
    fontWeight: typography.bodySemiBold.weight,
  },
  subtitle: {
    fontSize: typography.subtitle.size,
    lineHeight: typography.subtitle.lineHeight,
    fontWeight: typography.subtitle.weight,
  },
  title: {
    fontSize: typography.title.size,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.weight,
  },
  headline: {
    fontSize: typography.headline.size,
    lineHeight: typography.headline.lineHeight,
    fontWeight: typography.headline.weight,
  },
  display: {
    fontSize: typography.display.size,
    lineHeight: typography.display.lineHeight,
    fontWeight: typography.display.weight,
  },
  link: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  // Legacy support
  defaultSemiBold: {
    fontSize: typography.bodySemiBold.size,
    lineHeight: typography.bodySemiBold.lineHeight,
    fontWeight: typography.bodySemiBold.weight,
  },
});

export default ThemedText;
