import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { font, radius } from '../theme';
import { useTheme } from '../context/ThemeContext';

// Small accent-on-card skill/tag pill.
export default function Tag({ children, style }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return <Text style={[styles.tag, style]}>{children}</Text>;
}

const makeStyles = (colors) => StyleSheet.create({
  tag: {
    backgroundColor: colors.cardAlt,
    color: colors.accent,
    fontFamily: font.medium,
    fontSize: 11.5,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
});
