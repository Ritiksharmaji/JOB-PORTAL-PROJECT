import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { CATEGORIES } from '../data/jobs';
import { avatarFor } from '../assets';
import { AppContext } from '../context/AppContext';
import JobCard from '../components/JobCard';
import { getAllJobs } from '../services/jobService';

export default function HomeScreen({ navigation }) {
  const { user, profile } = useContext(AppContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const all = await getAllJobs();
      const active = (all || []).filter((j) => j.jobStatus === 'ACTIVE');
      // newest first
      active.sort((a, b) => new Date(b.postTime).getTime() - new Date(a.postTime).getTime());
      setJobs(active);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const firstName = (user?.name || 'there').split(' ')[0];
  const avatarSource = profile?.picture
    ? { uri: `data:image/jpeg;base64,${profile.picture}` }
    : avatarFor('avatar');
  const featured = jobs.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />}
      >
        <View style={styles.topRow}>
          <View style={styles.greet}>
            <Image source={avatarSource} style={styles.avatar} />
            <View>
              <Text style={styles.welcome}>Welcome back 👋</Text>
              <Text style={styles.name}>{firstName}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bell} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={21} color="#d1d1d1" />
          </TouchableOpacity>
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

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
        ) : featured.length === 0 ? (
          <Text style={styles.empty}>No jobs available yet.</Text>
        ) : (
          <View style={{ gap: 14 }}>
            {featured.map((job) => (
              <JobCard key={job.id} job={job} onPress={() => navigation.navigate('JobDetail', { jobId: job.id })} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greet: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card },
  welcome: { fontFamily: font.regular, fontSize: 12, color: colors.muted },
  name: { fontFamily: font.semibold, fontSize: 16, color: colors.text },
  bell: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
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
  empty: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 16, textAlign: 'center' },
});
