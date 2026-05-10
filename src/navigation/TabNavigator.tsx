import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { Colors } from '../constants/colors';
import { RootTabParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import RemindersScreen from '../screens/RemindersScreen';
import AddReminderScreen from '../screens/AddReminderScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const isAdd = route.name === 'Add';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
        const iconMap: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
          Home:      { active: 'home',          inactive: 'home-outline'          },
          Reminders: { active: 'list',           inactive: 'list-outline'          },
          Add:       { active: 'add',            inactive: 'add'                   },
          Calendar:  { active: 'calendar',       inactive: 'calendar-outline'      },
          Profile:   { active: 'person-circle',  inactive: 'person-circle-outline' },
        };

        const icons = iconMap[route.name];

        if (isAdd) {
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.fabWrapper}
              onPress={onPress}
              activeOpacity={0.85}
            >
              <View style={styles.fab}>
                <Ionicons name="add" size={28} color={Colors.white} />
              </View>
            </TouchableOpacity>
          );
        }

        const label = options.tabBarLabel ?? route.name;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFocused ? icons.active : icons.inactive}
              size={22}
              color={isFocused ? Colors.blue : Colors.textMuted}
            />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Navigator ────────────────────────────────────────────────────────────────

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"      component={HomeScreen}        options={{ tabBarLabel: 'Home'      }} />
      <Tab.Screen name="Reminders" component={RemindersScreen}   options={{ tabBarLabel: 'Reminders' }} />
      <Tab.Screen name="Add"       component={AddReminderScreen} options={{ tabBarLabel: 'Add'       }} />
      <Tab.Screen name="Calendar"  component={CalendarScreen}    options={{ tabBarLabel: 'Calendar'  }} />
      <Tab.Screen name="Profile"   component={ProfileScreen}     options={{ tabBarLabel: 'Profile'   }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.blue,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
