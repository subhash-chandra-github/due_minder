# DueMinder

> Your personal recurring payment & renewal reminder app — India-first, privacy-first.

DueMinder is a mobile productivity app that helps individuals and small businesses stay on top of recurring payments, subscriptions, and renewals — so nothing slips through the cracks.

Users add due dates for bills, insurance, memberships, or any time-sensitive obligation. The app automatically sends local push notifications in advance, color-codes items by urgency, and organizes everything by category — all without an account, internet connection, or subscription fee.

Key value props:

Never miss a payment or renewal deadline
Works fully offline — no data leaves the device
Instant setup with no login required
Visual urgency system (overdue → urgent → soon → upcoming) for at-a-glance prioritization
Target users: Anyone managing recurring personal or business expenses — freelancers, households, small business owners — who want a lightweight, private alternative to calendar reminders or spreadsheets.

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
due_minder/
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
cd due_minder
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

### 3 — Run on physical device (Development)

This mode requires your phone and Mac to be on the **same WiFi network**. The app fetches the JS bundle from Metro running on your Mac.

**Step 1 — Start Metro (keep this terminal running)**
```bash
npx expo start
```

**Step 2 — Open Xcode from the project**
```bash
open ios/dueminder.xcworkspace
```

**Step 3 — In Xcode:** Select your iPhone as the target device → press **Run (▶)**

> The app will stop working if you kill it and relaunch while Metro is not running, or if your phone leaves the WiFi network.

---

### 4 — Run on physical device (Standalone / Release)

Use this when you want the app to work **without your Mac** — no Metro, no WiFi required. The JS bundle is compiled into the app itself.

**Step 1 — Plug in your iPhone via USB**

**Step 2 — Build and install**
```bash
npx expo run:ios --configuration Release --device
```

This takes 5–10 minutes. Once installed, the app runs independently — disconnect from Mac, switch networks, kill and relaunch freely.

---

### Fixing "No bundle URL present" error (iOS)

This error means the app cannot reach the Metro bundler. Follow these steps in order:

**Step 1 — Clear DerivedData (Xcode cache)**
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```

**Step 2 — Start Metro**
```bash
npx expo start
```

**Step 3 — Open Xcode**
```bash
open ios/dueminder.xcworkspace
```

**Step 4 — In Xcode:** `Product → Clean Build Folder` (⇧⌘K) → press **Run (▶)**

> Common causes: Mac's IP address changed, directory was renamed, or Xcode was opened before Metro was running.

---

## Android — Running on Physical Device

### Prerequisites
- Android Studio installed ([download here](https://developer.android.com/studio))
- USB debugging enabled on your Android phone:
  - Go to **Settings → About Phone**
  - Tap **Build Number** 7 times to unlock Developer Options
  - Go to **Settings → Developer Options** → enable **USB Debugging**

---

### 5 — Run on Android device (Development)

This mode requires your phone and Mac to be on the **same WiFi network**. The app fetches the JS bundle from Metro running on your Mac.

**Step 1 — Plug in your Android phone via USB**

**Step 2 — Verify device is detected**
```bash
adb devices
```
You should see your device listed. If not, check USB debugging is enabled and try a different cable.

**Step 3 — Start Metro (keep this terminal running)**
```bash
npx expo start
```

**Step 4 — In the Metro terminal, press `a`** to build and launch on your Android device.

Or run directly:
```bash
npx expo run:android --device
```

> The app will stop working if you kill it and relaunch while Metro is not running, or if your phone leaves the WiFi network.

---

### 6 — Run on Android device (Standalone / Release)

Use this when you want the app to work **without your Mac** — no Metro, no WiFi required. The JS bundle is compiled into the APK itself.

**Step 1 — Plug in your Android phone via USB**

**Step 2 — Build and install**
```bash
npx expo run:android --variant release --device
```

This takes 5–10 minutes. Once installed, the app runs independently — disconnect from Mac, switch networks, kill and relaunch freely.

---

### Fixing common Android errors

**"adb: no devices/emulators found"**
- Make sure USB debugging is enabled (see Prerequisites above)
- Try a different USB cable (some cables are charge-only)
- Run `adb kill-server && adb start-server` then replug the phone

**"Could not connect to development server"**
- Make sure Metro is running (`npx expo start`)
- Make sure phone and Mac are on the same WiFi
- Try shaking the phone → **Dev Settings** → **Debug server host** → enter your Mac's IP and port `8081` (e.g. `192.168.1.5:8081`)
  - Find your Mac's IP: `ipconfig getifaddr en0`

**Build fails with Gradle error**
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android --device
```

---

## Build for Production

### Android APK (local build)
```bash
npx expo run:android --variant release
```

### iOS (requires Apple Developer account)
```bash
npx expo run:ios --configuration Release --device
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
