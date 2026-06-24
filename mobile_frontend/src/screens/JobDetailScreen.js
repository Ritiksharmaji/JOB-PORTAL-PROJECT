import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { logoFor } from '../assets';
import { AppContext } from '../context/AppContext';
import Tag from '../components/Tag';
import { getJob } from '../services/jobService';
import { pkgText, postedAgo, stripHtml } from '../utils/format';

const InfoCard = ({ icon, label, value }) => (
  <View style={styles.info}>
    <Ionicons name={icon} size={22} color={colors.accent} />
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

export default function JobDetailScreen({ route, navigation }) {
  const jobId = route.params?.jobId;
  const { savedJobs, toggleSave, user } = useContext(AppContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setJob(await getJob(jobId));
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

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
        <Text style={styles.notFound}>Job not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 14 }}>
          <Text style={{ color: colors.accent, fontFamily: font.semibold }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const saved = savedJobs.includes(job.id);
  const applied = (job.applicants || []).some((a) => a.applicantId === user?.id);
  const description = stripHtml(job.description);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => toggleSave(job.id)}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={19} color={saved ? colors.accent : colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Image source={logoFor(job.company)} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.title}>{job.jobTitle}</Text>
          <Text style={styles.meta}>{job.company} • {job.location} • {postedAgo(job)}</Text>
          <TouchableOpacity style={styles.companyLink} onPress={() => navigation.navigate('Company', { company: job.company })}>
            <Text style={styles.companyLinkTxt}>View company profile</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <InfoCard icon="location-outline" label="Location" value={job.location} />
          <InfoCard icon="briefcase-outline" label="Experience" value={job.experience} />
          <InfoCard icon="cash-outline" label="Salary" value={pkgText(job)} />
          <InfoCard icon="time-outline" label="Job Type" value={job.jobType} />
        </View>

        {(job.skillsRequired || []).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skillRow}>
              {job.skillsRequired.map((s) => <Tag key={s}>{s}</Tag>)}
            </View>
          </>
        )}

        {!!job.about && (
          <>
            <Text style={styles.sectionTitle}>About the job</Text>
            <Text style={styles.para}>{job.about}</Text>
          </>
        )}

        {!!description && (
          <>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.para}>{description}</Text>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={() => toggleSave(job.id)}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.accent} />
        </TouchableOpacity>
        {applied ? (
          <View style={[styles.applyBtn, styles.appliedBtn]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.appliedTxt}>Applied</Text>
          </View>
        ) : (
          <TouchableOpacity activeOpacity={0.85} style={styles.applyBtn} onPress={() => navigation.navigate('Apply', { jobId: job.id })}>
            <Text style={styles.applyTxt}>Apply Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  notFound: { fontFamily: font.medium, fontSize: 15, color: colors.textDim },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 20, paddingBottom: 24 },
  hero: { alignItems: 'center', paddingTop: 8 },
  logoBox: { width: 74, height: 74, borderRadius: radius.xl, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 14 },
  logo: { width: '100%', height: '100%' },
  title: { fontFamily: font.bold, fontSize: 21, color: colors.text, marginTop: 14, textAlign: 'center' },
  meta: { fontFamily: font.regular, fontSize: 13, color: colors.textDim, marginTop: 5 },
  companyLink: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 13 },
  companyLinkTxt: { fontFamily: font.semibold, fontSize: 12, color: colors.accent },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 22 },
  info: { width: '47%', flexGrow: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  infoLabel: { fontFamily: font.regular, fontSize: 10, color: colors.muted },
  infoValue: { fontFamily: font.semibold, fontSize: 13, color: colors.text },
  sectionTitle: { fontFamily: font.semibold, fontSize: 16, color: colors.text, marginTop: 24, marginBottom: 12 },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  para: { fontFamily: font.regular, fontSize: 13, lineHeight: 22, color: colors.textDim },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1, borderTopColor: '#3d3d3d' },
  saveBtn: { width: 52, height: 50, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  applyBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  applyTxt: { fontFamily: font.semibold, fontSize: 15, color: colors.onAccent },
  appliedBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  appliedTxt: { fontFamily: font.semibold, fontSize: 15, color: colors.success },
});
