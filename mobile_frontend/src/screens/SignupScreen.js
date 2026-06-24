import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { AppContext } from '../context/AppContext';
import Field from '../components/Field';
import { errMessage } from '../api/client';
import { validateSignup } from '../utils/validation';

export default function SignupScreen({ navigation }) {
  const { register } = useContext(AppContext);
  const [accountType, setAccountType] = useState('APPLICANT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const errs = validateSignup({ name, email, password, confirmPassword: password });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, confirmPassword: password, accountType });
      Alert.alert('Account created', 'You can now sign in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      Alert.alert('Sign up failed', errMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const RoleChip = ({ value, label }) => {
    const active = accountType === value;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setAccountType(value)}
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
          <RoleChip value="APPLICANT" label="Job Seeker" />
          <RoleChip value="EMPLOYER" label="Employer" />
        </View>

        <View style={{ gap: 14, marginTop: 20 }}>
          <View>
            <Field label="Full name" placeholder="John Doe" value={name} onChangeText={setName} />
            {errors.name ? <Text style={styles.err}>{errors.name}</Text> : null}
          </View>
          <View>
            <Field label="Email" placeholder="you@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            {errors.email ? <Text style={styles.err}>{errors.email}</Text> : null}
          </View>
          <View>
            <Field label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
            {errors.password ? <Text style={styles.err}>{errors.password}</Text> : null}
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={[styles.create, loading && { opacity: 0.7 }]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.createTxt}>Create account</Text>}
        </TouchableOpacity>

        <Text style={styles.footer}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Sign in</Text>
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
  err: { fontFamily: font.regular, fontSize: 11, color: colors.danger, marginTop: 5 },
  create: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  createTxt: { fontFamily: font.semibold, fontSize: 15, color: colors.onAccent },
  footer: { textAlign: 'center', fontFamily: font.regular, fontSize: 13, color: colors.textDim, marginTop: 18 },
  link: { color: colors.accent, fontFamily: font.semibold },
});
