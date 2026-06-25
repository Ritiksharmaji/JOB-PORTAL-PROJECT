import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { font, radius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import PrimaryButton from '../components/PrimaryButton';
import { getJob } from '../services/jobService';

export default function ApplySuccessScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [job, setJob] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setJob(await getJob(route.params?.jobId));
      } catch {
        setJob(null);
      }
    })();
  }, [route.params?.jobId]);

  const goApplications = () =>
    navigation.reset({ index: 0, routes: [{ name: 'App', state: { routes: [{ name: 'My Jobs' }] } }] });

  const browseMore = () =>
    navigation.reset({ index: 0, routes: [{ name: 'App', state: { routes: [{ name: 'Jobs' }] } }] });

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
          {job ? (
            <>
              Your application for <Text style={{ color: colors.accent }}>{job.jobTitle}</Text> at {job.company} has been submitted. We'll notify you on updates.
            </>
          ) : (
            'Your application has been submitted. We\'ll notify you on updates.'
          )}
        </Text>

        <PrimaryButton title="View applications" onPress={goApplications} style={{ marginTop: 30, alignSelf: 'stretch' }} />
        <PrimaryButton title="Browse more jobs" onPress={browseMore} style={[styles.ghost, { marginTop: 12, alignSelf: 'stretch' }]} />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  ring: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,189,32,0.15)', alignItems: 'center', justifyContent: 'center' },
  circle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.bold, fontSize: 24, color: colors.text, marginTop: 28 },
  sub: { fontFamily: font.regular, fontSize: 14, color: colors.textDim, marginTop: 10, textAlign: 'center', lineHeight: 22 },
  ghost: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
});
