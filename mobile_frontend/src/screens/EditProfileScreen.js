import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, font, radius } from '../theme';
import { avatarFor } from '../assets';
import { AppContext } from '../context/AppContext';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import { errMessage } from '../api/client';

// Accept "YYYY-MM" or "YYYY-MM-DD" -> backend LocalDateTime "YYYY-MM-DDT00:00:00"
const toLocalDateTime = (text) => {
  const t = (text || '').trim();
  if (!t) return null;
  let d = t;
  if (/^\d{4}-\d{2}$/.test(d)) d = `${d}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${d}T00:00:00`;
  return null;
};
const dateText = (iso) => (iso ? String(iso).slice(0, 10) : '');

export default function EditProfileScreen({ navigation }) {
  const { profile, user, saveProfile } = useContext(AppContext);
  const base = profile || { id: user?.profileId, name: user?.name, email: user?.email };

  const [picture, setPicture] = useState(base.picture || '');
  const [jobTitle, setJobTitle] = useState(base.jobTitle || '');
  const [company, setCompany] = useState(base.company || '');
  const [location, setLocation] = useState(base.location || '');
  const [totalExp, setTotalExp] = useState(base.totalExp != null ? String(base.totalExp) : '');
  const [about, setAbout] = useState(base.about || '');
  const [skills, setSkills] = useState((base.skills || []).join(', '));
  const [experiences, setExperiences] = useState(base.experiences || []);
  const [certifications, setCertifications] = useState(base.certifications || []);
  const [saving, setSaving] = useState(false);

  // new-experience form
  const [exp, setExp] = useState({ title: '', company: '', location: '', startDate: '', endDate: '', working: false, description: '' });
  // new-certification form
  const [cert, setCert] = useState({ name: '', issuer: '', issueDate: '', certificateId: '' });

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo access to set a picture.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5, base64: true });
    if (!res.canceled && res.assets?.[0]?.base64) setPicture(res.assets[0].base64);
  };

  const addExperience = () => {
    if (!exp.title.trim() || !exp.company.trim()) return Alert.alert('Missing info', 'Title and company are required.');
    setExperiences((prev) => [
      ...prev,
      {
        title: exp.title.trim(),
        company: exp.company.trim(),
        location: exp.location.trim(),
        startDate: toLocalDateTime(exp.startDate),
        endDate: exp.working ? null : toLocalDateTime(exp.endDate),
        working: exp.working,
        description: exp.description.trim(),
      },
    ]);
    setExp({ title: '', company: '', location: '', startDate: '', endDate: '', working: false, description: '' });
  };

  const addCertification = () => {
    if (!cert.name.trim() || !cert.issuer.trim()) return Alert.alert('Missing info', 'Name and issuer are required.');
    setCertifications((prev) => [
      ...prev,
      { name: cert.name.trim(), issuer: cert.issuer.trim(), issueDate: toLocalDateTime(cert.issueDate), certificateId: cert.certificateId.trim() },
    ]);
    setCert({ name: '', issuer: '', issueDate: '', certificateId: '' });
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = {
        ...base,
        id: base.id,
        name: base.name || user?.name,
        email: base.email || user?.email,
        picture: picture || null,
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        location: location.trim(),
        totalExp: Number(totalExp.replace(/\D/g, '')) || 0,
        about: about.trim(),
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        experiences,
        certifications,
        savedJobs: base.savedJobs || [],
      };
      await saveProfile(updated);
      Alert.alert('Saved', 'Your profile has been updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Could not save', errMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const avatar = picture ? { uri: `data:image/jpeg;base64,${picture}` } : avatarFor('avatar');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Edit Profile" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.picRow}>
          <Image source={avatar} style={styles.avatar} />
          <TouchableOpacity style={styles.picBtn} onPress={pickImage}>
            <Ionicons name="camera-outline" size={16} color={colors.text} />
            <Text style={styles.picBtnTxt}>Change photo</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 14, marginTop: 18 }}>
          <Field label="Job title" value={jobTitle} onChangeText={setJobTitle} placeholder="Software Engineer" />
          <View style={styles.row}>
            <Field label="Company" value={company} onChangeText={setCompany} placeholder="Google" style={{ flex: 1 }} />
            <Field label="Experience (yrs)" value={totalExp} onChangeText={setTotalExp} keyboardType="numeric" placeholder="3" style={{ flex: 1 }} />
          </View>
          <Field label="Location" value={location} onChangeText={setLocation} placeholder="New York, US" />
          <Field label="About" value={about} onChangeText={setAbout} placeholder="Tell us about yourself" multiline />
          <Field label="Skills (comma separated)" value={skills} onChangeText={setSkills} placeholder="React, Java, AWS" />
        </View>

        {/* Experience */}
        <Text style={styles.sectionTitle}>Experience</Text>
        {experiences.map((e, i) => (
          <View key={i} style={styles.itemCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{e.title}</Text>
              <Text style={styles.itemSub}>{e.company}{e.location ? ` • ${e.location}` : ''}</Text>
            </View>
            <TouchableOpacity onPress={() => setExperiences((prev) => prev.filter((_, idx) => idx !== i))}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addBox}>
          <Field label="Title" value={exp.title} onChangeText={(v) => setExp({ ...exp, title: v })} placeholder="Software Engineer" />
          <Field label="Company" value={exp.company} onChangeText={(v) => setExp({ ...exp, company: v })} placeholder="Google" style={{ marginTop: 10 }} />
          <Field label="Location" value={exp.location} onChangeText={(v) => setExp({ ...exp, location: v })} placeholder="Remote" style={{ marginTop: 10 }} />
          <View style={[styles.row, { marginTop: 10 }]}>
            <Field label="Start (YYYY-MM)" value={exp.startDate} onChangeText={(v) => setExp({ ...exp, startDate: v })} placeholder="2022-04" style={{ flex: 1 }} />
            {!exp.working && (
              <Field label="End (YYYY-MM)" value={exp.endDate} onChangeText={(v) => setExp({ ...exp, endDate: v })} placeholder="2024-01" style={{ flex: 1 }} />
            )}
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchTxt}>Currently working here</Text>
            <Switch value={exp.working} onValueChange={(v) => setExp({ ...exp, working: v })} trackColor={{ false: colors.border, true: colors.accent }} thumbColor="#fff" />
          </View>
          <Field label="Description" value={exp.description} onChangeText={(v) => setExp({ ...exp, description: v })} placeholder="What did you do?" multiline style={{ marginTop: 10 }} />
          <TouchableOpacity style={styles.addBtn} onPress={addExperience}>
            <Ionicons name="add" size={18} color={colors.onAccent} />
            <Text style={styles.addBtnTxt}>Add experience</Text>
          </TouchableOpacity>
        </View>

        {/* Certifications */}
        <Text style={styles.sectionTitle}>Certifications</Text>
        {certifications.map((c, i) => (
          <View key={i} style={styles.itemCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{c.name}</Text>
              <Text style={styles.itemSub}>{c.issuer}</Text>
            </View>
            <TouchableOpacity onPress={() => setCertifications((prev) => prev.filter((_, idx) => idx !== i))}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addBox}>
          <Field label="Name" value={cert.name} onChangeText={(v) => setCert({ ...cert, name: v })} placeholder="Cloud Architect" />
          <Field label="Issuer" value={cert.issuer} onChangeText={(v) => setCert({ ...cert, issuer: v })} placeholder="Google" style={{ marginTop: 10 }} />
          <View style={[styles.row, { marginTop: 10 }]}>
            <Field label="Issued (YYYY-MM)" value={cert.issueDate} onChangeText={(v) => setCert({ ...cert, issueDate: v })} placeholder="2023-08" style={{ flex: 1 }} />
            <Field label="Credential ID" value={cert.certificateId} onChangeText={(v) => setCert({ ...cert, certificateId: v })} placeholder="ABC123" style={{ flex: 1 }} />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={addCertification}>
            <Ionicons name="add" size={18} color={colors.onAccent} />
            <Text style={styles.addBtnTxt}>Add certification</Text>
          </TouchableOpacity>
        </View>

        {saving ? (
          <View style={styles.savingBtn}><ActivityIndicator color={colors.onAccent} /></View>
        ) : (
          <PrimaryButton title="Save profile" onPress={save} style={{ marginTop: 24 }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 40 },
  picRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6 },
  avatar: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.card },
  picBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  picBtnTxt: { fontFamily: font.semibold, fontSize: 12, color: colors.text },
  row: { flexDirection: 'row', gap: 12 },
  sectionTitle: { fontFamily: font.semibold, fontSize: 16, color: colors.text, marginTop: 26, marginBottom: 12 },
  itemCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  itemTitle: { fontFamily: font.semibold, fontSize: 14, color: colors.text },
  itemSub: { fontFamily: font.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
  addBox: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.borderSoft },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  switchTxt: { fontFamily: font.regular, fontSize: 13, color: colors.textDim },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.accent, borderRadius: radius.sm, paddingVertical: 11, marginTop: 14 },
  addBtnTxt: { fontFamily: font.semibold, fontSize: 13, color: colors.onAccent },
  savingBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
});
