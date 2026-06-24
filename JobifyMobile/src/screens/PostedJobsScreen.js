import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { JOBS, agoText } from '../data/jobs';
import { logoFor } from '../assets';

export default function PostedJobsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <Text style={styles.title}>Posted Jobs</Text>

        <View style={{ gap: 14, marginTop: 18 }}>
          {JOBS.map((job) => (
            <TouchableOpacity key={job.id} activeOpacity={0.85} style={styles.card} onPress={() => navigation.navigate('PostedDetail', { jobId: job.id })}>
              <View style={styles.top}>
                <View style={styles.left}>
                  <View style={styles.logoBox}>
                    <Image source={logoFor(job.company)} style={styles.logo} resizeMode="contain" />
                  </View>
                  <View>
                    <Text style={styles.name}>{job.jobTitle}</Text>
                    <Text style={styles.sub}>{job.location} • {job.jobType}</Text>
                  </View>
                </View>
                <Text style={styles.badge}>Active</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.footer}>
                <View style={styles.applicants}>
                  <Ionicons name="people-outline" size={16} color={colors.accent} />
                  <Text style={styles.applicantsTxt}>
                    <Text style={{ color: colors.accent, fontFamily: font.semibold }}>{job.applicants}</Text> applicants
                  </Text>
                </View>
                <Text style={styles.posted}>Posted {agoText(job)}</Text>
              </View>
            </TouchableOpacity>
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
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.borderSoft },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logoBox: { width: 42, height: 42, borderRadius: 11, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 7 },
  logo: { width: '100%', height: '100%' },
  name: { fontFamily: font.semibold, fontSize: 15, color: colors.text },
  sub: { fontFamily: font.regular, fontSize: 11, color: colors.muted },
  badge: { fontFamily: font.semibold, fontSize: 10.5, color: colors.success, backgroundColor: 'rgba(52,211,153,0.12)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 7, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 13 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  applicants: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  applicantsTxt: { fontFamily: font.regular, fontSize: 12.5, color: '#d1d1d1' },
  posted: { fontFamily: font.regular, fontSize: 11, color: colors.muted },
});
