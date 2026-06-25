import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { font, radius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { avatarFor } from '../assets';
import ScreenHeader from '../components/ScreenHeader';
import Tag from '../components/Tag';
import { getProfile } from '../services/profileService';
import { formatDate } from '../utils/format';

export default function TalentDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const id = route.params?.talentId;
  const [t, setT] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setT(await getProfile(id));
      } catch {
        setT(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={['top', 'bottom']}>
        <ActivityIndicator color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }
  if (!t) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={['top', 'bottom']}>
        <Text style={styles.muted}>Profile not found.</Text>
      </SafeAreaView>
    );
  }

  const avatar = t.picture ? { uri: `data:image/jpeg;base64,${t.picture}` } : avatarFor('avatar');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Candidate" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <Image source={avatar} style={styles.avatar} />
          <Text style={styles.name}>{t.name}</Text>
          <Text style={styles.role}>{t.jobTitle || 'Candidate'}{t.company ? ` @ ${t.company}` : ''}</Text>
          {!!t.location && (
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={13} color={colors.muted} />
              <Text style={styles.loc}>{t.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.expCard}>
          <Text style={styles.expLabel}>Total experience</Text>
          <Text style={styles.expVal}>{t.totalExp != null ? `${t.totalExp} years` : '—'}</Text>
        </View>

        {!!t.about && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.para}>{t.about}</Text>
          </>
        )}

        {(t.skills || []).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillRow}>
              {t.skills.map((s) => <Tag key={s}>{s}</Tag>)}
            </View>
          </>
        )}

        {(t.experiences || []).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            <View style={{ gap: 12 }}>
              {t.experiences.map((e, i) => (
                <View key={i} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{e.title}</Text>
                  <Text style={styles.itemSub}>{e.company}{e.location ? ` • ${e.location}` : ''}</Text>
                  <Text style={styles.itemDate}>
                    {formatDate(e.startDate)} - {e.working ? 'Present' : formatDate(e.endDate)}
                  </Text>
                  {!!e.description && <Text style={styles.itemDesc}>{e.description}</Text>}
                </View>
              ))}
            </View>
          </>
        )}

        {(t.certifications || []).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={{ gap: 12 }}>
              {t.certifications.map((c, i) => (
                <View key={i} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{c.name}</Text>
                  <Text style={styles.itemSub}>{c.issuer}{c.issueDate ? ` • ${formatDate(c.issueDate)}` : ''}</Text>
                  {!!c.certificateId && <Text style={styles.itemDate}>ID: {c.certificateId}</Text>}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { fontFamily: font.medium, fontSize: 15, color: colors.textDim },
  body: { paddingHorizontal: 20, paddingBottom: 30 },
  hero: { alignItems: 'center', paddingTop: 6 },
  avatar: { width: 90, height: 90, borderRadius: 26, backgroundColor: colors.card },
  name: { fontFamily: font.bold, fontSize: 21, color: colors.text, marginTop: 13 },
  role: { fontFamily: font.regular, fontSize: 13, color: colors.textDim, marginTop: 4 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  loc: { fontFamily: font.regular, fontSize: 12, color: colors.muted },
  expCard: { backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  expLabel: { fontFamily: font.regular, fontSize: 11, color: colors.muted },
  expVal: { fontFamily: font.bold, fontSize: 14, color: colors.accent, marginTop: 3 },
  sectionTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.text, marginTop: 20, marginBottom: 11 },
  para: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 21, color: colors.textDim },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  itemCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14 },
  itemTitle: { fontFamily: font.semibold, fontSize: 14, color: colors.text },
  itemSub: { fontFamily: font.regular, fontSize: 12, color: colors.textDim, marginTop: 3 },
  itemDate: { fontFamily: font.regular, fontSize: 11, color: colors.muted, marginTop: 3 },
  itemDesc: { fontFamily: font.regular, fontSize: 12, lineHeight: 19, color: colors.textDim, marginTop: 8 },
});
