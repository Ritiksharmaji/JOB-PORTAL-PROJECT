import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { logoFor } from '../assets';
import { AppContext } from '../context/AppContext';
import { getJobsPostedBy } from '../services/jobService';
import { postedAgo } from '../utils/format';

const TABS = ['ACTIVE', 'DRAFT', 'CLOSED'];
const STATUS_COLOR = {
  ACTIVE: { color: colors.success, bg: 'rgba(52,211,153,0.12)' },
  DRAFT: { color: colors.accent, bg: 'rgba(255,189,32,0.12)' },
  CLOSED: { color: colors.danger, bg: 'rgba(248,113,113,0.12)' },
};

export default function PostedJobsScreen({ navigation }) {
  const { user } = useContext(AppContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ACTIVE');

  const load = useCallback(async () => {
    if (user?.id == null) return;
    try {
      setJobs((await getJobsPostedBy(user.id)) || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const counts = TABS.reduce((acc, t) => ({ ...acc, [t]: jobs.filter((j) => j.jobStatus === t).length }), {});
  const list = jobs.filter((j) => j.jobStatus === tab);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>Posted Jobs</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('PostJob')}>
            <Ionicons name="add" size={18} color={colors.onAccent} />
            <Text style={styles.newTxt}>New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          {TABS.map((t) => {
            const on = tab === t;
            return (
              <TouchableOpacity key={t} style={[styles.tab, on && styles.tabOn]} onPress={() => setTab(t)}>
                <Text style={[styles.tabTxt, { color: on ? colors.onAccent : colors.textDim }]}>
                  {t.charAt(0) + t.slice(1).toLowerCase()} ({counts[t] || 0})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 28 }} />
        ) : list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={46} color="#5d5d5d" />
            <Text style={styles.emptyTitle}>No {tab.toLowerCase()} jobs</Text>
          </View>
        ) : (
          <View style={{ gap: 14, marginTop: 18 }}>
            {list.map((job) => {
              const sc = STATUS_COLOR[job.jobStatus] || STATUS_COLOR.ACTIVE;
              return (
                <TouchableOpacity key={job.id} activeOpacity={0.85} style={styles.card} onPress={() => navigation.navigate('PostedDetail', { jobId: job.id })}>
                  <View style={styles.top}>
                    <View style={styles.left}>
                      <View style={styles.logoBox}>
                        <Image source={logoFor(job.company)} style={styles.logo} resizeMode="contain" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name} numberOfLines={1}>{job.jobTitle}</Text>
                        <Text style={styles.sub} numberOfLines={1}>{job.location} • {job.jobType}</Text>
                      </View>
                    </View>
                    <Text style={[styles.badge, { color: sc.color, backgroundColor: sc.bg }]}>
                      {job.jobStatus.charAt(0) + job.jobStatus.slice(1).toLowerCase()}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.footer}>
                    <View style={styles.applicants}>
                      <Ionicons name="people-outline" size={16} color={colors.accent} />
                      <Text style={styles.applicantsTxt}>
                        <Text style={{ color: colors.accent, fontFamily: font.semibold }}>{(job.applicants || []).length}</Text> applicants
                      </Text>
                    </View>
                    <Text style={styles.posted}>Posted {postedAgo(job)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 },
  title: { fontFamily: font.bold, fontSize: 22, color: colors.text },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accent, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill },
  newTxt: { fontFamily: font.semibold, fontSize: 12, color: colors.onAccent },
  tabs: { flexDirection: 'row', gap: 8, backgroundColor: colors.card, borderRadius: radius.md, padding: 5, marginTop: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabOn: { backgroundColor: colors.accent },
  tabTxt: { fontFamily: font.semibold, fontSize: 11.5 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.borderSoft },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  logoBox: { width: 42, height: 42, borderRadius: 11, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 7 },
  logo: { width: '100%', height: '100%' },
  name: { fontFamily: font.semibold, fontSize: 15, color: colors.text },
  sub: { fontFamily: font.regular, fontSize: 11, color: colors.muted },
  badge: { fontFamily: font.semibold, fontSize: 10.5, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 7, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 13 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  applicants: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  applicantsTxt: { fontFamily: font.regular, fontSize: 12.5, color: '#d1d1d1' },
  posted: { fontFamily: font.regular, fontSize: 11, color: colors.muted },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 70 },
  emptyTitle: { fontFamily: font.medium, fontSize: 15, color: colors.textDim, marginTop: 14 },
});
