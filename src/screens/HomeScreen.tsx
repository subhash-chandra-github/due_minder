import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Colors } from '../constants/colors';
import { Reminder } from '../types';
import { loadReminders, deleteReminder } from '../storage/reminderStorage';
import { cancelReminderNotifications } from '../utils/notifications';
import { daysUntil } from '../utils/urgency';
import { CATEGORY_MAP } from '../constants/categories';
import ReminderCard from '../components/ReminderCard';


export default function HomeScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const load = useCallback(async () => {
    const data = await loadReminders();
    // Sort by due date ascending
    data.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    setReminders(data);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleDelete = async (reminder: Reminder) => {
    await cancelReminderNotifications(reminder.notificationIds);
    await deleteReminder(reminder.id);
    load();
  };

  const handleEdit = (reminder: Reminder) => {
    navigation.navigate('Add', { reminder });
  };

  const categoryBreakdown = (() => {
    const counts: Record<string, number> = {};
    reminders.forEach(r => { counts[r.category] = (counts[r.category] ?? 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, count, cat: CATEGORY_MAP[id] }));
  })();

  const urgent   = reminders.filter(r => daysUntil(r.dueDate) <= 3).length;
  const thisWeek = reminders.filter(r => { const d = daysUntil(r.dueDate); return d > 3 && d <= 7; }).length;
  const upcoming = reminders.filter(r => daysUntil(r.dueDate) > 7).length;
  const next     = reminders[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} />}
      >
        {/* Top bar */}
        <View style={styles.topbar}>
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>DueMinder</Text>
              <Ionicons name="notifications" size={18} color={Colors.blue} />
            </View>
            <Text style={styles.date}>{format(new Date(), 'EEEE, d MMMM yyyy')}</Text>
          </View>
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <View style={styles.hero}>
          <View style={styles.heroDecor1} />
          <View style={styles.heroDecor2} />
          <Text style={styles.heroLabel}>Reminders this month</Text>
          <Text style={styles.heroCount}>{reminders.length} scheduled</Text>
          <View style={styles.heroChips}>
            <HeroChip icon="alert-circle-outline" label={`${urgent} urgent`} />
            <HeroChip icon="time-outline"         label={`${thisWeek} this week`} />
            <HeroChip icon="calendar-outline"     label={`${upcoming} upcoming`} />
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <Ionicons name="calendar-number-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.statLabel}>Next reminder</Text>
            </View>
            <Text style={styles.statValue}>
              {next ? format(new Date(next.dueDate), 'd MMM') : '—'}
            </Text>
            <Text style={styles.statSub} numberOfLines={1}>
              {next ? next.name : 'No reminders yet'}
            </Text>
          </View>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Reminders')} activeOpacity={0.75}>
            <View style={styles.statLabelRow}>
              <Ionicons name="list-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <Text style={styles.statValue}>{reminders.length}</Text>
            <Text style={styles.statSub}>active reminders</Text>
          </TouchableOpacity>
        </View>

        {/* Category breakdown */}
        <View style={styles.catCard}>
          <View style={styles.statLabelRow}>
            <Ionicons name="pie-chart-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.statLabel}>By category</Text>
          </View>
          {categoryBreakdown.length === 0 ? (
            <Text style={styles.catEmpty}>No reminders yet</Text>
          ) : (
            categoryBreakdown.map(({ id, count, cat }) => {
              const pct = reminders.length > 0 ? count / reminders.length : 0;
              return (
                <View key={id} style={styles.catRow}>
                  <View style={[styles.catDot, { backgroundColor: cat?.color ?? Colors.textMuted }]} />
                  <Text style={styles.catLabel}>{cat?.label ?? id}</Text>
                  <View style={styles.catBarTrack}>
                    <View style={[styles.catBarFill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: cat?.color ?? Colors.blue }]} />
                  </View>
                  <Text style={styles.catCount}>{count}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* Upcoming list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming reminders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Reminders')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {reminders.length === 0 ? (
          <EmptyState onAdd={() => navigation.navigate('Add')} />
        ) : (
          reminders.slice(0, 5).map(r => (
            <ReminderCard
              key={r.id}
              reminder={r}
              onPress={() => navigation.navigate('Reminders')}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon as any} size={12} color="rgba(255,255,255,0.9)" />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="notifications-off-outline" size={48} color={Colors.border} />
      <Text style={styles.emptyTitle}>No reminders yet</Text>
      <Text style={styles.emptySub}>Tap the + button to add your first reminder</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onAdd}>
        <Text style={styles.emptyBtnText}>Add reminder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },

  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 14 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greeting: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  date:     { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  // Hero
  hero:      { backgroundColor: Colors.blue, borderRadius: 16, padding: 20, marginBottom: 14, overflow: 'hidden' },
  heroDecor1:{ position: 'absolute', top: -22, right: -22, width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.blueMid, opacity: 0.35 },
  heroDecor2:{ position: 'absolute', bottom: -28, right: 28, width: 65, height: 65, borderRadius: 33, backgroundColor: Colors.blueMid, opacity: 0.2 },
  heroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 4, letterSpacing: 0.3 },
  heroCount: { fontSize: 26, fontWeight: '700', color: Colors.white, marginBottom: 14 },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  chipText:  { fontSize: 11, color: Colors.white },

  // Stats
  statRow:  { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 0.5, borderColor: Colors.border, padding: 14 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  statValue: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  statSub:   { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  // Category breakdown card
  catCard:     { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 0.5, borderColor: Colors.border, padding: 14, marginBottom: 16, gap: 10 },
  catEmpty:    { fontSize: 12, color: Colors.textMuted, marginTop: 6 },
  catRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot:      { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  catLabel:    { fontSize: 12, color: Colors.textPrimary, width: 90 },
  catBarTrack: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  catBarFill:  { height: 6, borderRadius: 3 },
  catCount:    { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, width: 20, textAlign: 'right' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle:  { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  seeAll:        { fontSize: 12, color: Colors.blue },

  empty:       { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle:  { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
  emptySub:    { fontSize: 13, color: Colors.textMuted, textAlign: 'center', maxWidth: 220 },
  emptyBtn:    { marginTop: 8, backgroundColor: Colors.blue, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  emptyBtnText:{ fontSize: 14, fontWeight: '600', color: Colors.white },
});
