import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { font, radius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { getNotifications, readNotification } from '../services/notificationService';
import { timeAgo } from '../utils/format';

// Map a web route string from the backend to an in-app navigation action.
const navigateForRoute = (navigation, route) => {
  if (!route) return;
  const jobMatch = route.match(/\/jobs?\/(\d+)/);
  if (jobMatch) return navigation.navigate('JobDetail', { jobId: Number(jobMatch[1]) });
  const postedMatch = route.match(/\/posted-jobs?\/(\d+)/);
  if (postedMatch) return navigation.navigate('PostedDetail', { jobId: Number(postedMatch[1]) });
  if (route.includes('job-history')) return navigation.navigate('App', { screen: 'My Jobs' });
  if (route.includes('profile')) return navigation.navigate('App', { screen: 'Profile' });
};

export default function NotificationsScreen({ navigation }) {
  const { user } = useContext(AppContext);
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (user?.id == null) return;
    try {
      setItems((await getNotifications(user.id)) || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const open = async (n) => {
    setItems((prev) => prev.filter((x) => x.id !== n.id));
    try {
      await readNotification(n.id);
    } catch {}
    navigateForRoute(navigation, n.route);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />}
      >
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 28 }} />
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={46} color="#5d5d5d" />
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptySub}>No new notifications</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {items.map((n) => (
              <TouchableOpacity key={n.id} activeOpacity={0.85} style={styles.card} onPress={() => open(n)}>
                <View style={styles.iconWrap}>
                  <Ionicons name="notifications" size={18} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  {!!n.action && <Text style={styles.action}>{n.action}</Text>}
                  <Text style={styles.message}>{n.message}</Text>
                  {!!n.timestamp && <Text style={styles.time}>{timeAgo(n.timestamp)}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.borderSoft, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,189,32,0.12)', alignItems: 'center', justifyContent: 'center' },
  action: { fontFamily: font.semibold, fontSize: 13.5, color: colors.text },
  message: { fontFamily: font.regular, fontSize: 12.5, color: colors.textDim, marginTop: 2, lineHeight: 18 },
  time: { fontFamily: font.regular, fontSize: 11, color: colors.muted, marginTop: 4 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { fontFamily: font.medium, fontSize: 15, color: colors.textDim, marginTop: 14 },
  emptySub: { fontFamily: font.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
});
