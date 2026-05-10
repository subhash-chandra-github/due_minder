import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';
import { UrgencyLevel } from '../types';
import {
  UrgencyColors,
  UrgencyBgColors,
  UrgencyTextColors,
} from '../constants/colors';

/**
 * Returns the number of days until the given ISO date string.
 * Negative = overdue.
 */
export function daysUntil(dueDateISO: string): number {
  const today = startOfDay(new Date());
  const due = startOfDay(parseISO(dueDateISO));
  return differenceInCalendarDays(due, today);
}

/**
 * Maps days-until value to an urgency level.
 */
export function getUrgency(dueDateISO: string): UrgencyLevel {
  const diff = daysUntil(dueDateISO);
  if (diff < 0)  return 'overdue';
  if (diff <= 3) return 'urgent';
  if (diff <= 7) return 'soon';
  if (diff <= 14) return 'upcoming';
  return 'far';
}

/**
 * Human-readable label for how far the due date is.
 */
export function urgencyLabel(dueDateISO: string): string {
  const diff = daysUntil(dueDateISO);
  if (diff < 0)  return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Tomorrow';
  if (diff <= 7)  return `In ${diff} days`;
  if (diff <= 14) return `In ${diff} days`;
  return `In ${diff} days`;
}

export function urgencyBarColor(dueDateISO: string): string {
  return UrgencyColors[getUrgency(dueDateISO)];
}

export function urgencyBadgeBg(dueDateISO: string): string {
  return UrgencyBgColors[getUrgency(dueDateISO)];
}

export function urgencyBadgeText(dueDateISO: string): string {
  return UrgencyTextColors[getUrgency(dueDateISO)];
}

/**
 * Computes the next due date ISO string for a repeating reminder.
 * Used when advancing a reminder after the current cycle passes.
 */
export function nextDueDate(
  dueDateISO: string,
  repeat: 'monthly' | 'yearly' | 'weekly' | 'once'
): string {
  const due = parseISO(dueDateISO);
  if (repeat === 'monthly') {
    due.setMonth(due.getMonth() + 1);
  } else if (repeat === 'yearly') {
    due.setFullYear(due.getFullYear() + 1);
  } else if (repeat === 'weekly') {
    due.setDate(due.getDate() + 7);
  }
  return due.toISOString().split('T')[0];
}
