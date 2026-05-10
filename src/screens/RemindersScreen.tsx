import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/colors';
import { CATEGORIES, CATEGORY_MAP } from '../constants/categories';
import { Reminder, CategoryId } from '../types';
import { loadReminders, deleteReminder } from '../storage/reminderStorage';
import { cancelReminderNotifications } from '../utils/notifications';
import { daysUntil } from '../utils/urgency';
import ReminderCard from '../components/ReminderCard';

type Group = { label: string; color: string; items: Reminder[] };

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<CategoryId | 'All'>('All');
  const navigation = useNavigation<any>();

  const load = useCallback(async () => {
    const data = await loadReminders();
    data.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    setReminders(data);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered =
    filter === 'All' ? reminders : reminders.filter(r => r.category === filter);

  // Group by urgency
  const groups: Group[] = [
    {
      label: 'Overdue / urgent',
      color: Colors.red,
      items: filtered.filter(r => daysUntil(r.dueDate) <= 3),
    },
    {
      label: 'This week',
      color: Colors.yellow,
      items: filtered.filter(r => { const d = daysUntil(r.dueDate); return d > 3 && d <= 7; }),
    },
    {
      label: 'Upcoming',
      color: Colors.green,
      items: filtered.filter(r => daysUntil(r.dueDate) > 7),
    },
  ].filter(g => g.items.length > 0);

  const handleDelete = async (reminder: Reminder) => {
    await cancelReminderNotifications(reminder.notificationIds);
    const updated = await deleteReminder(reminder.id);
    updated.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    setReminders(updated);
  };

  const handleEdit = (reminder: Reminder) => {
    navigation.navigate('Add', { reminder });
  };

  const usedCategoryIds = [...new Set(reminders.map(r => r.category))];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.topbar}>
        <Text style={styles.title}>My Reminders</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('Add')}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <FilterChip
          label="All"
          active={filter === 'All'}
          onPress={() => setFilter('All')}
        />
        {usedCategoryIds.map(id => (
          <FilterChip
            key={id}
            label={CATEGORY_MAP[id]?.label ?? id}
            active={filter === id}
            onPress={() => setFilter(id as CategoryId)}
          />
        ))}
      </ScrollView>

      {/* List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState onAdd={() => navigation.navigate('Add')} />
        ) : (
          groups.map(group => (
            <View key={group.label}>
              <View style={styles.groupHeader}>
                <View style={[styles.groupDot, { backgroundColor: group.color }]} />
                <Text style={styles.groupLabel}>{group.label}</Text>
              </View>
              {group.items.map(r => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.75}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="notifications-off-outline" size={48} color={Colors.border} />
      <Text style={styles.emptyTitle}>No reminders here</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onAdd} activeOpacity={0.8}>
        <Ionicons name="add" size={16} color={Colors.white} />
        <Text style={styles.emptyBtnText}>Add reminder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  topbar:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  title:   { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  addBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center' },

  filterScroll:  { flexGrow: 0 },
  filterContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip:          { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive:    { backgroundColor: Colors.blue, borderColor: Colors.blue },
  chipText:      { fontSize: 12, color: Colors.textSecondary },
  chipTextActive:{ color: Colors.white, fontWeight: '600' },

  scroll:  { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },

  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14, marginBottom: 8 },
  groupDot:    { width: 8, height: 8, borderRadius: 4 },
  groupLabel:  { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  empty:       { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle:  { fontSize: 15, color: Colors.textSecondary },
  emptyBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.blue, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  emptyBtnText:{ fontSize: 14, fontWeight: '600', color: Colors.white },
});
