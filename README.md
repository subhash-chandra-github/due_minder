# DueMinder

> Your personal recurring payment & renewal reminder app — India-first, privacy-first.

**This app only sets reminders. It does not track actual payments.**

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native + Expo (SDK 51) |
| Language | TypeScript |
| Navigation | React Navigation v6 (Bottom Tabs) |
| Storage | AsyncStorage (offline, on-device) |
| Notifications | expo-notifications |
| Date handling | date-fns |

## Urgency Colour System

| Colour | Meaning |
|---|---|
| Red | Overdue or due within 3 days |
| Yellow | Due within 4–7 days |
| Blue | Due within 8–14 days |
| Green | Due more than 14 days away |

---

## Project Structure

```
DueMinder/
├── App.tsx                          # Root entry — navigation + notification listeners
├── app.json                         # Expo config
├── package.json
├── tsconfig.json
└── src/
    ├── types/
    │   └── index.ts                 # Reminder, Category, Nav types
    ├── constants/
    │   ├── colors.ts                # Full colour palette + urgency maps
    │   └── categories.ts            # 9 categories + repeat/notify options
    ├── utils/
    │   ├── urgency.ts               # daysUntil(), getUrgency(), labels
    │   └── notifications.ts         # Schedule / cancel expo notifications
    ├── storage/
    │   └── reminderStorage.ts       # AsyncStorage CRUD
    ├── components/
    │   ├── CategoryIcon.tsx         # Coloured icon box per category
    │   ├── UrgencyBadge.tsx         # Coloured pill (e.g. "In 3 days")
    │   └── ReminderCard.tsx         # Full reminder list item card
    ├── navigation/
    │   └── TabNavigator.tsx         # Bottom tab bar with FAB Add button
    └── screens/
        ├── HomeScreen.tsx           # Dashboard: hero stats + upcoming list
        ├── RemindersScreen.tsx      # Full list with category filter + urgency groups
        ├── AddReminderScreen.tsx    # Add & edit form (category, name, amount, date, repeat, notify)
        ├── CalendarScreen.tsx       # Monthly calendar + event list
        └── ProfileScreen.tsx        # Settings, notification toggle, clear data
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- For iOS: Xcode + iOS Simulator (macOS only)
- For Android: Android Studio + emulator, or a physical device

### 1 — Install

```bash
cd DueMinder
npm install
```

### 2 — Run

```bash
# Start Expo development server
npx expo start

# Then press:
# a — open Android emulator
# i — open iOS simulator
# w — open in browser (limited notification support)
```

### 3 — Run on physical device

```bash
# Install Expo Go on your phone from the App Store / Play Store
# Scan the QR code shown in the terminal
npx expo start
```

---

## Build for Production

### Android APK (local build)
```bash
npx expo run:android --variant release
```

### iOS (requires Apple Developer account)
```bash
npx expo run:ios --configuration Release
```

### EAS Build (recommended for distribution)
```bash
npm install -g eas-cli
eas login
eas build --platform android  # or ios / all
```

---

## Features

### Reminder categories
`Credit Card` · `EMI/Loan` · `OTT` · `Insurance` · `Vehicle` · `Recharge` · `Utilities` · `Investment` · `Custom`

### Repeat options
`Monthly` · `Weekly` · `Yearly` · `One-time`

### Notify before
`On due date` · `1 day before` · `3 days before` · `7 days before`

### Notification schedule
A notification fires at **9:00 AM** on the notify day. If notify-before > 0, a second notification also fires at **9:00 AM on the actual due date**.

---

## Future Roadmap (Phase 2)

- [ ] Repeat auto-advance (auto-set next month's due date after a cycle completes)
- [ ] SMS auto-detection (opt-in, on-device)
- [ ] Dark mode
- [ ] Google Drive / iCloud backup
- [ ] Widget for home screen
- [ ] AI insights ("You have ₹8,000 due next week")

---

## Privacy

- **Zero data collection.** Everything is stored in `AsyncStorage` on your device.
- No bank login required.
- No internet connection needed.
- Amount fields are for your reference only — the app never tracks payments.

---

## License

MIT — free to use and modify.
