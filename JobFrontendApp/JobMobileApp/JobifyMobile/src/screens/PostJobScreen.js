import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';

const Select = ({ label, value, style }) => (
  <View style={style}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity activeOpacity={0.8} style={styles.select}>
      <Text style={styles.selectTxt}>{value}</Text>
      <Ionicons name="chevron-down" size={15} color={colors.muted} />
    </TouchableOpacity>
  </View>
);

export default function PostJobScreen({ navigation }) {
  const publish = () =>
    navigation.reset({ index: 0, routes: [{ name: 'EmployerApp', state: { routes: [{ name: 'Listings' }] } }] });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Post a Job</Text>
        <Text style={styles.sub}>Fill in the details to publish</Text>

        <View style={{ gap: 15, marginTop: 20 }}>
          <Field label="Job Title" placeholder="e.g. Product Designer" />
          <Field label="Company" defaultValue="Google" />
          <View style={styles.row}>
            <Select label="Experience" value="Expert" style={{ flex: 1 }} />
            <Select label="Job Type" value="Full Time" style={{ flex: 1 }} />
          </View>
          <View style={styles.row}>
            <Field label="Location" defaultValue="New York" style={{ flex: 1 }} />
            <Field label="Salary (LPA)" defaultValue="40" keyboardType="numeric" style={{ flex: 1 }} />
          </View>
          <Field label="Job Description" placeholder="About the role, responsibilities, qualifications..." multiline />
        </View>

        <PrimaryButton title="Publish job" onPress={publish} style={{ marginTop: 22 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 10 },
  title: { fontFamily: font.bold, fontSize: 22, color: colors.text, paddingTop: 6 },
  sub: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontFamily: font.regular, fontSize: 12, color: colors.textDim, marginBottom: 7 },
  select: { backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectTxt: { fontFamily: font.regular, fontSize: 14, color: '#d1d1d1' },
});
