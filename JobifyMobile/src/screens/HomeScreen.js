import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { JOBS, CATEGORIES } from '../data/jobs';
import { APPLICANT_PROFILE } from '../data/profile';
import { avatarFor } from '../assets';
import JobCard from '../components/JobCard';

export default function HomeScreen({ navigation }) {
  const featured = JOBS.slice(0, 5);
  const firstName = APPLICANT_PROFILE.name.split(' ')[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.greet}>
            <Image source={avatarFor(APPLICANT_PROFILE.avatar)} style={styles.avatar} />
            <View>
              <Text style={styles.welcome}>Welcome back 👋</Text>
              <Text style={styles.name}>{firstName}</Text>
            </View>
          </View>
          <View style={styles.bell}>
            <Ionicons name="notifications-outline" size={21} color="#d1d1d1" />
            <View style={styles.dot} />
          </View>
        </View>

        <Text style={styles.headline}>
          Find your <Text style={{ color: colors.accent }}>dream job</Text> today
        </Text>

        <TouchableOpacity activeOpacity={0.85} style={styles.search} onPress={() => navigation.navigate('Jobs')}>
          <Ionicons name="search-outline" size={20} color={colors.muted} />
          <Text style={styles.searchTxt}>Search jobs, companies...</Text>
        </TouchableOpacity>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Text style={styles.seeAll} onPress={() => navigation.navigate('Jobs')}>See all</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.name} activeOpacity={0.85} style={styles.cat} onPress={() => navigation.navigate('Jobs')}>
              <View style={styles.catIcon}>
                <Text style={styles.catLetter}>{cat.letter}</Text>
              </View>
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.catCount}>{cat.count} jobs</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Featured jobs</Text>
          <Text style={styles.seeAll} onPress={() => navigation.navigate('Jobs')}>See all</Text>
        </View>
        <View style={{ gap: 14 }}>
          {featured.map((job) => (
            <JobCard key={job.id} job={job} onPress={() => navigation.navigate('JobDetail', { jobId: job.id })} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greet: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  welcome: { fontFamily: font.regular, fontSize: 12, color: colors.muted },
  name: { fontFamily: font.semibold, fontSize: 16, color: colors.text },
  bell: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 9, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.card },
  headline: { fontFamily: font.bold, fontSize: 26, color: colors.text, marginTop: 22, lineHeight: 33 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 16, marginTop: 18 },
  searchTxt: { fontFamily: font.regular, fontSize: 14, color: colors.muted },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 14 },
  sectionTitle: { fontFamily: font.semibold, fontSize: 16, color: colors.text },
  seeAll: { fontFamily: font.regular, fontSize: 12, color: colors.accent },
  cat: { width: 104, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.md, padding: 14 },
  catIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  catLetter: { fontFamily: font.bold, fontSize: 15, color: colors.onAccent },
  catName: { fontFamily: font.semibold, fontSize: 13, color: colors.text, marginTop: 10 },
  catCount: { fontFamily: font.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
});
