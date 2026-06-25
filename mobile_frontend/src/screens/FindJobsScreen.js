import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { font, radius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import JobCard from '../components/JobCard';
import { getAllJobs } from '../services/jobService';

const FILTERS = ['All', 'Full-Time', 'Remote', 'Entry Level'];
const SORTS = ['Most Recent', 'Salary: High to Low', 'Salary: Low to High'];

export default function FindJobsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState('All');
  const [sortIdx, setSortIdx] = useState(0);

  const load = useCallback(async () => {
    try {
      const all = await getAllJobs();
      setAllJobs((all || []).filter((j) => j.jobStatus === 'ACTIVE'));
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

  const jobs = useMemo(() => {
    let list = [...allJobs];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (j) =>
          j.jobTitle?.toLowerCase().includes(q) ||
          j.company?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q) ||
          (j.skillsRequired || []).some((s) => s.toLowerCase().includes(q))
      );
    }
    if (chip === 'Full-Time') list = list.filter((j) => j.jobType === 'Full-Time' || j.jobType === 'Full Time');
    else if (chip === 'Remote') list = list.filter((j) => j.location === 'Remote');
    else if (chip === 'Entry Level') list = list.filter((j) => j.experience === 'Entry Level');

    const sort = SORTS[sortIdx];
    if (sort === 'Salary: High to Low') list.sort((a, b) => (b.packageOffered || 0) - (a.packageOffered || 0));
    else if (sort === 'Salary: Low to High') list.sort((a, b) => (a.packageOffered || 0) - (b.packageOffered || 0));
    else list.sort((a, b) => new Date(b.postTime).getTime() - new Date(a.postTime).getTime());
    return list;
  }, [allJobs, query, chip, sortIdx]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />}
      >
        <Text style={styles.title}>Find Jobs</Text>

        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <TextInput
              placeholder="Designer, Developer, company..."
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={query}
              onChangeText={setQuery}
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => {
            const on = chip === f;
            return (
              <TouchableOpacity key={f} onPress={() => setChip(f)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                <Text style={[styles.chipTxt, { color: on ? colors.onAccent : colors.textDim }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.metaRow}>
          <Text style={styles.count}>{jobs.length} jobs found</Text>
          <TouchableOpacity style={styles.sort} onPress={() => setSortIdx((i) => (i + 1) % SORTS.length)}>
            <Text style={styles.sortTxt}>Sort: {SORTS[sortIdx]}</Text>
            <Ionicons name="swap-vertical" size={14} color={colors.textDim} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 28 }} />
        ) : jobs.length === 0 ? (
          <Text style={styles.empty}>No jobs match your search.</Text>
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

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 10 },
  title: { fontFamily: font.bold, fontSize: 22, color: colors.text, paddingTop: 6 },
  searchRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, color: colors.text, fontFamily: font.regular, fontSize: 13, padding: 0 },
  chips: { gap: 8, marginTop: 14, paddingBottom: 2 },
  chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: radius.pill },
  chipOn: { backgroundColor: colors.accent },
  chipOff: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderSoft },
  chipTxt: { fontFamily: font.medium, fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 14 },
  count: { fontFamily: font.regular, fontSize: 13, color: colors.muted },
  sort: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortTxt: { fontFamily: font.regular, fontSize: 12, color: colors.textDim },
  empty: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 24, textAlign: 'center' },
});
