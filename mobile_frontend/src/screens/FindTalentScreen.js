import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { avatarFor } from '../assets';
import { getAllProfiles } from '../services/profileService';

const avatarSource = (p) => (p?.picture ? { uri: `data:image/jpeg;base64,${p.picture}` } : avatarFor('avatar'));

export default function FindTalentScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const all = await getAllProfiles();
      // Only show profiles that have been filled in (have a job title).
      setProfiles((all || []).filter((p) => p.jobTitle || (p.skills || []).length));
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.jobTitle?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        (p.skills || []).some((s) => s.toLowerCase().includes(q))
    );
  }, [profiles, query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />}
      >
        <Text style={styles.title}>Find Talent</Text>

        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <TextInput
              placeholder="Search by name, skill, role..."
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

        <Text style={styles.count}>{list.length} candidates available</Text>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 28 }} />
        ) : list.length === 0 ? (
          <Text style={styles.empty}>No candidates found.</Text>
        ) : (
          <View style={{ gap: 14, marginTop: 12 }}>
            {list.map((t) => (
              <TouchableOpacity key={t.id} activeOpacity={0.85} style={styles.card} onPress={() => navigation.navigate('TalentDetail', { talentId: t.id })}>
                <View style={styles.cardTop}>
                  <Image source={avatarSource(t)} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>{t.name}</Text>
                    <Text style={styles.role} numberOfLines={1}>
                      {t.jobTitle || 'Candidate'}{t.company ? ` @ ${t.company}` : ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.skillRow}>
                  {(t.skills || []).slice(0, 3).map((s) => (
                    <Text key={s} style={styles.skill}>{s}</Text>
                  ))}
                </View>
                <View style={styles.divider} />
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.ctcLabel}>Experience</Text>
                    <Text style={styles.ctc}>{t.totalExp != null ? `${t.totalExp} yrs` : '—'}</Text>
                  </View>
                  <View style={styles.invite}><Text style={styles.inviteTxt}>View profile</Text></View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  count: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 16 },
  empty: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 24, textAlign: 'center' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.borderSoft },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.cardAlt },
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
