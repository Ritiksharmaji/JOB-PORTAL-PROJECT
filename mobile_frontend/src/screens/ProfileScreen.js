import React, { useContext, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { avatarFor, BANNER } from '../assets';
import { AppContext } from '../context/AppContext';
import Tag from '../components/Tag';
import { formatDate } from '../utils/format';

export default function ProfileScreen({ navigation }) {
  const { user, profile, refreshProfile, logout } = useContext(AppContext);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const me = profile || {};
  const name = me.name || user?.name || '';
  const avatar = me.picture ? { uri: `data:image/jpeg;base64,${me.picture}` } : avatarFor('avatar');
  const experiences = me.experiences || [];
  const certifications = me.certifications || [];
  const skills = me.skills || [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.bannerWrap}>
          <Image source={BANNER} style={styles.banner} />
          <View style={styles.bannerShade} />
          <TouchableOpacity style={styles.notif} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logout} onPress={logout}>
            <Ionicons name="log-out-outline" size={15} color="#fff" />
            <Text style={styles.logoutTxt}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Image source={avatar} style={styles.avatar} />
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.role}>
                {me.jobTitle || (user?.accountType === 'EMPLOYER' ? 'Employer' : 'Job Seeker')}
                {me.company ? ` • ${me.company}` : ''}
              </Text>
              {!!me.location && (
                <View style={styles.locRow}>
                  <Ionicons name="location-outline" size={13} color={colors.muted} />
                  <Text style={styles.loc}>{me.location}</Text>
                </View>
              )}
              <Text style={styles.email}>{user?.email}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="create-outline" size={14} color={colors.text} />
              <Text style={styles.editTxt}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.aboutCard}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.aboutTxt}>{me.about || 'No bio yet. Tap Edit to add your story.'}</Text>
          </View>

          <Text style={styles.sectionTitle}>Skills</Text>
          {skills.length > 0 ? (
            <View style={styles.skillRow}>
              {skills.map((s) => <Tag key={s}>{s}</Tag>)}
            </View>
          ) : (
            <Text style={styles.emptyTxt}>No skills added yet.</Text>
          )}

          {experiences.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Experience</Text>
              <View style={{ gap: 13 }}>
                {experiences.map((exp, i) => (
                  <View key={i} style={styles.expCard}>
                    <Text style={styles.expTitle}>{exp.title}</Text>
                    <Text style={styles.expSub}>
                      {exp.company}{exp.location ? ` • ${exp.location}` : ''}
                    </Text>
                    <Text style={styles.expDate}>
                      {formatDate(exp.startDate)} - {exp.working ? 'Present' : formatDate(exp.endDate)}
                    </Text>
                    {!!exp.description && <Text style={styles.expDesc}>{exp.description}</Text>}
                  </View>
                ))}
              </View>
            </>
          )}

          {certifications.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Certifications</Text>
              <View style={{ gap: 13 }}>
                {certifications.map((c, i) => (
                  <View key={i} style={styles.certCard}>
                    <Text style={styles.certName}>{c.name}</Text>
                    <Text style={styles.expSub}>{c.issuer}{c.issueDate ? ` • ${formatDate(c.issueDate)}` : ''}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  bannerWrap: { height: 130 },
  banner: { width: '100%', height: '100%' },
  bannerShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(45,45,45,0.35)' },
  logout: { position: 'absolute', top: 14, right: 18, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 9 },
  logoutTxt: { fontFamily: font.medium, fontSize: 12, color: '#fff' },
  notif: { position: 'absolute', top: 14, left: 18, width: 34, height: 34, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, marginTop: -44 },
  avatar: { width: 84, height: 84, borderRadius: 22, borderWidth: 4, borderColor: colors.bg, backgroundColor: colors.card },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 },
  name: { fontFamily: font.bold, fontSize: 20, color: colors.text },
  role: { fontFamily: font.regular, fontSize: 13, color: colors.textDim, marginTop: 3 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  loc: { fontFamily: font.regular, fontSize: 12, color: colors.muted },
  email: { fontFamily: font.regular, fontSize: 12, color: colors.muted, marginTop: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10 },
  editTxt: { fontFamily: font.semibold, fontSize: 12, color: colors.text },
  aboutCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, marginTop: 18 },
  cardTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.text, marginBottom: 8 },
  aboutTxt: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 21, color: colors.textDim },
  sectionTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.text, marginTop: 24, marginBottom: 12 },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emptyTxt: { fontFamily: font.regular, fontSize: 12.5, color: colors.muted },
  expCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: 15 },
  expTitle: { fontFamily: font.semibold, fontSize: 14, color: colors.text },
  expSub: { fontFamily: font.regular, fontSize: 12, color: colors.muted, marginTop: 3 },
  expDate: { fontFamily: font.regular, fontSize: 11, color: colors.muted, marginTop: 3 },
  expDesc: { fontFamily: font.regular, fontSize: 12, lineHeight: 19, color: colors.textDim, marginTop: 11 },
  certCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: 15 },
  certName: { fontFamily: font.semibold, fontSize: 13, color: colors.text },
});
