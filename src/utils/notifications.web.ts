import { Reminder } from '../types';

// Web stubs — expo-notifications is native-only and crashes on web at import time.

export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function scheduleReminderNotifications(
  _reminder: Reminder
): Promise<string[]> {
  return [];
}

export async function cancelReminderNotifications(
  _notificationIds: string[]
): Promise<void> {}

export async function cancelAllNotifications(): Promise<void> {}
