import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { jobById } from '../data/jobs';
import { APPLICANT_PROFILE } from '../data/profile';
import { logoFor } from '../assets';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';

export default function ApplyScreen({ route, navigation }) {
  const job = jobById(route.params?.jobId ?? 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Apply for job" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.jobRow}>
          <View style={styles.logoBox}>
            <Image source={logoFor(job.company)} style={styles.logo} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.jobTitle}>{job.jobTitle}</Text>
            <Text style={styles.jobSub}>{job.company} • {job.location}</Text>
          </View>
        </View>

        <View style={{ gap: 15, marginTop: 20 }}>
          <Field label="Full name" defaultValue={APPLICANT_PROFILE.name} />
          <Field label="Email" defaultValue={APPLICANT_PROFILE.email} autoCapitalize="none" keyboardType="email-address" />
          <Field label="Phone number" defaultValue={APPLICANT_PROFILE.phone} keyboardType="phone-pad" />
          <Field label="Personal website" placeholder="https://" autoCapitalize="none" />

          <View>
            <Text style={styles.label}>Resume / CV</Text>
            <TouchableOpacity activeOpacity={0.8} style={styles.upload}>
              <Ionicons name="cloud-upload-outline" size={26} color={colors.accent} />
              <Text style={styles.uploadTitle}>Tap to upload your resume</Text>
              <Text style={styles.uploadHint}>PDF, DOCX up to 5MB</Text>
            </TouchableOpacity>
          </View>

          <Field label="Cover letter" placeholder="Why are you a great fit?" multiline />
        </View>

        <PrimaryButton title="Submit application" onPress={() => navigation.navigate('ApplySuccess', { jobId: job.id })} style={{ marginTop: 22 }} />
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
  upload: { borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.md, paddingVertical: 22, alignItems: 'center', gap: 8 },
  uploadTitle: { fontFamily: font.regular, fontSize: 13, color: '#d1d1d1' },
  uploadHint: { fontFamily: font.regular, fontSize: 11, color: colors.muted },
});
