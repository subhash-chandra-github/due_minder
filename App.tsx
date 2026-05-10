import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TabNavigator from './src/navigation/TabNavigator';
import { requestNotificationPermission } from './src/utils/notifications';
import { Colors } from './src/constants/colors';

// Provide zero insets synchronously so SafeAreaProvider never renders null children.
const INITIAL_METRICS = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame:  { x: 0, y: 0, width: 0, height: 0 },
};

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    requestNotificationPermission();

    // require() here so expo-notifications is never loaded on web
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Notifications = require('expo-notifications') as typeof import('expo-notifications');

    const notifListener = Notifications.addNotificationReceivedListener(n => {
      console.log('[Notification received]', n);
    });
    const responseListener = Notifications.addNotificationResponseReceivedListener(r => {
      const id = r.notification.request.content.data?.reminderId;
      if (id) console.log('[Notification tapped] reminderId:', id);
    });

    return () => {
      Notifications.removeNotificationSubscription(notifListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
        translucent={false}
      />
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
