import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius } from '../theme';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import { AppContext } from '../context/AppContext';
import { getJob, postJob } from '../services/jobService';
import { errMessage } from '../api/client';

const EXPERIENCE = ['Entry Level', 'Intermediate', 'Expert'];
const JOB_TYPES = ['Full-Time', 'Part-Time', 'Internship', 'Remote'];

const ChipRow = ({ label, options, value, onChange }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.chipRow}>
      {options.map((o) => {
        const on = value === o;
        return (
          <TouchableOpacity key={o} onPress={() => onChange(o)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
            <Text style={[styles.chipTxt, { color: on ? colors.onAccent : '#d1d1d1' }]}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export default function PostJobScreen({ route, navigation }) {
  const { user } = useContext(AppContext);
  const editId = route.params?.jobId; // present when editing
  const [loadingJob, setLoadingJob] = useState(!!editId);

  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [experience, setExperience] = useState('Entry Level');
  const [jobType, setJobType] = useState('Full-Time');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [skills, setSkills] = useState('');
  const [about, setAbout] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const j = await getJob(editId);
        setJobTitle(j.jobTitle || '');
        setCompany(j.company || '');
        setExperience(j.experience || 'Entry Level');
        setJobType(j.jobType || 'Full-Time');
        setLocation(j.location || '');
        setSalary(j.packageOffered != null ? String(j.packageOffered) : '');
        setSkills((j.skillsRequired || []).join(', '));
        setAbout(j.about || '');
        setDescription(j.description || '');
      } catch (e) {
        Alert.alert('Could not load job', errMessage(e));
      } finally {
        setLoadingJob(false);
      }
    })();
  }, [editId]);

  const submit = async (jobStatus) => {
    if (!jobTitle.trim() || !company.trim() || !location.trim()) {
      return Alert.alert('Missing fields', 'Title, company and location are required.');
    }
    setSubmitting(true);
    try {
      const payload = {
        id: editId || 0,
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        experience,
        jobType,
        location: location.trim(),
        packageOffered: Number(salary.replace(/\D/g, '')) || 0,
        skillsRequired: skills.split(',').map((s) => s.trim()).filter(Boolean),
        about: about.trim(),
        description: description.trim(),
        postedBy: user?.id,
        jobStatus,
      };
      const saved = await postJob(payload);
      Alert.alert(
        jobStatus === 'DRAFT' ? 'Saved as draft' : 'Job published',
        jobStatus === 'DRAFT' ? 'Your draft has been saved.' : 'Your job is now live.',
        [
          {
            text: 'OK',
            onPress: () =>
              saved?.id
                ? navigation.navigate('PostedDetail', { jobId: saved.id })
                : navigation.navigate('App', { screen: 'Listings' }),
          },
        ]
      );
    } catch (e) {
      Alert.alert('Could not save job', errMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]} edges={['top']}>
        <ActivityIndicator color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{editId ? 'Edit Job' : 'Post a Job'}</Text>
        <Text style={styles.sub}>Fill in the details to publish</Text>

        <View style={{ gap: 15, marginTop: 20 }}>
          <Field label="Job Title" placeholder="e.g. Product Designer" value={jobTitle} onChangeText={setJobTitle} />
          <Field label="Company" placeholder="e.g. Google" value={company} onChangeText={setCompany} />
          <ChipRow label="Experience" options={EXPERIENCE} value={experience} onChange={setExperience} />
          <ChipRow label="Job Type" options={JOB_TYPES} value={jobType} onChange={setJobType} />
          <View style={styles.row}>
            <Field label="Location" placeholder="New York / Remote" value={location} onChangeText={setLocation} style={{ flex: 1 }} />
            <Field label="Salary (LPA)" placeholder="40" value={salary} onChangeText={setSalary} keyboardType="numeric" style={{ flex: 1 }} />
          </View>
          <Field label="Skills (comma separated)" placeholder="React, Java, MongoDB" value={skills} onChangeText={setSkills} />
          <Field label="Short summary" placeholder="One-line about the role" value={about} onChangeText={setAbout} />
          <Field label="Job Description" placeholder="About the role, responsibilities, qualifications..." value={description} onChangeText={setDescription} multiline />
        </View>

        {submitting ? (
          <View style={styles.submitting}><ActivityIndicator color={colors.onAccent} /></View>
        ) : (
          <>
            <PrimaryButton title={editId ? 'Save changes' : 'Publish job'} onPress={() => submit('ACTIVE')} style={{ marginTop: 22 }} />
            <TouchableOpacity style={styles.draft} onPress={() => submit('DRAFT')}>
              <Text style={styles.draftTxt}>Save as draft</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  title: { fontFamily: font.bold, fontSize: 22, color: colors.text, paddingTop: 6 },
  sub: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontFamily: font.regular, fontSize: 12, color: colors.textDim, marginBottom: 7 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.pill },
  chipOn: { backgroundColor: colors.accent },
  chipOff: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipTxt: { fontFamily: font.medium, fontSize: 12 },
  submitting: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 22 },
  draft: { paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  draftTxt: { fontFamily: font.semibold, fontSize: 14, color: colors.accent },
});
