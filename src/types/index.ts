// ─── Reminder domain types ───────────────────────────────────────────────────

export type CategoryId =
  | 'cc'    // Credit Card
  | 'emi'   // EMI / Loan
  | 'ott'   // OTT Subscription
  | 'ins'   // Insurance
  | 'veh'   // Vehicle
  | 'rch'   // Recharge
  | 'util'  // Utilities
  | 'inv'   // Investment
  | 'custom';

export type RepeatType = 'monthly' | 'yearly' | 'weekly' | 'once';

export type NotifyBefore = 0 | 1 | 3 | 7;

export type UrgencyLevel = 'overdue' | 'urgent' | 'soon' | 'upcoming' | 'far';

export interface Reminder {
  id: string;
  name: string;
  category: CategoryId;
  amount?: number;          // optional — for reference display only, not tracking
  dueDate: string;          // ISO date string "YYYY-MM-DD"
  repeat: RepeatType;
  notifyBefore: NotifyBefore;
  notificationIds: string[]; // expo notification identifiers for cancellation
  createdAt: string;         // ISO datetime string
}

// ─── Category metadata ────────────────────────────────────────────────────────

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;       // Ionicons name
  color: string;      // icon / dot colour
  bgColor: string;    // icon background
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type RootTabParamList = {
  Home: undefined;
  Reminders: undefined;
  Add: { reminder?: Reminder } | undefined;
  Calendar: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  AddReminder: { reminderId?: string }; // optional id for edit mode
  ReminderDetail: { reminderId: string };
};
