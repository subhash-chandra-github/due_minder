import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { format } from 'date-fns';

import { Colors } from '../constants/colors';
import { CATEGORIES, REPEAT_OPTIONS, NOTIFY_OPTIONS } from '../constants/categories';
import { CategoryId, RepeatType, NotifyBefore, Reminder } from '../types';
import { addReminder, updateReminder } from '../storage/reminderStorage';
import {
  requestNotificationPermission,
  scheduleReminderNotifications,
  cancelReminderNotifications,
} from '../utils/notifications';
import CategoryIcon from '../components/CategoryIcon';

// ─── Simple inline date input (no extra package needed) ──────────────────────

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  // value format: YYYY-MM-DD
  const [dd, mm, yyyy] = value
    ? [value.slice(8, 10), value.slice(5, 7), value.slice(0, 4)]
    : ['', '', ''];

  const commit = (d: string, m: string, y: string) => {
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      onChange(`${y}-${m}-${d}`);
    }
  };

  return (
    <View style={dateStyles.row}>
      <TextInput
        style={[dateStyles.input, { flex: 1 }]}
        placeholder="DD"
        placeholderTextColor={Colors.textMuted}
        keyboardType="number-pad"
        maxLength={2}
        defaultValue={dd}
        onChangeText={d => commit(d, mm, yyyy)}
      />
      <Text style={dateStyles.sep}>/</Text>
      <TextInput
        style={[dateStyles.input, { flex: 1 }]}
        placeholder="MM"
        placeholderTextColor={Colors.textMuted}
        keyboardType="number-pad"
        maxLength={2}
        defaultValue={mm}
        onChangeText={m => commit(dd, m, yyyy)}
      />
      <Text style={dateStyles.sep}>/</Text>
      <TextInput
        style={[dateStyles.input, { flex: 2 }]}
        placeholder="YYYY"
        placeholderTextColor={Colors.textMuted}
        keyboardType="number-pad"
        maxLength={4}
        defaultValue={yyyy}
        onChangeText={y => commit(dd, mm, y)}
      />
    </View>
  );
}

const dateStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: { backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 15, color: Colors.textPrimary, textAlign: 'center' },
  sep:   { fontSize: 16, color: Colors.textMuted, fontWeight: '600' },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function AddReminderScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const today = format(new Date(), 'yyyy-MM-dd');

  const [name, setName]                         = useState('');
  const [amount, setAmount]                     = useState('');
  const [category, setCategory]                 = useState<CategoryId>('cc');
  const [dueDate, setDueDate]                   = useState(today);
  const [repeat, setRepeat]                     = useState<RepeatType>('monthly');
  const [notify, setNotify]                     = useState<NotifyBefore>(3);
  const [saving, setSaving]                     = useState(false);
  const [editingReminder, setEditingReminder]   = useState<Reminder | null>(null);

  useFocusEffect(useCallback(() => {
    const reminder: Reminder | undefined = route.params?.reminder;
    if (reminder) {
      setName(reminder.name);
      setAmount(reminder.amount?.toString() ?? '');
      setCategory(reminder.category);
      setDueDate(reminder.dueDate);
      setRepeat(reminder.repeat);
      setNotify(reminder.notifyBefore);
      setEditingReminder(reminder);
      navigation.setParams({ reminder: undefined });
    }
  }, [route.params?.reminder])); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setName('');
    setAmount('');
    setCategory('cc');
    setDueDate(format(new Date(), 'yyyy-MM-dd'));
    setRepeat('monthly');
    setNotify(3);
    setEditingReminder(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a reminder name.');
      return;
    }
    if (!dueDate || dueDate.length !== 10) {
      Alert.alert('Invalid date', 'Please enter a valid due date (DD/MM/YYYY).');
      return;
    }

    setSaving(true);
    try {
      const permitted = await requestNotificationPermission();

      if (editingReminder) {
        await cancelReminderNotifications(editingReminder.notificationIds);
        const updated: Reminder = {
          ...editingReminder,
          name: name.trim(),
          category,
          amount: amount ? parseInt(amount, 10) : undefined,
          dueDate,
          repeat,
          notifyBefore: notify,
          notificationIds: [],
        };
        if (permitted) {
          updated.notificationIds = await scheduleReminderNotifications(updated);
        }
        await updateReminder(updated);
      } else {
        const reminder: Reminder = {
          id: Crypto.randomUUID(),
          name: name.trim(),
          category,
          amount: amount ? parseInt(amount, 10) : undefined,
          dueDate,
          repeat,
          notifyBefore: notify,
          notificationIds: [],
          createdAt: new Date().toISOString(),
        };
        if (permitted) {
          reminder.notificationIds = await scheduleReminderNotifications(reminder);
        }
        await addReminder(reminder);
      }

      resetForm();
      navigation.navigate('Reminders');
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.topbar}>
          <Text style={styles.title}>{editingReminder ? 'Edit Reminder' : 'New Reminder'}</Text>
          <TouchableOpacity onPress={() => { resetForm(); navigation.navigate('Reminders'); }}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Category ── */}
          <FormSection label="Category">
            <View style={styles.catGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catBtn,
                    category === cat.id && styles.catBtnActive,
                  ]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.75}
                >
                  <CategoryIcon
                    categoryId={cat.id}
                    size={16}
                    boxSize={34}
                    borderRadius={8}
                  />
                  <Text style={styles.catLabel} numberOfLines={1}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormSection>

          {/* ── Name ── */}
          <FormSection label="Reminder name">
            <TextInput
              style={styles.input}
              placeholder="e.g. HDFC Card, Netflix, Car EMI"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />
          </FormSection>

          {/* ── Amount ── */}
          <FormSection label="Amount (₹) — optional, for reference only">
            <TextInput
              style={styles.input}
              placeholder="Leave blank if not applicable"
              placeholderTextColor={Colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
            />
          </FormSection>

          {/* ── Due date ── */}
          <FormSection label="Due date">
            <DateInput value={dueDate} onChange={setDueDate} />
            <Text style={styles.inputHint}>
              This app only sets reminders — it does not track actual payments.
            </Text>
          </FormSection>

          {/* ── Repeat ── */}
          <FormSection label="Repeat">
            <View style={styles.optionGrid}>
              {REPEAT_OPTIONS.map(opt => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  active={repeat === opt.value}
                  onPress={() => setRepeat(opt.value as RepeatType)}
                />
              ))}
            </View>
          </FormSection>

          {/* ── Notify before ── */}
          <FormSection label="Notify me before">
            <View style={styles.optionGrid}>
              {NOTIFY_OPTIONS.map(opt => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  active={notify === opt.value}
                  onPress={() => setNotify(opt.value as NotifyBefore)}
                />
              ))}
            </View>
          </FormSection>

          {/* ── Info banner ── */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.blue} />
            <Text style={styles.infoText}>
              You'll get a push notification {notify === 0 ? 'on the due date' : `${notify} day${notify > 1 ? 's' : ''} before`} at 9:00 AM.
            </Text>
          </View>

          {/* ── Save button ── */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="notifications" size={18} color={Colors.white} />
                <Text style={styles.saveBtnText}>{editingReminder ? 'Update Reminder' : 'Set Reminder'}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function OptionButton({
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
      style={[styles.optBtn, active && styles.optBtnActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.optBtnText, active && styles.optBtnTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  topbar:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title:   { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 120 },

  section:      { marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },

  input:     { backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary },
  inputHint: { fontSize: 11, color: Colors.textMuted, marginTop: 6 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn:  { alignItems: 'center', gap: 5, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surface, minWidth: 68 },
  catBtnActive: { borderColor: Colors.blue, backgroundColor: Colors.blueLight },
  catLabel:{ fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },

  optionGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optBtn:        { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  optBtnActive:  { borderColor: Colors.blue, backgroundColor: Colors.blueLight },
  optBtnText:    { fontSize: 13, color: Colors.textSecondary },
  optBtnTextActive: { color: Colors.blue, fontWeight: '600' },

  infoBanner: { flexDirection: 'row', gap: 8, backgroundColor: Colors.blueLight, borderRadius: 10, padding: 12, marginBottom: 20, alignItems: 'flex-start' },
  infoText:   { fontSize: 12, color: Colors.blue, flex: 1, lineHeight: 18 },

  saveBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.blue, borderRadius: 14, paddingVertical: 15, marginBottom: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
