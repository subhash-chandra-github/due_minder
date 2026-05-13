import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Reminder } from '../types';
import { Colors } from '../constants/colors';
import { CATEGORY_MAP } from '../constants/categories';
import { urgencyBarColor, daysUntil } from '../utils/urgency';
import CategoryIcon from './CategoryIcon';
import UrgencyBadge from './UrgencyBadge';

interface Props {
  reminder: Reminder;
  onPress?: (reminder: Reminder) => void;
  onDelete?: (reminder: Reminder) => void;
  onEdit?: (reminder: Reminder) => void;
  onMarkPaid?: (reminder: Reminder) => void;
}

export default function ReminderCard({ reminder, onPress, onDelete, onEdit, onMarkPaid }: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirm, setConfirm] = useState<'paid' | 'delete' | null>(null);

  const cat = CATEGORY_MAP[reminder.category];
  const barColor = urgencyBarColor(reminder.dueDate);
  const canMarkPaid = onMarkPaid && daysUntil(reminder.dueDate) <= 0;

  const closeMenu = () => setMenuVisible(false);

  const handleMarkPaidPress = () => {
    closeMenu();
    setTimeout(() => setConfirm('paid'), 150);
  };

  const handleDeletePress = () => {
    closeMenu();
    setTimeout(() => setConfirm('delete'), 150);
  };

  const handleConfirmPaid = () => {
    setConfirm(null);
    onMarkPaid?.(reminder);
  };

  const handleConfirmDelete = () => {
    setConfirm(null);
    onDelete?.(reminder);
  };

  return (
    <>
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
        <TouchableOpacity onPress={() => setMenuVisible(true)} hitSlop={10} style={styles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* ── Action sheet ──────────────────────────────────────────────── */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Title */}
            <Text style={styles.sheetTitle} numberOfLines={1}>{reminder.name}</Text>
            <Text style={styles.sheetSub}>What would you like to do?</Text>

            <View style={styles.divider} />

            {/* Mark as Paid */}
            {canMarkPaid && (
              <TouchableOpacity style={styles.actionRow} onPress={handleMarkPaidPress} activeOpacity={0.7}>
                <View style={[styles.actionIcon, { backgroundColor: Colors.greenLight }]}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
                </View>
                <Text style={[styles.actionLabel, { color: Colors.green }]}>Mark as Paid</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}

            {/* Edit */}
            {onEdit && (
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => { closeMenu(); onEdit(reminder); }}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: Colors.blueLight }]}>
                  <Ionicons name="pencil" size={18} color={Colors.blue} />
                </View>
                <Text style={[styles.actionLabel, { color: Colors.textPrimary }]}>Edit</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}

            {/* Delete */}
            {onDelete && (
              <TouchableOpacity style={styles.actionRow} onPress={handleDeletePress} activeOpacity={0.7}>
                <View style={[styles.actionIcon, { backgroundColor: Colors.redLight }]}>
                  <Ionicons name="trash" size={18} color={Colors.red} />
                </View>
                <Text style={[styles.actionLabel, { color: Colors.red }]}>Delete</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}

            <View style={styles.divider} />

            {/* Cancel */}
            <TouchableOpacity style={styles.cancelBtn} onPress={closeMenu} activeOpacity={0.75}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Confirmation dialog ───────────────────────────────────────── */}
      <Modal
        visible={confirm !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirm(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setConfirm(null)}>
          <Pressable style={styles.confirmCard} onPress={() => {}}>
            {confirm === 'paid' ? (
              <>
                <View style={[styles.confirmIcon, { backgroundColor: Colors.greenLight }]}>
                  <Ionicons name="checkmark-circle" size={28} color={Colors.green} />
                </View>
                <Text style={styles.confirmTitle}>Mark as Paid</Text>
                <Text style={styles.confirmMsg}>
                  {reminder.repeat !== 'once'
                    ? `Mark "${reminder.name}" as paid?\n\nThe next ${reminder.repeat} cycle will be scheduled automatically.`
                    : `Mark "${reminder.name}" as paid?\n\nThis one-time reminder will be removed.`}
                </Text>
                <View style={styles.confirmBtns}>
                  <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirm(null)} activeOpacity={0.75}>
                    <Text style={styles.confirmCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.confirmOk, { backgroundColor: Colors.green }]} onPress={handleConfirmPaid} activeOpacity={0.8}>
                    <Text style={styles.confirmOkText}>Mark as Paid</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.confirmIcon, { backgroundColor: Colors.redLight }]}>
                  <Ionicons name="trash" size={28} color={Colors.red} />
                </View>
                <Text style={styles.confirmTitle}>Delete Reminder</Text>
                <Text style={styles.confirmMsg}>Remove "{reminder.name}"? This cannot be undone.</Text>
                <View style={styles.confirmBtns}>
                  <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirm(null)} activeOpacity={0.75}>
                    <Text style={styles.confirmCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.confirmOk, { backgroundColor: Colors.red }]} onPress={handleConfirmDelete} activeOpacity={0.8}>
                    <Text style={styles.confirmOkText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  menuBtn: { padding: 8 },
  bar:     { width: 4, alignSelf: 'stretch' },
  info:    { flex: 1 },
  name:    { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  meta:    { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  right:   { alignItems: 'flex-end', flexShrink: 0 },
  amount:  { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  amountSub: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },

  // ── Bottom sheet ────────────────────────────────────────────────────
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  sheetSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 14,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  cancelBtn: {
    marginTop: 4,
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // ── Confirmation card ────────────────────────────────────────────────
  confirmCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginHorizontal: 24,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  confirmIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  confirmMsg: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  confirmBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmOk: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmOkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
});
