import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors, font, radius } from '../theme';
import { logoFor } from '../assets';
import { AppContext } from '../context/AppContext';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import { getJob, applyJob } from '../services/jobService';
import { fileToBase64 } from '../utils/format';
import { errMessage } from '../api/client';

export default function ApplyScreen({ route, navigation }) {
  const jobId = route.params?.jobId;
  const { user } = useContext(AppContext);
  const [job, setJob] = useState(null);
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null); // { name, base64 }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setJob(await getJob(jobId));
      } catch {
        setJob(null);
      }
    })();
  }, [jobId]);

  const pickResume = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      const base64 = await fileToBase64(asset.uri);
      setResume({ name: asset.name, base64 });
    } catch (e) {
      Alert.alert('Could not read file', errMessage(e));
    }
  };

  const submit = async () => {
    if (!phone.trim()) return Alert.alert('Phone required', 'Please enter a phone number.');
    if (!resume) return Alert.alert('Resume required', 'Please upload your resume (PDF/DOC).');
    setSubmitting(true);
    try {
      const application = {
        applicantId: user?.id,
        name: user?.name,
        email: user?.email,
        phone: Number(phone.replace(/\D/g, '')) || 0,
        website: website.trim(),
        resume: resume.base64,
        coverLetter: coverLetter.trim(),
      };
      await applyJob(jobId, application);
      navigation.replace('ApplySuccess', { jobId });
    } catch (e) {
      Alert.alert('Application failed', errMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Apply for job" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {job && (
          <View style={styles.jobRow}>
            <View style={styles.logoBox}>
              <Image source={logoFor(job.company)} style={styles.logo} resizeMode="contain" />
            </View>
            <View>
              <Text style={styles.jobTitle}>{job.jobTitle}</Text>
              <Text style={styles.jobSub}>{job.company} • {job.location}</Text>
            </View>
          </View>
        )}

        <View style={{ gap: 15, marginTop: 20 }}>
          <Field label="Full name" value={user?.name || ''} editable={false} inputStyle={styles.readonly} />
          <Field label="Email" value={user?.email || ''} editable={false} inputStyle={styles.readonly} />
          <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="9876543210" />
          <Field label="Personal website" value={website} onChangeText={setWebsite} placeholder="https://" autoCapitalize="none" />

          <View>
            <Text style={styles.label}>Resume / CV</Text>
            <TouchableOpacity activeOpacity={0.8} style={styles.upload} onPress={pickResume}>
              <Ionicons name={resume ? 'document-text' : 'cloud-upload-outline'} size={26} color={colors.accent} />
              <Text style={styles.uploadTitle}>{resume ? resume.name : 'Tap to upload your resume'}</Text>
              <Text style={styles.uploadHint}>{resume ? 'Tap to replace' : 'PDF, DOC up to 5MB'}</Text>
            </TouchableOpacity>
          </View>

          <Field label="Cover letter" value={coverLetter} onChangeText={setCoverLetter} placeholder="Why are you a great fit?" multiline />
        </View>

        {submitting ? (
          <View style={styles.submitting}><ActivityIndicator color={colors.onAccent} /></View>
        ) : (
          <PrimaryButton title="Submit application" onPress={submit} style={{ marginTop: 22 }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 30 },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.lg, padding: 13 },
  logoBox: { width: 44, height: 44, borderRadius: 11, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 8 },
  logo: { width: '100%', height: '100%' },
  jobTitle: { fontFamily: font.semibold, fontSize: 14, color: colors.text },
  jobSub: { fontFamily: font.regular, fontSize: 12, color: colors.muted },
  label: { fontFamily: font.regular, fontSize: 12, color: colors.textDim, marginBottom: 7 },
  readonly: { color: colors.muted },
  upload: { borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.md, paddingVertical: 22, alignItems: 'center', gap: 8 },
  uploadTitle: { fontFamily: font.regular, fontSize: 13, color: '#d1d1d1', paddingHorizontal: 16, textAlign: 'center' },
  uploadHint: { fontFamily: font.regular, fontSize: 11, color: colors.muted },
  submitting: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 22 },
});
