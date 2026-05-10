import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/colors';
import { loadReminders, clearAllReminders } from '../storage/reminderStorage';
import { cancelAllNotifications } from '../utils/notifications';

export default function ProfileScreen() {
  const [reminderCount, setReminderCount]       = useState(0);
  const [notifEnabled, setNotifEnabled]         = useState(false);

  useEffect(() => {
    loadReminders().then(r => setReminderCount(r.length));
    if (Platform.OS !== 'web') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Notifications = require('expo-notifications') as typeof import('expo-notifications');
      Notifications.getPermissionsAsync().then(({ status }) =>
        setNotifEnabled(status === 'granted')
      );
    }
  }, []);

  const openNotifSettings = () => {
    Linking.openSettings();
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear all reminders',
      'This will delete all reminders and cancel all notifications. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            await clearAllReminders();
            setReminderCount(0);
            Alert.alert('Done', 'All reminders have been removed.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        {/* App info card */}
        <View style={styles.appCard}>
          <View style={styles.appIcon}>
            <Ionicons name="notifications" size={28} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.appName}>DueMinder</Text>
            <Text style={styles.appTagline}>Your personal recurring reminder app</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Stats */}
        <SectionTitle>Overview</SectionTitle>
        <View style={styles.statsRow}>
          <StatBox value={reminderCount.toString()} label="Active reminders" color={Colors.blue} />
          <StatBox value={notifEnabled ? 'On' : 'Off'} label="Notifications" color={notifEnabled ? Colors.green : Colors.red} />
        </View>

        {/* Notifications */}
        <SectionTitle>Notifications</SectionTitle>
        <SettingRow
          icon="notifications-outline"
          iconColor={Colors.blue}
          label="Push notifications"
          subtitle={notifEnabled ? 'Notifications are enabled' : 'Tap to enable in Settings'}
          right={
            <Switch
              value={notifEnabled}
              onValueChange={openNotifSettings}
              trackColor={{ false: Colors.border, true: Colors.blueMid }}
              thumbColor={Colors.white}
            />
          }
        />
        <SettingRow
          icon="time-outline"
          iconColor={Colors.blue}
          label="Default notify time"
          subtitle="9:00 AM on the reminder day"
        />

        {/* About */}
        <SectionTitle>About this app</SectionTitle>
        <InfoCard
          icon="shield-checkmark-outline"
          color={Colors.green}
          title="Privacy-first"
          body="DueMinder stores all your data locally on your device. No bank login, no data collection, no cloud sync."
        />
        <InfoCard
          icon="information-circle-outline"
          color={Colors.blue}
          title="Reminders only"
          body="This app schedules push notifications to alert you before due dates. It does not track whether you've actually paid or renewed."
        />

        {/* Danger zone */}
        <SectionTitle>Data</SectionTitle>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClearAll} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={18} color={Colors.red} />
          <Text style={styles.dangerText}>Clear all reminders</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Made with Love by Subhash · DueMinder v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children as string}</Text>;
}

function StatBox({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={[styles.statBox, { borderColor: color + '40' }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  iconColor,
  label,
  subtitle,
  right,
}: {
  icon: string;
  iconColor: string;
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        {subtitle ? <Text style={styles.settingSub}>{subtitle}</Text> : null}
      </View>
      {right ?? null}
    </View>
  );
}

function InfoCard({ icon, color, title, body }: { icon: string; color: string; title: string; body: string }) {
  return (
    <View style={styles.infoCard}>
      <Ionicons name={icon as any} size={20} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },

  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, paddingTop: 8, paddingBottom: 16 },

  appCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 0.5, borderColor: Colors.border, padding: 16, marginBottom: 20 },
  appIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  appTagline: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, maxWidth: 200 },
  appVersion: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 20, marginBottom: 10 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  statBox:  { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center', gap: 4 },
  statValue:{ fontSize: 22, fontWeight: '700' },
  statLabel:{ fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },

  settingRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 0.5, borderColor: Colors.border, padding: 14, marginBottom: 8 },
  settingIcon: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  settingLabel:{ fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  settingSub:  { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  infoCard:  { flexDirection: 'row', gap: 12, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 0.5, borderColor: Colors.border, padding: 14, marginBottom: 8, alignItems: 'flex-start' },
  infoTitle: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 3 },
  infoBody:  { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  dangerBtn:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.redLight, borderRadius: 12, borderWidth: 0.5, borderColor: Colors.red + '40', padding: 14, marginBottom: 8 },
  dangerText: { fontSize: 14, fontWeight: '600', color: Colors.red },

  footer: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 20 },
});
