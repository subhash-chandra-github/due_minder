# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start          # Start Expo dev server (then press a/i/w for Android/iOS/web)
npx expo start --android
npx expo start --ios
npm run lint            # ESLint on .ts/.tsx files

# Production builds
npx expo run:android --variant release
npx expo run:ios --configuration Release
# EAS (cloud builds for distribution):
# eas build --platform android
```

No test suite is configured. There is no build step — Expo handles transpilation via Metro.

## Architecture

**DueMinder** is an offline-first React Native app (Expo SDK 51, TypeScript) for scheduling payment/renewal reminders. All data lives on-device in AsyncStorage. There is no backend, no auth, and no network dependency.

### Data flow

1. User fills [AddReminderScreen](src/screens/AddReminderScreen.tsx) → creates a `Reminder` object using `expo-crypto` `randomUUID()`
2. `scheduleReminderNotifications()` is called → returns expo notification IDs → stored on `reminder.notificationIds`
3. `addReminder()` persists the full reminder array to AsyncStorage under key `@dueminder:reminders_v1`
4. All screens call `loadReminders()` on mount (via `useFocusEffect`) to read the array

### Key files and their roles

| File | Role |
|------|------|
| [src/types/index.ts](src/types/index.ts) | Single source of truth for all domain types (`Reminder`, `CategoryId`, `UrgencyLevel`, nav param lists) |
| [src/constants/colors.ts](src/constants/colors.ts) | All colors + urgency→color maps (`UrgencyColors`, `UrgencyBgColors`, `UrgencyTextColors`) |
| [src/constants/categories.ts](src/constants/categories.ts) | `CATEGORIES` array, `CATEGORY_MAP` lookup, `REPEAT_OPTIONS`, `NOTIFY_OPTIONS` |
| [src/storage/reminderStorage.ts](src/storage/reminderStorage.ts) | AsyncStorage CRUD (`loadReminders`, `addReminder`, `updateReminder`, `deleteReminder`, `clearAllReminders`) — always loads/saves the full array |
| [src/utils/urgency.ts](src/utils/urgency.ts) | `daysUntil()`, `getUrgency()`, `urgencyLabel()`, urgency color helpers, `nextDueDate()` |
| [src/utils/notifications.ts](src/utils/notifications.ts) | `scheduleReminderNotifications()`, `cancelReminderNotifications()`, `cancelAllNotifications()` |
| [src/navigation/TabNavigator.tsx](src/navigation/TabNavigator.tsx) | Custom tab bar with a floating-action-button Add tab |

### Urgency system

`getUrgency(dueDateISO)` maps days-until to `UrgencyLevel`:
- `< 0` → `overdue` (red)
- `0–3` → `urgent` (red)
- `4–7` → `soon` (yellow)
- `8–14` → `upcoming` (blue)
- `> 14` → `far` (green)

### Notification scheduling

`scheduleReminderNotifications()` always fires at **9:00 AM**:
- If `notifyBefore > 0`: one notification at 9 AM on `dueDate - notifyBefore days`
- Always: one "due today" notification at 9 AM on `dueDate`

On Android, notifications go through the `reminders` channel (HIGH importance). On iOS, permissions are requested at first launch. The returned IDs are stored on `Reminder.notificationIds` so they can be cancelled when a reminder is deleted or edited.

### Web platform support

`expo-notifications` crashes at import time on web. The `.web.ts` file extension convention provides no-op stubs: [src/utils/notifications.web.ts](src/utils/notifications.web.ts) exports the same API with empty implementations. Metro resolves `.web.ts` over `.ts` automatically when bundling for web. `App.tsx` also guards `expo-notifications` behind a `require()` inside a `Platform.OS !== 'web'` check.

### Edit flow

Edit is fully wired up via the tab navigator. `HomeScreen` and `RemindersScreen` pass a `reminder` object through `navigation.navigate('Add', { reminder })`. `AddReminderScreen` reads it in `useFocusEffect`, populates the form, and calls `updateReminder()` (after cancelling old notification IDs and rescheduling).

### What is not yet implemented (Phase 2 roadmap)

- **Repeat auto-advance** — `nextDueDate()` in urgency.ts is implemented but no screen calls it to advance a reminder after a cycle completes
- `ReminderDetail` screen referenced in `RootStackParamList` does not exist yet
