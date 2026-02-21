// src/navigation/MainNavigator.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/UserContext';
import { SCREENS } from '../utils/constants';

// Import Screens
import HomeScreen from '../screens/Home/HomeScreen';
import VoiceCaptureScreen from '../screens/Record/VoiceCaptureScreen';
import EditScreen from '../screens/Editor/EditScreen';
import DraftListScreen from '../screens/Drafts/DraftListScreen';
import PublishOptions from '../screens/Publish/PublishOptions';
import ScheduleScreen from '../screens/Publish/ScheduleScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Custom Tab Bar Icon
 */
const TabIcon = ({ icon, label, focused, theme, isRecord = false }) => {
  if (isRecord) {
    return (
      <View style={[styles.recordButton, { backgroundColor: theme.primary }]}>
        <Text style={styles.recordIcon}>◉</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabIconContainer}>
      <Text
        style={[
          styles.tabIcon,
          { color: focused ? theme.primary : theme.textMuted },
        ]}
      >
        {icon}
      </Text>
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? theme.primary : theme.textMuted },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

/**
 * Custom Tab Bar
 */
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.tabBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const isRecord = route.name === 'RecordTab';

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

        let icon = '⌂';
        let label = 'Home';

        switch (route.name) {
          case 'HomeTab':
            icon = '⌂';
            label = 'Home';
            break;
          case 'RecordTab':
            icon = '◉';
            label = 'Record';
            break;
          case 'DraftsTab':
            icon = '◫';
            label = 'Drafts';
            break;
          case 'SettingsTab':
            icon = '⚙';
            label = 'Settings';
            break;
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <TabIcon
              icon={icon}
              label={label}
              focused={isFocused}
              theme={theme}
              isRecord={isRecord}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

/**
 * Home Stack Navigator
 */
const HomeStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={SCREENS.HOME} component={HomeScreen} />
    </Stack.Navigator>
  );
};

/**
 * Record Stack Navigator
 */
const RecordStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name={SCREENS.RECORD} component={VoiceCaptureScreen} />
    </Stack.Navigator>
  );
};

/**
 * Drafts Stack Navigator
 */
const DraftsStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={SCREENS.DRAFTS} component={DraftListScreen} />
    </Stack.Navigator>
  );
};

/**
 * Settings Stack Navigator
 */
const SettingsStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={SCREENS.SETTINGS} component={SettingsScreen} />
    </Stack.Navigator>
  );
};

/**
 * Bottom Tab Navigator
 */
const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="RecordTab"
        component={RecordStack}
        options={{ tabBarLabel: 'Record' }}
      />
      <Tab.Screen
        name="DraftsTab"
        component={DraftsStack}
        options={{ tabBarLabel: 'Drafts' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main Navigator
 * 
 * Root stack for authenticated users.
 * Contains tab navigator and modal screens.
 */
const MainNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      {/* Tab Navigator as main screen */}
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ animation: 'fade' }}
      />

      {/* Modal Screens (accessible from anywhere) */}
      <Stack.Screen
        name={SCREENS.EDITOR}
        component={EditScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name={SCREENS.PUBLISH_OPTIONS}
        component={PublishOptions}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name={SCREENS.SCHEDULE}
        component={ScheduleScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

// ─── STYLES ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  recordButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    shadowColor: '#4F8EF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  recordIcon: {
    fontSize: 20,
    color: '#fff',
  },
});

export default MainNavigator;