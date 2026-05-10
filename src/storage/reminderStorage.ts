import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '../types';

const STORAGE_KEY = '@dueminder:reminders_v1';

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function loadReminders(): Promise<Reminder[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Reminder[];
  } catch (e) {
    console.error('loadReminders error', e);
    return [];
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('saveReminders error', e);
  }
}

// ─── Add ──────────────────────────────────────────────────────────────────────

export async function addReminder(reminder: Reminder): Promise<Reminder[]> {
  const all = await loadReminders();
  const updated = [...all, reminder];
  await saveReminders(updated);
  return updated;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateReminder(
  updated: Reminder
): Promise<Reminder[]> {
  const all = await loadReminders();
  const next = all.map((r) => (r.id === updated.id ? updated : r));
  await saveReminders(next);
  return next;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteReminder(id: string): Promise<Reminder[]> {
  const all = await loadReminders();
  const next = all.filter((r) => r.id !== id);
  await saveReminders(next);
  return next;
}

// ─── Clear all ────────────────────────────────────────────────────────────────

export async function clearAllReminders(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
