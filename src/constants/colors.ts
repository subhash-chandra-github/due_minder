// ─── Brand palette ────────────────────────────────────────────────────────────

export const Colors = {
  // Primary — Blue
  blue: '#1565C0',
  blueMid: '#42A5F5',
  blueLight: '#E3F2FD',
  blueDark: '#0D47A1',

  // Success / Far — Green
  green: '#2E7D32',
  greenMid: '#66BB6A',
  greenLight: '#E8F5E9',

  // Warning / Soon — Yellow
  yellow: '#F9A825',
  yellowMid: '#FFD54F',
  yellowLight: '#FFFDE7',
  yellowDark: '#795500',

  // Danger / Overdue — Red
  red: '#C62828',
  redMid: '#EF5350',
  redLight: '#FFEBEE',

  // Neutrals
  white: '#FFFFFF',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  border: '#E0E0E0',
  borderLight: '#EEEEEE',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Category icon backgrounds
  catCC: '#E3F2FD',
  catEMI: '#E8F5E9',
  catOTT: '#FFF9C4',
  catIns: '#FCE4EC',
  catVeh: '#FBE9E7',
  catRch: '#F3E5F5',
  catUtil: '#E0F2F1',
  catInv: '#FFF3E0',
  catCustom: '#F5F5F5',

  // Category icon colours
  iconCC: '#1565C0',
  iconEMI: '#2E7D32',
  iconOTT: '#F57F17',
  iconIns: '#880E4F',
  iconVeh: '#BF360C',
  iconRch: '#6A1B9A',
  iconUtil: '#004D40',
  iconInv: '#E65100',
  iconCustom: '#546E7A',
} as const;

// ─── Urgency colour map ───────────────────────────────────────────────────────

export const UrgencyColors = {
  overdue: Colors.red,
  urgent:  Colors.red,
  soon:    Colors.yellow,
  upcoming: Colors.blue,
  far:     Colors.green,
} as const;

export const UrgencyBgColors = {
  overdue: Colors.redLight,
  urgent:  Colors.redLight,
  soon:    Colors.yellowLight,
  upcoming: Colors.blueLight,
  far:     Colors.greenLight,
} as const;

export const UrgencyTextColors = {
  overdue: Colors.red,
  urgent:  Colors.red,
  soon:    Colors.yellowDark,
  upcoming: Colors.blue,
  far:     Colors.green,
} as const;
