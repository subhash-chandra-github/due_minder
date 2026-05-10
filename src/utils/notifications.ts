import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { parseISO, subDays, set } from 'date-fns';
import { Reminder } from '../types';
import { CATEGORY_MAP } from '../constants/categories';

// ─── Setup notification handler (native only) ─────────────────────────────────
// expo-notifications initialises a native EventEmitter at module load time;
// calling setNotificationHandler on web crashes before React even mounts.

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// ─── Permission request ───────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  if (!Device.isDevice) {
    return true;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1565C0',
      sound: 'default',
    });
  }

  return true;
}

// ─── Schedule notifications for a reminder ───────────────────────────────────

export async function scheduleReminderNotifications(
  reminder: Reminder
): Promise<string[]> {
  if (Platform.OS === 'web') return [];

  const ids: string[] = [];
  const cat = CATEGORY_MAP[reminder.category];
  const categoryLabel = cat?.label ?? 'Reminder';
  const amountStr = reminder.amount
    ? ` — ₹${reminder.amount.toLocaleString('en-IN')}`
    : '';

  const dueDate = parseISO(reminder.dueDate);

  if (reminder.notifyBefore > 0) {
    const notifyDate = subDays(dueDate, reminder.notifyBefore);
    const trigger = set(notifyDate, { hours: 9, minutes: 0, seconds: 0 });

    if (trigger > new Date()) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${reminder.name}${amountStr}`,
          body: `${categoryLabel} due in ${reminder.notifyBefore} day${reminder.notifyBefore > 1 ? 's' : ''}. Tap to review.`,
          data: { reminderId: reminder.id },
          sound: 'default',
        },
        trigger: { date: trigger, channelId: 'reminders' } as any,
      });
      ids.push(id);
    }
  }

  const dueDayTrigger = set(dueDate, { hours: 9, minutes: 0, seconds: 0 });
  if (dueDayTrigger > new Date()) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔔 ${reminder.name} is due today${amountStr}`,
        body: `Your ${categoryLabel.toLowerCase()} reminder is due today. Don't forget!`,
        data: { reminderId: reminder.id },
        sound: 'default',
      },
      trigger: { date: dueDayTrigger, channelId: 'reminders' } as any,
    });
    ids.push(id);
  }

  return ids;
}

// ─── Cancel notifications for a reminder ─────────────────────────────────────

export async function cancelReminderNotifications(
  notificationIds: string[]
): Promise<void> {
  if (Platform.OS === 'web') return;
  await Promise.all(
    notificationIds.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id)
    )
  );
}

// ─── Cancel all app notifications ────────────────────────────────────────────

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
