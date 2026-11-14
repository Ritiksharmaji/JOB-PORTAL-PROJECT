import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { jobById } from '../data/jobs';
import PrimaryButton from '../components/PrimaryButton';

export default function ApplySuccessScreen({ route, navigation }) {
  const job = jobById(route.params?.jobId ?? 0);

  const goApplications = () =>
    navigation.reset({ index: 0, routes: [{ name: 'ApplicantApp', state: { routes: [{ name: 'My Jobs' }] } }] });

  const browseMore = () =>
    navigation.reset({ index: 0, routes: [{ name: 'ApplicantApp', state: { routes: [{ name: 'Jobs' }] } }] });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.ring}>
          <View style={styles.circle}>
            <Ionicons name="checkmark" size={34} color={colors.onAccent} />
          </View>
        </View>
        <Text style={styles.title}>Application sent!</Text>
        <Text style={styles.sub}>
          Your application for <Text style={{ color: colors.accent }}>{job.jobTitle}</Text> at {job.company} has been submitted. We'll notify you on updates.
        </Text>

        <PrimaryButton title="View applications" onPress={goApplications} style={{ marginTop: 30, alignSelf: 'stretch' }} />
        <PrimaryButton title="Browse more jobs" onPress={browseMore} style={[styles.ghost, { marginTop: 12, alignSelf: 'stretch' }]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  ring: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,189,32,0.15)', alignItems: 'center', justifyContent: 'center' },
  circle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.bold, fontSize: 24, color: colors.text, marginTop: 28 },
  sub: { fontFamily: font.regular, fontSize: 14, color: colors.textDim, marginTop: 10, textAlign: 'center', lineHeight: 22 },
  ghost: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
});
