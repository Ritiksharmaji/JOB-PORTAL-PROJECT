import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, font } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import FindJobsScreen from '../screens/FindJobsScreen';
import MyJobsScreen from '../screens/MyJobsScreen';
import ProfileScreen from '../screens/ProfileScreen';

import FindTalentScreen from '../screens/FindTalentScreen';
import PostJobScreen from '../screens/PostJobScreen';
import PostedJobsScreen from '../screens/PostedJobsScreen';

const Tab = createBottomTabNavigator();

const screenOptions = ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: colors.accent,
  tabBarInactiveTintColor: colors.muted,
  tabBarStyle: {
    backgroundColor: colors.navBar,
    borderTopColor: '#3d3d3d',
    height: 64,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabBarLabelStyle: { fontFamily: font.medium, fontSize: 10 },
});

const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size ?? 22} color={color} />;

export function ApplicantTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: icon('home-outline') }} />
      <Tab.Screen name="Jobs" component={FindJobsScreen} options={{ tabBarIcon: icon('search-outline') }} />
      <Tab.Screen name="My Jobs" component={MyJobsScreen} options={{ tabBarIcon: icon('bookmark-outline') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: icon('person-outline') }} />
    </Tab.Navigator>
  );
}

export function EmployerTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Talent" component={FindTalentScreen} options={{ tabBarIcon: icon('people-outline') }} />
      <Tab.Screen name="Post" component={PostJobScreen} options={{ tabBarIcon: icon('add-circle-outline') }} />
      <Tab.Screen name="Listings" component={PostedJobsScreen} options={{ tabBarIcon: icon('list-outline') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: icon('person-outline') }} />
    </Tab.Navigator>
  );
}
