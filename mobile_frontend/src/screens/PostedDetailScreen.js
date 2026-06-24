import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { logoFor } from '../assets';
import ScreenHeader from '../components/ScreenHeader';
import { getJob, changeAppStatus, postJob } from '../services/jobService';
import { initials, timeAgo } from '../utils/format';
import { errMessage } from '../api/client';

const TABS = [
  { key: 'APPLIED', label: 'Applicants' },
  { key: 'INTERVIEWING', label: 'Invited' },
  { key: 'OFFERED', label: 'Offered' },
  { key: 'REJECTED', label: 'Rejected' },
];

// LocalDateTime string the backend accepts, e.g. 2026-06-27T10:00:00
const defaultInterviewTime = () => {
  const d = new Date(Date.now() + 3 * 86400000);
  d.setHours(10, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
};

export default function PostedDetailScreen({ route, navigation }) {
  const jobId = route.params?.jobId;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('APPLIED');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      setJob(await getJob(jobId));
    } catch {
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (applicant, applicationStatus) => {
    setBusyId(applicant.applicantId + applicationStatus);
    try {
      const payload = { id: jobId, applicantId: applicant.applicantId, applicationStatus };
      if (applicationStatus === 'INTERVIEWING') payload.interviewTime = defaultInterviewTime();
      await changeAppStatus(payload);
      await load();
    } catch (e) {
      Alert.alert('Action failed', errMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const closeJob = () => {
    Alert.alert('Close job', 'Stop accepting applications for this job?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: async () => {
          try {
            await postJob({ ...job, jobStatus: 'CLOSED' });
            await load();
          } catch (e) {
            Alert.alert('Could not close', errMessage(e));
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={['top', 'bottom']}>
        <ActivityIndicator color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }
  if (!job) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={['top', 'bottom']}>
        <Text style={styles.muted}>Job not found.</Text>
      </SafeAreaView>
    );
  }

  const all = job.applicants || [];
  const counts = TABS.reduce((acc, t) => ({ ...acc, [t.key]: all.filter((a) => (a.applicationStatus || 'APPLIED') === t.key).length }), {});
  const list = all.filter((a) => (a.applicationStatus || 'APPLIED') === tab);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Applicants"
        onBack={() => navigation.goBack()}
        right={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.hBtn} onPress={() => navigation.navigate('PostJob', { jobId })}>
              <Ionicons name="create-outline" size={18} color={colors.text} />
            </TouchableOpacity>
            {job.jobStatus !== 'CLOSED' && (
              <TouchableOpacity style={styles.hBtn} onPress={closeJob}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.jobRow}>
          <View style={styles.logoBox}>
            <Image source={logoFor(job.company)} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle} numberOfLines={1}>{job.jobTitle}</Text>
            <Text style={styles.jobSub}>{job.company} • {all.length} applicants</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((t) => {
            const on = tab === t.key;
            return (
              <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, on ? styles.tabOn : styles.tabOff]}>
                <Text style={[styles.tabTxt, { color: on ? colors.onAccent : '#d1d1d1' }]}>{t.label} ({counts[t.key] || 0})</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {list.length === 0 ? (
          <Text style={styles.empty}>No candidates in this stage.</Text>
        ) : (
          <View style={{ gap: 13, marginTop: 16 }}>
            {list.map((a) => (
              <View key={a.applicantId} style={styles.card}>
                <View style={styles.top}>
                  <View style={styles.avatar}><Text style={styles.avatarTxt}>{initials(a.name)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>{a.name || 'Applicant'}</Text>
                    <Text style={styles.role} numberOfLines={1}>{a.email}</Text>
                  </View>
                  {a.timestamp ? <Text style={styles.ago}>{timeAgo(a.timestamp)}</Text> : null}
                </View>

                {!!a.coverLetter && <Text style={styles.cover} numberOfLines={3}>{a.coverLetter}</Text>}
                {!!a.website && (
                  <Text style={styles.website} numberOfLines={1}>{a.website}</Text>
                )}

                <View style={styles.actions}>
                  {tab !== 'INTERVIEWING' && (
                    <ActBtn label="Interview" busy={busyId === a.applicantId + 'INTERVIEWING'} onPress={() => act(a, 'INTERVIEWING')} />
                  )}
                  {tab !== 'OFFERED' && (
                    <ActBtn label="Offer" primary busy={busyId === a.applicantId + 'OFFERED'} onPress={() => act(a, 'OFFERED')} />
                  )}
                  {tab !== 'REJECTED' && (
                    <ActBtn label="Reject" danger busy={busyId === a.applicantId + 'REJECTED'} onPress={() => act(a, 'REJECTED')} />
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const ActBtn = ({ label, onPress, busy, primary, danger }) => (
  <TouchableOpacity
    style={[styles.actBtn, primary && styles.actPrimary, danger && styles.actDanger]}
    onPress={onPress}
    disabled={busy}
  >
    {busy ? (
      <ActivityIndicator size="small" color={primary ? colors.onAccent : colors.text} />
    ) : (
      <Text style={[styles.actTxt, primary && { color: colors.onAccent }, danger && { color: colors.danger }]}>{label}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { fontFamily: font.medium, fontSize: 15, color: colors.textDim },
  body: { paddingHorizontal: 20, paddingBottom: 30 },
  hBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.md, padding: 14 },
  logoBox: { width: 46, height: 46, borderRadius: 11, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 8 },
  logo: { width: '100%', height: '100%' },
  jobTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.text },
  jobSub: { fontFamily: font.regular, fontSize: 12, color: colors.muted },
  tabs: { gap: 8, marginTop: 16 },
  tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill },
  tabOn: { backgroundColor: colors.accent },
  tabOff: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderSoft },
  tabTxt: { fontFamily: font.medium, fontSize: 12 },
  empty: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 24, textAlign: 'center' },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.borderSoft },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: font.bold, fontSize: 15, color: colors.accent },
  name: { fontFamily: font.semibold, fontSize: 14, color: colors.text },
  role: { fontFamily: font.regular, fontSize: 11.5, color: colors.muted },
  ago: { fontFamily: font.regular, fontSize: 10.5, color: colors.muted },
  cover: { fontFamily: font.regular, fontSize: 12, lineHeight: 19, color: colors.textDim, marginTop: 11 },
  website: { fontFamily: font.regular, fontSize: 12, color: colors.accent, marginTop: 7 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 13 },
  actBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center', backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  actPrimary: { backgroundColor: colors.accent, borderColor: colors.accent },
  actDanger: { backgroundColor: 'transparent', borderColor: colors.danger },
  actTxt: { fontFamily: font.semibold, fontSize: 12, color: colors.text },
});
