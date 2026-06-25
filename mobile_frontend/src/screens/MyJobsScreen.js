import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { font, radius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { logoFor } from '../assets';
import { AppContext } from '../context/AppContext';
import JobCard from '../components/JobCard';
import { getAllJobs } from '../services/jobService';
import { pkgText, timeAgo } from '../utils/format';

const STATUS_STYLE = (colors, st) => {
  switch (st) {
    case 'OFFERED':
      return { color: colors.success, bg: 'rgba(52,211,153,0.12)', label: 'Offered' };
    case 'INTERVIEWING':
      return { color: colors.accent, bg: 'rgba(255,189,32,0.12)', label: 'Interviewing' };
    case 'REJECTED':
      return { color: colors.danger, bg: 'rgba(248,113,113,0.12)', label: 'Rejected' };
    default:
      return { color: colors.textDim, bg: colors.cardAlt, label: 'Applied' };
  }
};

export default function MyJobsScreen({ navigation }) {
  const { user, savedJobs, historyTab, setHistoryTab } = useContext(AppContext);
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setAllJobs((await getAllJobs()) || []);
    } catch {
      setAllJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Applied = jobs where this user appears in applicants (with their status & timestamp).
  const applied = allJobs
    .map((job) => {
      const mine = (job.applicants || []).find((a) => a.applicantId === user?.id);
      return mine ? { job, app: mine } : null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.app.timestamp || 0).getTime() - new Date(a.app.timestamp || 0).getTime());

  const savedList = allJobs.filter((j) => savedJobs.includes(j.id));
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />}
      >
        <Text style={styles.title}>My Jobs</Text>

        <View style={styles.tabs}>
          <Tab value="applied" label={`Applied (${applied.length})`} />
          <Tab value="saved" label={`Saved (${savedList.length})`} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 28 }} />
        ) : showApplied ? (
          applied.length > 0 ? (
            <View style={{ gap: 13, marginTop: 18 }}>
              {applied.map(({ job, app }) => {
                const st = STATUS_STYLE(colors, app.applicationStatus);
                return (
                  <TouchableOpacity key={job.id} activeOpacity={0.85} style={styles.appliedCard} onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}>
                    <View style={styles.appliedTop}>
                      <View style={styles.appliedLeft}>
                        <View style={styles.logoBox}>
                          <Image source={logoFor(job.company)} style={styles.logo} resizeMode="contain" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.appliedTitle} numberOfLines={1}>{job.jobTitle}</Text>
                          <Text style={styles.appliedSub} numberOfLines={1}>{job.company} • {job.location}</Text>
                        </View>
                      </View>
                      <Text style={[styles.badge, { color: st.color, backgroundColor: st.bg }]}>{st.label}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.appliedFooter}>
                      <Text style={styles.appliedDate}>Applied {timeAgo(app.timestamp)}</Text>
                      <Text style={styles.appliedPkg}>{pkgText(job)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color="#5d5d5d" />
              <Text style={styles.emptyTitle}>No applications yet</Text>
              <Text style={styles.emptySub}>Apply to jobs to track them here</Text>
            </View>
          )
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

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 10 },
  title: { fontFamily: font.bold, fontSize: 22, color: colors.text, paddingTop: 6 },
  tabs: { flexDirection: 'row', gap: 8, backgroundColor: colors.card, borderRadius: radius.md, padding: 5, marginTop: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabTxt: { fontFamily: font.semibold, fontSize: 13 },
  appliedCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 15, borderWidth: 1, borderColor: colors.borderSoft, gap: 11 },
  appliedTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  appliedLeft: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  logoBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 7 },
  logo: { width: '100%', height: '100%' },
  appliedTitle: { fontFamily: font.semibold, fontSize: 14, color: colors.text },
  appliedSub: { fontFamily: font.regular, fontSize: 11, color: colors.muted },
  badge: { fontFamily: font.semibold, fontSize: 10.5, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 7, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border },
  appliedFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appliedDate: { fontFamily: font.regular, fontSize: 12, color: colors.muted },
  appliedPkg: { fontFamily: font.semibold, fontSize: 13, color: colors.textDim },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 70 },
  emptyTitle: { fontFamily: font.medium, fontSize: 15, color: colors.textDim, marginTop: 14 },
  emptySub: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
});
