import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
  parseISO,
  isSameDay,
} from 'date-fns';

import { Colors } from '../constants/colors';
import { CATEGORY_MAP } from '../constants/categories';
import { Reminder } from '../types';
import { loadReminders } from '../storage/reminderStorage';
import { getUrgency, urgencyBarColor } from '../utils/urgency';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reminders, setReminders]     = useState<Reminder[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadReminders().then(data => {
        data.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        setReminders(data);
      });
    }, [])
  );

  const changeMonth = (dir: 1 | -1) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
    setSelectedDay(null);
  };

  // Build calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(currentDate);
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad   = getDay(monthStart); // 0=Sun

  // Map dueDate → reminders for O(1) lookup
  const dueDateMap: Record<string, Reminder[]> = {};
  reminders.forEach(r => {
    const key = r.dueDate; // YYYY-MM-DD
    if (!dueDateMap[key]) dueDateMap[key] = [];
    dueDateMap[key].push(r);
  });

  const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');

  const remindersForSelectedDay = selectedDay
    ? (dueDateMap[dayKey(selectedDay)] ?? [])
    : [];

  // All reminders in current month for the list below
  const monthReminders = reminders.filter(r => {
    const due = parseISO(r.dueDate);
    return isSameMonth(due, currentDate);
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topbar}>
          <Text style={styles.title}>Calendar</Text>
        </View>

        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(-1)} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {format(currentDate, 'MMMM yyyy')}
          </Text>
          <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(1)} hitSlop={8}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Day labels */}
        <View style={styles.dayLabels}>
          {DAY_LABELS.map(d => (
            <Text key={d} style={styles.dayLabel}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calGrid}>
          {/* Padding cells */}
          {Array.from({ length: startPad }).map((_, i) => (
            <View key={`pad-${i}`} style={styles.calCell} />
          ))}

          {days.map(day => {
            const key    = dayKey(day);
            const list   = dueDateMap[key] ?? [];
            const isT    = isToday(day);
            const isSel  = selectedDay ? isSameDay(day, selectedDay) : false;

            // Determine dot colour (most urgent of the day)
            let dotColor: string | null = null;
            if (list.length > 0) {
              const urg = getUrgency(key);
              dotColor = urgencyBarColor(key);
            }

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.calCell,
                  isT   && styles.calCellToday,
                  isSel && styles.calCellSelected,
                ]}
                onPress={() => setSelectedDay(isSel ? null : day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.calCellText,
                    isT   && styles.calCellTextToday,
                    isSel && styles.calCellTextSelected,
                  ]}
                >
                  {format(day, 'd')}
                </Text>
                {dotColor && (
                  <View style={[styles.dot, { backgroundColor: dotColor }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected day detail */}
        {selectedDay && (
          <View style={styles.selectedCard}>
            <Text style={styles.selectedTitle}>
              {format(selectedDay, 'd MMMM yyyy')}
            </Text>
            {remindersForSelectedDay.length === 0 ? (
              <Text style={styles.selectedEmpty}>No reminders on this day</Text>
            ) : (
              remindersForSelectedDay.map(r => (
                <EventRow key={r.id} reminder={r} />
              ))
            )}
          </View>
        )}

        {/* Month event list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {format(currentDate, 'MMMM')} schedule
          </Text>
          <Text style={styles.sectionCount}>{monthReminders.length} reminders</Text>
        </View>

        {monthReminders.length === 0 ? (
          <Text style={styles.noMonthEvents}>No reminders this month</Text>
        ) : (
          monthReminders.map(r => <EventRow key={r.id} reminder={r} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EventRow({ reminder }: { reminder: Reminder }) {
  const cat    = CATEGORY_MAP[reminder.category];
  const dotCol = urgencyBarColor(reminder.dueDate);

  return (
    <View style={styles.eventRow}>
      <View style={[styles.eventDot, { backgroundColor: dotCol }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.eventName} numberOfLines={1}>{reminder.name}</Text>
        <Text style={styles.eventMeta}>
          {format(parseISO(reminder.dueDate), 'd MMM')} · {cat?.label ?? reminder.category} · {reminder.repeat}
        </Text>
      </View>
      {reminder.amount ? (
        <Text style={styles.eventAmount}>
          ₹{reminder.amount.toLocaleString('en-IN')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 30 },

  topbar:  { paddingTop: 8, paddingBottom: 10 },
  title:   { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },

  monthNav:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  navBtn:    { padding: 6, borderRadius: 8, backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border },
  monthTitle:{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  dayLabels: { flexDirection: 'row', marginBottom: 4 },
  dayLabel:  { flex: 1, textAlign: 'center', fontSize: 11, color: Colors.textMuted, fontWeight: '600' },

  calGrid:  { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  calCell:  { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, position: 'relative' },
  calCellToday:    { backgroundColor: Colors.blueLight },
  calCellSelected: { backgroundColor: Colors.blue },
  calCellText:     { fontSize: 13, color: Colors.textPrimary },
  calCellTextToday:{ color: Colors.blue, fontWeight: '700' },
  calCellTextSelected: { color: Colors.white, fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 4 },

  selectedCard:  { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 0.5, borderColor: Colors.border, padding: 14, marginBottom: 16 },
  selectedTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  selectedEmpty: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', paddingVertical: 8 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 },
  sectionTitle:  { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  sectionCount:  { fontSize: 12, color: Colors.textSecondary },
  noMonthEvents: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', paddingVertical: 20 },

  eventRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight },
  eventDot:   { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  eventName:  { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  eventMeta:  { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  eventAmount:{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
});
