import { Category } from '../types';
import { Colors } from './colors';

export const CATEGORIES: Category[] = [
  {
    id: 'cc',
    label: 'Credit Card',
    icon: 'card-outline',
    color: Colors.iconCC,
    bgColor: Colors.catCC,
  },
  {
    id: 'emi',
    label: 'EMI / Loan',
    icon: 'business-outline',
    color: Colors.iconEMI,
    bgColor: Colors.catEMI,
  },
  {
    id: 'ott',
    label: 'OTT',
    icon: 'tv-outline',
    color: Colors.iconOTT,
    bgColor: Colors.catOTT,
  },
  {
    id: 'ins',
    label: 'Insurance',
    icon: 'shield-checkmark-outline',
    color: Colors.iconIns,
    bgColor: Colors.catIns,
  },
  {
    id: 'veh',
    label: 'Vehicle',
    icon: 'car-outline',
    color: Colors.iconVeh,
    bgColor: Colors.catVeh,
  },
  {
    id: 'rch',
    label: 'Recharge',
    icon: 'phone-portrait-outline',
    color: Colors.iconRch,
    bgColor: Colors.catRch,
  },
  {
    id: 'util',
    label: 'Utilities',
    icon: 'flash-outline',
    color: Colors.iconUtil,
    bgColor: Colors.catUtil,
  },
  {
    id: 'inv',
    label: 'Invest',
    icon: 'trending-up-outline',
    color: Colors.iconInv,
    bgColor: Colors.catInv,
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: 'ellipsis-horizontal-outline',
    color: Colors.iconCustom,
    bgColor: Colors.catCustom,
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<string, Category>;

export const REPEAT_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly',  label: 'Weekly'  },
  { value: 'yearly',  label: 'Yearly'  },
  { value: 'once',    label: 'One-time'},
] as const;

export const NOTIFY_OPTIONS = [
  { value: 0, label: 'On due date'  },
  { value: 1, label: '1 day before' },
  { value: 3, label: '3 days before'},
  { value: 7, label: '7 days before'},
] as const;
