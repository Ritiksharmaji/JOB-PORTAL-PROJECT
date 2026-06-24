import React from 'react';
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { TALENTS } from '../data/talents';
import { avatarFor } from '../assets';
import Tag from '../components/Tag';

export default function FindTalentScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Find Talent</Text>

        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <TextInput placeholder="Search by skill, role..." placeholderTextColor={colors.muted} style={styles.input} />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={colors.onAccent} />
          </TouchableOpacity>
        </View>

        <Text style={styles.count}>{TALENTS.length} candidates available</Text>

        <View style={{ gap: 14, marginTop: 12 }}>
          {TALENTS.map((t) => (
            <TouchableOpacity key={t.id} activeOpacity={0.85} style={styles.card} onPress={() => navigation.navigate('TalentDetail', { talentId: t.id })}>
              <View style={styles.cardTop}>
                <Image source={avatarFor(t.avatar)} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{t.name}</Text>
                  <Text style={styles.role}>{t.role} @ {t.company}</Text>
                </View>
              </View>
              <View style={styles.skillRow}>
                {t.topSkills.map((s) => (
                  <Text key={s} style={styles.skill}>{s}</Text>
                ))}
              </View>
              <View style={styles.divider} />
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.ctcLabel}>Expected CTC</Text>
                  <Text style={styles.ctc}>{t.expectedCtc}</Text>
                </View>
                <View style={styles.invite}><Text style={styles.inviteTxt}>Invite</Text></View>
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
  searchRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, color: colors.text, fontFamily: font.regular, fontSize: 13, padding: 0 },
  filterBtn: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  count: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 16 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.borderSoft },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  name: { fontFamily: font.semibold, fontSize: 15, color: colors.text },
  role: { fontFamily: font.regular, fontSize: 12, color: colors.textDim },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  skill: { backgroundColor: colors.cardAlt, color: colors.accent, fontFamily: font.medium, fontSize: 10.5, paddingVertical: 5, paddingHorizontal: 9, borderRadius: radius.sm, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 13 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ctcLabel: { fontFamily: font.regular, fontSize: 10, color: colors.muted },
  ctc: { fontFamily: font.semibold, fontSize: 13, color: '#d1d1d1' },
  invite: { backgroundColor: colors.accent, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 9 },
  inviteTxt: { fontFamily: font.semibold, fontSize: 12, color: colors.onAccent },
});
