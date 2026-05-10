import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  urgencyLabel,
  urgencyBadgeBg,
  urgencyBadgeText,
} from '../utils/urgency';

interface Props {
  dueDateISO: string;
}

export default function UrgencyBadge({ dueDateISO }: Props) {
  const label = urgencyLabel(dueDateISO);
  const bg    = urgencyBadgeBg(dueDateISO);
  const color = urgencyBadgeText(dueDateISO);

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
