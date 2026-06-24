import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { talentById } from '../data/talents';
import { avatarFor } from '../assets';
import ScreenHeader from '../components/ScreenHeader';
import Tag from '../components/Tag';

export default function TalentDetailScreen({ route, navigation }) {
  const t = talentById(route.params?.talentId ?? 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Candidate" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <Image source={avatarFor(t.avatar)} style={styles.avatar} />
          <Text style={styles.name}>{t.name}</Text>
          <Text style={styles.role}>{t.role} @ {t.company}</Text>
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={13} color={colors.muted} />
            <Text style={styles.loc}>{t.location}</Text>
          </View>
        </View>

        <View style={styles.ctaRow}>
          <TouchableOpacity activeOpacity={0.85} style={styles.invite}>
            <Text style={styles.inviteTxt}>Invite to apply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.msg}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.ctcCard}>
          <Text style={styles.ctcLabel}>Expected CTC</Text>
          <Text style={styles.ctc}>{t.expectedCtc}</Text>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.para}>{t.about}</Text>

        <Text style={styles.sectionTitle}>Top skills</Text>
        <View style={styles.skillRow}>
          {t.topSkills.map((s) => <Tag key={s}>{s}</Tag>)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 30 },
  hero: { alignItems: 'center', paddingTop: 6 },
  avatar: { width: 90, height: 90, borderRadius: 26 },
  name: { fontFamily: font.bold, fontSize: 21, color: colors.text, marginTop: 13 },
  role: { fontFamily: font.regular, fontSize: 13, color: colors.textDim, marginTop: 4 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  loc: { fontFamily: font.regular, fontSize: 12, color: colors.muted },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  invite: { flex: 1, backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center' },
  inviteTxt: { fontFamily: font.semibold, fontSize: 14, color: colors.onAccent },
  msg: { width: 50, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  ctcCard: { backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  ctcLabel: { fontFamily: font.regular, fontSize: 11, color: colors.muted },
  ctc: { fontFamily: font.bold, fontSize: 14, color: colors.accent, marginTop: 3 },
  sectionTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.text, marginTop: 20, marginBottom: 11 },
  para: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 21, color: colors.textDim },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
