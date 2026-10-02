import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, font, radius } from '../theme';

// Labeled dark text field used across forms.
export default function Field({ label, style, inputStyle, multiline, ...props }) {
  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, multiline && styles.multiline, inputStyle]}
        multiline={multiline}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textDim,
    marginBottom: 7,
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontFamily: font.regular,
    fontSize: 14,
  },
  multiline: {
    height: 110,
    textAlignVertical: 'top',
  },
});
