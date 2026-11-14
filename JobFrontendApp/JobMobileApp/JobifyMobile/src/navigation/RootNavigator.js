import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import { ApplicantTabs, EmployerTabs } from './Tabs';

import JobDetailScreen from '../screens/JobDetailScreen';
import ApplyScreen from '../screens/ApplyScreen';
import ApplySuccessScreen from '../screens/ApplySuccessScreen';
import CompanyScreen from '../screens/CompanyScreen';
import TalentDetailScreen from '../screens/TalentDetailScreen';
import PostedDetailScreen from '../screens/PostedDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ApplicantApp" component={ApplicantTabs} />
      <Stack.Screen name="EmployerApp" component={EmployerTabs} />

      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="Apply" component={ApplyScreen} />
      <Stack.Screen
        name="ApplySuccess"
        component={ApplySuccessScreen}
        options={{ animation: 'fade', gestureEnabled: false }}
      />
      <Stack.Screen name="Company" component={CompanyScreen} />
      <Stack.Screen name="TalentDetail" component={TalentDetailScreen} />
      <Stack.Screen name="PostedDetail" component={PostedDetailScreen} />
    </Stack.Navigator>
  );
}
