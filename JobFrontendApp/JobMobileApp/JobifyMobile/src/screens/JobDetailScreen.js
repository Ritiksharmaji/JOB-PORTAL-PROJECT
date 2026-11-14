import React, { useContext } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { jobById, agoText, REQUIRED_SKILLS } from '../data/jobs';
import { logoFor } from '../assets';
import { AppContext } from '../context/AppContext';
import Tag from '../components/Tag';

const InfoCard = ({ icon, label, value }) => (
  <View style={styles.info}>
    <Ionicons name={icon} size={22} color={colors.accent} />
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

export default function JobDetailScreen({ route, navigation }) {
  const job = jobById(route.params?.jobId ?? 0);
  const { savedJobs, toggleSave } = useContext(AppContext);
  const saved = savedJobs.includes(job.id);

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
          <Text style={styles.meta}>{job.company} • {job.location} • {agoText(job)}</Text>
          <TouchableOpacity style={styles.companyLink} onPress={() => navigation.navigate('Company', { company: job.company })}>
            <Text style={styles.companyLinkTxt}>View company profile</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <InfoCard icon="location-outline" label="Location" value={job.location} />
          <InfoCard icon="briefcase-outline" label="Experience" value={job.experience} />
          <InfoCard icon="cash-outline" label="Salary" value={job.pkg} />
          <InfoCard icon="time-outline" label="Job Type" value={job.jobType} />
        </View>

        <Text style={styles.sectionTitle}>Required Skills</Text>
        <View style={styles.skillRow}>
          {REQUIRED_SKILLS.map((s) => <Tag key={s}>{s}</Tag>)}
        </View>

        <Text style={styles.sectionTitle}>About the job</Text>
        <Text style={styles.para}>
          We're a passionate, fast-growing team looking for engineers who love solving technical challenges and shipping great products. You'll work across the full software development lifecycle in a collaborative, agile environment.
        </Text>

        <Text style={styles.subTitle}>Responsibilities</Text>
        {['Design, build, test and deploy software features', 'Write clean, concise and efficient code', 'Manage documentation and version control', 'Troubleshoot and debug production issues'].map((t) => (
          <View key={t} style={styles.bullet}>
            <View style={styles.dot} />
            <Text style={styles.bulletTxt}>{t}</Text>
          </View>
        ))}

        <Text style={styles.subTitle}>Qualifications</Text>
        {['3+ years of professional experience', "Bachelor's in CS, software engineering or related", 'Strong problem-solving and communication skills'].map((t) => (
          <View key={t} style={styles.bullet}>
            <View style={styles.dot} />
            <Text style={styles.bulletTxt}>{t}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={() => toggleSave(job.id)}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} style={styles.applyBtn} onPress={() => navigation.navigate('Apply', { jobId: job.id })}>
          <Text style={styles.applyTxt}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
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
  subTitle: { fontFamily: font.semibold, fontSize: 14, color: colors.text, marginTop: 18, marginBottom: 8 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginBottom: 6 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.muted, marginTop: 8 },
  bulletTxt: { flex: 1, fontFamily: font.regular, fontSize: 13, lineHeight: 21, color: colors.textDim },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1, borderTopColor: '#3d3d3d' },
  saveBtn: { width: 52, height: 50, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  applyBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  applyTxt: { fontFamily: font.semibold, fontSize: 15, color: colors.onAccent },
});
