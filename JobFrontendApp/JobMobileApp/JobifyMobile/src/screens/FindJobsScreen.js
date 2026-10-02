import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { JOBS } from '../data/jobs';
import JobCard from '../components/JobCard';

const FILTERS = ['All', 'Full-Time', 'Remote', 'Entry Level'];

export default function FindJobsScreen({ navigation }) {
  const [active, setActive] = useState('All');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Find Jobs</Text>

        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <TextInput placeholder="Designer, Developer..." placeholderTextColor={colors.muted} style={styles.input} />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={colors.onAccent} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => {
            const on = active === f;
            return (
              <TouchableOpacity key={f} onPress={() => setActive(f)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                <Text style={[styles.chipTxt, { color: on ? colors.onAccent : '#d1d1d1' }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.metaRow}>
          <Text style={styles.count}>{JOBS.length} jobs found</Text>
          <View style={styles.sort}>
            <Text style={styles.sortTxt}>Sort: Relevance</Text>
            <Ionicons name="chevron-down" size={14} color="#d1d1d1" />
          </View>
        </View>

        <View style={{ gap: 14 }}>
          {JOBS.map((job) => (
            <JobCard key={job.id} job={job} onPress={() => navigation.navigate('JobDetail', { jobId: job.id })} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 10 },
  title: { fontFamily: font.bold, fontSize: 22, color: colors.text, paddingTop: 6 },
  searchRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, color: colors.text, fontFamily: font.regular, fontSize: 13, padding: 0 },
  filterBtn: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: 8, marginTop: 14, paddingBottom: 2 },
  chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: radius.pill },
  chipOn: { backgroundColor: colors.accent },
  chipOff: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderSoft },
  chipTxt: { fontFamily: font.medium, fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 14 },
  count: { fontFamily: font.regular, fontSize: 13, color: colors.muted },
  sort: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortTxt: { fontFamily: font.regular, fontSize: 12, color: '#d1d1d1' },
});
