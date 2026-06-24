import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, font, radius } from '../theme';

// Solid yellow primary action button.
export default function PrimaryButton({ title, onPress, style }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.btn, style]}>
      <Text style={styles.txt}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: {
    color: colors.onAccent,
    fontFamily: font.semibold,
    fontSize: 15,
  },
});
