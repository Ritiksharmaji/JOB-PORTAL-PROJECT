import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { logoFor } from '../assets';
import { agoText } from '../data/jobs';
import { AppContext } from '../context/AppContext';
import Tag from './Tag';

export default function JobCard({ job, onPress }) {
  const { savedJobs, toggleSave } = useContext(AppContext);
  const saved = savedJobs.includes(job.id);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.left}>
          <View style={styles.logoBox}>
            <Image source={logoFor(job.company)} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{job.jobTitle}</Text>
            <Text style={styles.sub} numberOfLines={1}>
              {job.company} • {job.applicants} Applicants
            </Text>
          </View>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => toggleSave(job.id)}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={saved ? colors.accent : colors.muted}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tagRow}>
        <Tag>{job.experience}</Tag>
        <Tag>{job.jobType}</Tag>
        <Tag>{job.location}</Tag>
      </View>

      <Text style={styles.desc} numberOfLines={2}>{job.description}</Text>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.pkg}>₹{job.pkg}</Text>
        <View style={styles.ago}>
          <Ionicons name="time-outline" size={14} color={colors.muted} />
          <Text style={styles.agoTxt}>Posted {agoText(job)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 11,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  left: { flexDirection: 'row', gap: 11, alignItems: 'center', flex: 1 },
  logoBox: {
    width: 42, height: 42, borderRadius: 11, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', padding: 7,
  },
  logo: { width: '100%', height: '100%' },
  title: { fontFamily: font.semibold, fontSize: 15, color: colors.text },
  sub: { fontFamily: font.regular, fontSize: 11, color: colors.textDim, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  desc: { fontFamily: font.regular, fontSize: 11.5, lineHeight: 18, color: colors.textDim },
  divider: { height: 1, backgroundColor: colors.border },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pkg: { fontFamily: font.semibold, fontSize: 14, color: '#d1d1d1' },
  ago: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  agoTxt: { fontFamily: font.regular, fontSize: 11, color: colors.muted },
});
