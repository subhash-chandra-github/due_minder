import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Reminder } from '../types';
import { Colors } from '../constants/colors';
import { CATEGORY_MAP } from '../constants/categories';
import { urgencyBarColor } from '../utils/urgency';
import CategoryIcon from './CategoryIcon';
import UrgencyBadge from './UrgencyBadge';

interface Props {
  reminder: Reminder;
  onPress?: (reminder: Reminder) => void;
  onDelete?: (reminder: Reminder) => void;
  onEdit?: (reminder: Reminder) => void;
}

export default function ReminderCard({ reminder, onPress, onDelete, onEdit }: Props) {
  const cat = CATEGORY_MAP[reminder.category];
  const barColor = urgencyBarColor(reminder.dueDate);

  const handleMenu = () => {
    Alert.alert(reminder.name, 'What would you like to do?', [
      { text: 'Cancel', style: 'cancel' },
      ...(onEdit ? [{ text: 'Edit', onPress: () => onEdit(reminder) }] : []),
      ...(onDelete ? [{
        text: 'Delete',
        style: 'destructive' as const,
        onPress: () => Alert.alert(
          'Delete Reminder',
          `Remove "${reminder.name}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete(reminder) },
          ]
        ),
      }] : []),
    ]);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress?.(reminder)}
      style={styles.card}
    >
      {/* Left urgency bar */}
      <View style={[styles.bar, { backgroundColor: barColor }]} />

      {/* Category icon */}
      <CategoryIcon categoryId={reminder.category} size={18} boxSize={38} />

      {/* Main info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {reminder.name}
        </Text>
        <Text style={styles.meta}>
          {format(parseISO(reminder.dueDate), 'd MMM yyyy')} ·{' '}
          {cat?.label ?? reminder.category} · {reminder.repeat}
        </Text>
        <UrgencyBadge dueDateISO={reminder.dueDate} />
      </View>

      {/* Amount (reference only) */}
      {reminder.amount ? (
        <View style={styles.right}>
          <Text style={styles.amount}>
            ₹{reminder.amount.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.amountSub}>reference</Text>
        </View>
      ) : null}

      {/* Three-dot menu */}
      <TouchableOpacity onPress={handleMenu} hitSlop={10} style={styles.menuBtn}>
        <Ionicons name="ellipsis-vertical" size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    gap: 11,
    paddingRight: 6,
    paddingVertical: 13,
  },
  menuBtn: {
    padding: 8,
  },
  bar: {
    width: 4,
    alignSelf: 'stretch',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  meta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  amountSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
