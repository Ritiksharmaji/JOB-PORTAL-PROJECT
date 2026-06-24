import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { logoFor } from '../assets';
import ScreenHeader from '../components/ScreenHeader';
import JobCard from '../components/JobCard';
import { getAllJobs } from '../services/jobService';

const Stat = ({ value, label }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function CompanyScreen({ route, navigation }) {
  const companyName = route.params?.company;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllJobs();
        setJobs((all || []).filter((j) => j.company === companyName && j.jobStatus === 'ACTIVE'));
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [companyName]);

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants || []).length, 0);
  const locations = new Set(jobs.map((j) => j.location).filter(Boolean));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Company" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Image source={logoFor(companyName)} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.name}>{companyName}</Text>
          <Text style={styles.industry}>Hiring on Jobify</Text>
        </View>

        <View style={styles.stats}>
          <Stat value={jobs.length} label="Open jobs" />
          <View style={styles.statDivider} />
          <Stat value={totalApplicants} label="Applicants" />
          <View style={styles.statDivider} />
          <Stat value={locations.size || '—'} label="Locations" />
        </View>

        <Text style={styles.sectionTitle}>Open positions</Text>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 18 }} />
        ) : jobs.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={40} color="#5d5d5d" />
            <Text style={styles.emptyTxt}>No open positions right now.</Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onPress={() => navigation.navigate('JobDetail', { jobId: job.id })} />
            ))}
          </View>
        )}
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
  stats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 16, marginTop: 22 },
  stat: { alignItems: 'center' },
  statValue: { fontFamily: font.bold, fontSize: 17, color: colors.accent },
  statLabel: { fontFamily: font.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  sectionTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.text, marginTop: 22, marginBottom: 11 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTxt: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 12 },
});
