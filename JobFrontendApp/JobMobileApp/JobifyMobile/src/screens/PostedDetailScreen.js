import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius } from '../theme';
import { jobById, statusStyle } from '../data/jobs';
import { APPLICANTS, talentById } from '../data/talents';
import { logoFor, avatarFor } from '../assets';
import ScreenHeader from '../components/ScreenHeader';

export default function PostedDetailScreen({ route, navigation }) {
  const job = jobById(route.params?.jobId ?? 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Applicants" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.jobRow}>
          <View style={styles.logoBox}>
            <Image source={logoFor(job.company)} style={styles.logo} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.jobTitle}>{job.jobTitle}</Text>
            <Text style={styles.jobSub}>{job.company} • {job.applicants} applicants</Text>
          </View>
        </View>

        <View style={{ gap: 13, marginTop: 18 }}>
          {APPLICANTS.map((a) => {
            const t = talentById(a.talentId);
            const st = statusStyle(a.status);
            return (
              <TouchableOpacity key={a.talentId} activeOpacity={0.85} style={styles.card} onPress={() => navigation.navigate('TalentDetail', { talentId: t.id })}>
                <View style={styles.top}>
                  <Image source={avatarFor(t.avatar)} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{t.name}</Text>
                    <Text style={styles.role}>{t.role} • {t.location}</Text>
                  </View>
                  <Text style={[styles.badge, { color: st.color, backgroundColor: st.bg }]}>{a.status}</Text>
                </View>
                <View style={styles.skillRow}>
                  {t.topSkills.map((s) => (
                    <Text key={s} style={styles.skill}>{s}</Text>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 30 },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.md, padding: 14 },
  logoBox: { width: 46, height: 46, borderRadius: 11, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 8 },
  logo: { width: '100%', height: '100%' },
  jobTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.text },
  jobSub: { fontFamily: font.regular, fontSize: 12, color: colors.muted },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.borderSoft },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  name: { fontFamily: font.semibold, fontSize: 14, color: colors.text },
  role: { fontFamily: font.regular, fontSize: 11.5, color: colors.muted },
  badge: { fontFamily: font.semibold, fontSize: 10, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 7, overflow: 'hidden' },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 11 },
  skill: { backgroundColor: colors.cardAlt, color: colors.accent, fontFamily: font.medium, fontSize: 10, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 7, overflow: 'hidden' },
});
