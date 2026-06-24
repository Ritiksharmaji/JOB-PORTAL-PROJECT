import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius } from '../theme';
import { COMPANY } from '../data/profile';
import { JOBS } from '../data/jobs';
import { logoFor } from '../assets';
import ScreenHeader from '../components/ScreenHeader';
import Tag from '../components/Tag';
import JobCard from '../components/JobCard';

const Stat = ({ value, label }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Row = ({ label, value, accent, last }) => (
  <View style={[styles.detailRow, !last && styles.detailBorder]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, accent && { color: colors.accent }]}>{value}</Text>
  </View>
);

export default function CompanyScreen({ route, navigation }) {
  const companyName = route.params?.company || COMPANY.name;
  const openJobs = JOBS.filter((j) => j.company === companyName).slice(0, 3);
  const jobsToShow = openJobs.length ? openJobs : JOBS.filter((j) => j.company === 'Google');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Company" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Image source={logoFor(companyName)} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.name}>{companyName}</Text>
          <Text style={styles.industry}>{COMPANY.industry}</Text>
          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.follow}><Text style={styles.followTxt}>Follow</Text></TouchableOpacity>
            <TouchableOpacity style={styles.website}><Text style={styles.websiteTxt}>Website</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat value={COMPANY.size.replace(',000', 'K')} label="Employees" />
          <View style={styles.statDivider} />
          <Stat value={COMPANY.openJobs} label="Open jobs" />
          <View style={styles.statDivider} />
          <Stat value={COMPANY.rating} label="Rating" />
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.para}>{COMPANY.overview}</Text>

        <View style={{ marginTop: 18 }}>
          <Row label="Headquarters" value={COMPANY.hq} />
          <Row label="Company size" value={COMPANY.size} />
          <Row label="Website" value={COMPANY.website} accent last />
        </View>

        <Text style={styles.sectionTitle}>Specialties</Text>
        <View style={styles.skillRow}>
          {COMPANY.specialties.map((s) => <Tag key={s}>{s}</Tag>)}
        </View>

        <Text style={styles.sectionTitle}>Open positions</Text>
        <View style={{ gap: 14 }}>
          {jobsToShow.map((job) => (
            <JobCard key={job.id} job={job} onPress={() => navigation.navigate('JobDetail', { jobId: job.id })} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 28 },
  hero: { alignItems: 'center', paddingTop: 6 },
  logoBox: { width: 74, height: 74, borderRadius: radius.xl, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 14 },
  logo: { width: '100%', height: '100%' },
  name: { fontFamily: font.bold, fontSize: 21, color: colors.text, marginTop: 13 },
  industry: { fontFamily: font.regular, fontSize: 12.5, color: colors.textDim, marginTop: 4, textAlign: 'center' },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 16, alignSelf: 'stretch' },
  follow: { flex: 1, backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
  followTxt: { fontFamily: font.semibold, fontSize: 13, color: colors.onAccent },
  website: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
  websiteTxt: { fontFamily: font.semibold, fontSize: 13, color: colors.text },
  stats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 16, marginTop: 22 },
  stat: { alignItems: 'center' },
  statValue: { fontFamily: font.bold, fontSize: 17, color: colors.accent },
  statLabel: { fontFamily: font.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  sectionTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.text, marginTop: 22, marginBottom: 11 },
  para: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 21, color: colors.textDim },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9 },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: colors.card },
  detailLabel: { fontFamily: font.regular, fontSize: 12.5, color: colors.muted },
  detailValue: { fontFamily: font.medium, fontSize: 12.5, color: '#d1d1d1' },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
