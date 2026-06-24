import React, { useContext } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { JOBS, APPLIED, jobById, statusStyle } from '../data/jobs';
import { logoFor } from '../assets';
import { AppContext } from '../context/AppContext';
import JobCard from '../components/JobCard';

export default function MyJobsScreen({ navigation }) {
  const { savedJobs, historyTab, setHistoryTab } = useContext(AppContext);
  const savedList = JOBS.filter((j) => savedJobs.includes(j.id));
  const showApplied = historyTab === 'applied';

  const Tab = ({ value, label }) => {
    const on = historyTab === value;
    return (
      <TouchableOpacity style={[styles.tab, { backgroundColor: on ? colors.accent : 'transparent' }]} onPress={() => setHistoryTab(value)}>
        <Text style={[styles.tabTxt, { color: on ? colors.onAccent : colors.textDim }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <Text style={styles.title}>My Jobs</Text>

        <View style={styles.tabs}>
          <Tab value="applied" label={`Applied (${APPLIED.length})`} />
          <Tab value="saved" label={`Saved (${savedList.length})`} />
        </View>

        {showApplied ? (
          <View style={{ gap: 13, marginTop: 18 }}>
            {APPLIED.map((a) => {
              const job = jobById(a.jobId);
              const st = statusStyle(a.status);
              return (
                <TouchableOpacity key={a.jobId} activeOpacity={0.85} style={styles.appliedCard} onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}>
                  <View style={styles.appliedTop}>
                    <View style={styles.appliedLeft}>
                      <View style={styles.logoBox}>
                        <Image source={logoFor(job.company)} style={styles.logo} resizeMode="contain" />
                      </View>
                      <View>
                        <Text style={styles.appliedTitle}>{job.jobTitle}</Text>
                        <Text style={styles.appliedSub}>{job.company} • {job.location}</Text>
                      </View>
                    </View>
                    <Text style={[styles.badge, { color: st.color, backgroundColor: st.bg }]}>{a.status}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.appliedFooter}>
                    <Text style={styles.appliedDate}>Applied {a.date}</Text>
                    <Text style={styles.appliedPkg}>₹{job.pkg}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : savedList.length > 0 ? (
          <View style={{ gap: 14, marginTop: 18 }}>
            {savedList.map((job) => (
              <JobCard key={job.id} job={job} onPress={() => navigation.navigate('JobDetail', { jobId: job.id })} />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={48} color="#5d5d5d" />
            <Text style={styles.emptyTitle}>No saved jobs yet</Text>
            <Text style={styles.emptySub}>Bookmark jobs to find them here</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 10 },
  title: { fontFamily: font.bold, fontSize: 22, color: colors.text, paddingTop: 6 },
  tabs: { flexDirection: 'row', gap: 8, backgroundColor: colors.card, borderRadius: radius.md, padding: 5, marginTop: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabTxt: { fontFamily: font.semibold, fontSize: 13 },
  appliedCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 15, borderWidth: 1, borderColor: colors.borderSoft, gap: 11 },
  appliedTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appliedLeft: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logoBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 7 },
  logo: { width: '100%', height: '100%' },
  appliedTitle: { fontFamily: font.semibold, fontSize: 14, color: colors.text },
  appliedSub: { fontFamily: font.regular, fontSize: 11, color: colors.muted },
  badge: { fontFamily: font.semibold, fontSize: 10.5, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 7, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border },
  appliedFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appliedDate: { fontFamily: font.regular, fontSize: 12, color: colors.muted },
  appliedPkg: { fontFamily: font.semibold, fontSize: 13, color: '#d1d1d1' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 70 },
  emptyTitle: { fontFamily: font.medium, fontSize: 15, color: colors.textDim, marginTop: 14 },
  emptySub: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
});
