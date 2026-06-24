import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { AppContext } from '../context/AppContext';
import Field from '../components/Field';

export default function LoginScreen({ navigation }) {
  const { setRole } = useContext(AppContext);

  const enter = (role) => {
    setRole(role);
    navigation.reset({
      index: 0,
      routes: [{ name: role === 'employer' ? 'EmployerApp' : 'ApplicantApp' }],
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="briefcase" size={22} color={colors.onAccent} />
          </View>
          <Text style={styles.brand}>
            Job<Text style={{ color: colors.accent }}>ify</Text>
          </Text>
        </View>

        <View style={{ marginTop: 46 }}>
          <Text style={styles.h1}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to continue your job search</Text>
        </View>

        <View style={{ gap: 16, marginTop: 34 }}>
          <Field label="Email" defaultValue="jarrod.wood@gmail.com" autoCapitalize="none" keyboardType="email-address" />
          <Field label="Password" defaultValue="password123" secureTextEntry />
          <Text style={styles.forgot}>Forgot password?</Text>
        </View>

        <Text style={styles.continueAs}>Continue as</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity activeOpacity={0.85} style={[styles.roleBtn, styles.rolePrimary]} onPress={() => enter('applicant')}>
            <Text style={styles.rolePrimaryTxt}>Job Seeker</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={[styles.roleBtn, styles.roleGhost]} onPress={() => enter('employer')}>
            <Text style={styles.roleGhostTxt}>Employer</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />
        <Text style={styles.footer}>
          Don't have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>Sign up</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flexGrow: 1, paddingHorizontal: 26, paddingBottom: 24, paddingTop: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 40, height: 40, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  brand: { fontFamily: font.bold, fontSize: 20, color: colors.text },
  h1: { fontFamily: font.bold, fontSize: 30, color: colors.text },
  sub: { fontFamily: font.regular, fontSize: 14, color: colors.textDim, marginTop: 8 },
  forgot: { fontFamily: font.medium, fontSize: 12, color: colors.accent, textAlign: 'right' },
  continueAs: { fontFamily: font.regular, fontSize: 12, color: colors.textDim, marginTop: 24 },
  roleRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  roleBtn: { flex: 1, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  rolePrimary: { backgroundColor: colors.accent },
  rolePrimaryTxt: { fontFamily: font.semibold, fontSize: 14, color: colors.onAccent },
  roleGhost: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  roleGhostTxt: { fontFamily: font.semibold, fontSize: 14, color: colors.text },
  footer: { textAlign: 'center', fontFamily: font.regular, fontSize: 13, color: colors.textDim, marginTop: 28 },
  link: { color: colors.accent, fontFamily: font.semibold },
});
