import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import Field from './Field';
import { sendOtp, verifyOtp, changePassword } from '../services/authService';
import { errMessage } from '../api/client';
import { validateField } from '../utils/validation';

// Three-step OTP reset flow mirroring the web ResetPassword modal:
// 1) email -> sendOtp  2) otp -> verifyOtp  3) new password -> changePass
export default function ResetPasswordModal({ visible, onClose, initialEmail = '' }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep(1);
    setOtp('');
    setPassword('');
    setLoading(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const doSendOtp = async () => {
    if (!email.trim()) return Alert.alert('Email required', 'Enter your account email.');
    setLoading(true);
    try {
      await sendOtp(email.trim());
      Alert.alert('OTP sent', 'Check your email for the 6-digit code.');
      setStep(2);
    } catch (e) {
      Alert.alert('Could not send OTP', errMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const doVerifyOtp = async () => {
    if (!/^[0-9]{6}$/.test(otp)) return Alert.alert('Invalid code', 'Enter the 6-digit code.');
    setLoading(true);
    try {
      await verifyOtp(email.trim(), otp);
      setStep(3);
    } catch (e) {
      Alert.alert('Verification failed', errMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const doChangePass = async () => {
    const msg = validateField('password', password);
    if (msg) return Alert.alert('Weak password', msg);
    setLoading(true);
    try {
      await changePassword(email.trim(), password);
      Alert.alert('Success', 'Your password has been changed. Please sign in.');
      close();
    } catch (e) {
      Alert.alert('Could not change password', errMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Reset password</Text>
            <TouchableOpacity onPress={close}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {step === 1 && (
            <>
              <Text style={styles.hint}>Enter your account email to receive a verification code.</Text>
              <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              <Btn label="Send code" loading={loading} onPress={doSendOtp} />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.hint}>Enter the 6-digit code sent to {email}.</Text>
              <Field label="Verification code" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
              <Btn label="Verify" loading={loading} onPress={doVerifyOtp} />
              <Text style={styles.resend} onPress={doSendOtp}>Resend code</Text>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.hint}>Choose a new password.</Text>
              <Field label="New password" value={password} onChangeText={setPassword} secureTextEntry />
              <Btn label="Change password" loading={loading} onPress={doChangePass} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const Btn = ({ label, loading, onPress }) => (
  <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={onPress} disabled={loading}>
    {loading ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.btnTxt}>{label}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 22, paddingBottom: 34, gap: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: font.bold, fontSize: 18, color: colors.text },
  hint: { fontFamily: font.regular, fontSize: 13, color: colors.textDim, lineHeight: 19 },
  btn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnTxt: { fontFamily: font.semibold, fontSize: 14, color: colors.onAccent },
  resend: { fontFamily: font.medium, fontSize: 12, color: colors.accent, textAlign: 'center' },
});
