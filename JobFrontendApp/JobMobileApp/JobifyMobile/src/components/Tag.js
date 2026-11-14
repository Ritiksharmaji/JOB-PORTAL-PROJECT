import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, font, radius } from '../theme';

// Small yellow-on-dark skill/tag pill.
export default function Tag({ children, style }) {
  return <Text style={[styles.tag, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
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
