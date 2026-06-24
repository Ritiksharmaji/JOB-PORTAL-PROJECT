import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font } from '../theme';

// Simple back-arrow + optional title row used on detail screens.
export default function ScreenHeader({ title, onBack, right }) {
  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={onBack} style={styles.btn}>
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </TouchableOpacity>
      {title ? <Text style={styles.title}>{title}</Text> : <View />}
      {right ? right : <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  btn: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: font.bold, fontSize: 17, color: colors.text, flex: 1, marginLeft: 12 },
  spacer: { width: 38 },
});
