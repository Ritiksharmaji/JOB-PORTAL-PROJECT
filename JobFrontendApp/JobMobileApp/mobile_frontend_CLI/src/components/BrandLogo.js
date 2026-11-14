import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { font } from '../theme';
import { useTheme } from '../context/ThemeContext';

// oneKampus Jobs brand: onekampus.com's hire icon (in the app's yellow) + "oneKampus Jobs" wordmark,
// the same mark as the web app (jobs.onekampus.com).
export default function BrandLogo({ size = 'md' }) {
  const { colors } = useTheme();
  const s = size === 'lg' ? { icon: 44, text: 24 } : { icon: 34, text: 19 };
  return (
    <View style={styles.row} accessibilityLabel="oneKampus Jobs">
      <Image source={require('../assets/brand-icon.png')} style={{ width: s.icon, height: s.icon }} />
      <Text style={[styles.word, { fontSize: s.text, color: colors.text }]}>
        oneKampus<Text style={{ color: colors.accent, fontFamily: font.medium }}> Jobs</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  word: { fontFamily: font.semibold, letterSpacing: -0.3 },
});
