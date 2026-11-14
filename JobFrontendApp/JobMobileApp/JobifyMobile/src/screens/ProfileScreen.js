import React, { useContext } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { APPLICANT_PROFILE, EMPLOYER_PROFILE } from '../data/profile';
import { avatarFor, logoFor, BANNER } from '../assets';
import { AppContext } from '../context/AppContext';
import Tag from '../components/Tag';

export default function ProfileScreen({ navigation }) {
  const { role, setRole } = useContext(AppContext);
  const me = role === 'employer' ? EMPLOYER_PROFILE : APPLICANT_PROFILE;
  const otherRole = role === 'applicant' ? 'employer' : 'job seeker';

  const logout = () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] });

  const switchRole = () => {
    const next = role === 'applicant' ? 'employer' : 'applicant';
    setRole(next);
    navigation.reset({ index: 0, routes: [{ name: next === 'employer' ? 'EmployerApp' : 'ApplicantApp' }] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.bannerWrap}>
          <Image source={BANNER} style={styles.banner} />
          <View style={styles.bannerShade} />
          <TouchableOpacity style={styles.logout} onPress={logout}>
            <Ionicons name="log-out-outline" size={15} color="#fff" />
            <Text style={styles.logoutTxt}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Image source={avatarFor(me.avatar)} style={styles.avatar} />
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{me.name}</Text>
              <Text style={styles.role}>{me.role} • {me.company}</Text>
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={13} color={colors.muted} />
                <Text style={styles.loc}>{me.location}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Ionicons name="create-outline" size={14} color={colors.text} />
              <Text style={styles.editTxt}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.aboutCard}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.aboutTxt}>{me.about}</Text>
          </View>

          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillRow}>
            {me.skills.map((s) => <Tag key={s}>{s}</Tag>)}
          </View>

          {me.experience.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Experience</Text>
              <View style={{ gap: 13 }}>
                {me.experience.map((exp) => (
                  <View key={exp.title} style={styles.expCard}>
                    <View style={styles.expTop}>
                      <View style={styles.expLogoBox}>
                        <Image source={logoFor(exp.company)} style={styles.expLogo} resizeMode="contain" />
                      </View>
                      <View>
                        <Text style={styles.expTitle}>{exp.title}</Text>
                        <Text style={styles.expSub}>{exp.company} • {exp.period}</Text>
                      </View>
                    </View>
                    <Text style={styles.expDesc}>{exp.desc}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {me.certifications.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Certifications</Text>
              <View style={{ gap: 13 }}>
                {me.certifications.map((c) => (
                  <View key={c.name} style={styles.certCard}>
                    <View style={styles.expLogoBox}>
                      <Image source={logoFor(c.issuer)} style={styles.expLogo} resizeMode="contain" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.certName}>{c.name}</Text>
                      <Text style={styles.expSub}>{c.issuer} • {c.date}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity style={styles.switch} onPress={switchRole}>
            <Text style={styles.switchTxt}>Switch to {otherRole} view</Text>
          </TouchableOpacity>
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
  content: { paddingHorizontal: 20, marginTop: -44 },
  avatar: { width: 84, height: 84, borderRadius: 22, borderWidth: 4, borderColor: colors.bg },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 },
  name: { fontFamily: font.bold, fontSize: 20, color: colors.text },
  role: { fontFamily: font.regular, fontSize: 13, color: colors.textDim, marginTop: 3 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  loc: { fontFamily: font.regular, fontSize: 12, color: colors.muted },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10 },
  editTxt: { fontFamily: font.semibold, fontSize: 12, color: colors.text },
  aboutCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, marginTop: 18 },
  cardTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.text, marginBottom: 8 },
  aboutTxt: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 21, color: colors.textDim },
  sectionTitle: { fontFamily: font.semibold, fontSize: 15, color: colors.text, marginTop: 24, marginBottom: 12 },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  expCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: 15 },
  expTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expLogoBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 7 },
  expLogo: { width: '100%', height: '100%' },
  expTitle: { fontFamily: font.semibold, fontSize: 14, color: colors.text },
  expSub: { fontFamily: font.regular, fontSize: 12, color: colors.muted },
  expDesc: { fontFamily: font.regular, fontSize: 12, lineHeight: 19, color: colors.textDim, marginTop: 11 },
  certCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  certName: { fontFamily: font.semibold, fontSize: 13, color: colors.text },
  switch: { marginTop: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  switchTxt: { fontFamily: font.semibold, fontSize: 13, color: colors.accent },
});
