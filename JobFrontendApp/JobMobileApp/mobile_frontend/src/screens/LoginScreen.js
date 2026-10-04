import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { font, radius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { AppContext } from '../context/AppContext';
import Field from '../components/Field';
import ResetPasswordModal from '../components/ResetPasswordModal';
import { errMessage } from '../api/client';
import { validateLogin } from '../utils/validation';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AppContext);
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const submit = async () => {
    const errs = validateLogin({ email, password });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      // On success the navigator swaps to the authenticated stack automatically.
    } catch (e) {
      Alert.alert('Login failed', errMessage(e));
    } finally {
      setLoading(false);
    }
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
          <View>
            <Field
              label="Email"
              placeholder="you@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email ? <Text style={styles.err}>{errors.email}</Text> : null}
          </View>
          <View>
            <Field
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors.password ? <Text style={styles.err}>{errors.password}</Text> : null}
          </View>
          <Text style={styles.forgot} onPress={() => setShowReset(true)}>Forgot password?</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.signIn, loading && { opacity: 0.7 }]}
          onPress={submit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.signInTxt}>Sign In</Text>}
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
        <Text style={styles.footer}>
          Don't have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>Sign up</Text>
        </Text>
      </ScrollView>

      <ResetPasswordModal visible={showReset} onClose={() => setShowReset(false)} initialEmail={email} />
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flexGrow: 1, paddingHorizontal: 26, paddingBottom: 24, paddingTop: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 40, height: 40, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  brand: { fontFamily: font.bold, fontSize: 20, color: colors.text },
  h1: { fontFamily: font.bold, fontSize: 30, color: colors.text },
  sub: { fontFamily: font.regular, fontSize: 14, color: colors.textDim, marginTop: 8 },
  forgot: { fontFamily: font.medium, fontSize: 12, color: colors.accent, textAlign: 'right' },
  err: { fontFamily: font.regular, fontSize: 11, color: colors.danger, marginTop: 5 },
  signIn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 28 },
  signInTxt: { fontFamily: font.semibold, fontSize: 15, color: colors.onAccent },
  footer: { textAlign: 'center', fontFamily: font.regular, fontSize: 13, color: colors.textDim, marginTop: 28 },
  link: { color: colors.accent, fontFamily: font.semibold },
});
