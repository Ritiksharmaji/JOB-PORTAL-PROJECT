import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { AppContext } from '../context/AppContext';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';

export default function SignupScreen({ navigation }) {
  const { setRole } = useContext(AppContext);
  const [pick, setPick] = useState('applicant');

  const submit = () => {
    setRole(pick);
    navigation.reset({
      index: 0,
      routes: [{ name: pick === 'employer' ? 'EmployerApp' : 'ApplicantApp' }],
    });
  };

  const RoleChip = ({ value, label }) => {
    const active = pick === value;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setPick(value)}
        style={[styles.chip, { borderColor: active ? colors.accent : colors.border, backgroundColor: active ? 'rgba(255,189,32,0.12)' : 'transparent' }]}
      >
        <Text style={[styles.chipTxt, { color: active ? colors.accent : colors.textDim }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.h1}>Create account</Text>
          <Text style={styles.sub}>Start your journey with Jobify</Text>
        </View>

        <View style={styles.roleRow}>
          <RoleChip value="applicant" label="Job Seeker" />
          <RoleChip value="employer" label="Employer" />
        </View>

        <View style={{ gap: 14, marginTop: 20 }}>
          <Field label="Full name" placeholder="John Doe" />
          <Field label="Email" placeholder="you@email.com" autoCapitalize="none" keyboardType="email-address" />
          <Field label="Password" placeholder="••••••••" secureTextEntry />
        </View>

        <PrimaryButton title="Create account" onPress={submit} style={{ marginTop: 24 }} />

        <Text style={styles.footer}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.goBack()}>Sign in</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flexGrow: 1, paddingHorizontal: 26, paddingBottom: 24, paddingTop: 14 },
  back: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: font.bold, fontSize: 28, color: colors.text },
  sub: { fontFamily: font.regular, fontSize: 14, color: colors.textDim, marginTop: 8 },
  roleRow: { flexDirection: 'row', gap: 10, marginTop: 22 },
  chip: { flex: 1, paddingVertical: 13, borderRadius: radius.md, borderWidth: 1.5, alignItems: 'center' },
  chipTxt: { fontFamily: font.semibold, fontSize: 13 },
  footer: { textAlign: 'center', fontFamily: font.regular, fontSize: 13, color: colors.textDim, marginTop: 18 },
  link: { color: colors.accent, fontFamily: font.semibold },
});
