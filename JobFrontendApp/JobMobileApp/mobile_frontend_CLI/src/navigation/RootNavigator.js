import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import { ApplicantTabs, EmployerTabs, GuestTabs } from './Tabs';

import JobDetailScreen from '../screens/JobDetailScreen';
import ApplyScreen from '../screens/ApplyScreen';
import ApplySuccessScreen from '../screens/ApplySuccessScreen';
import CompanyScreen from '../screens/CompanyScreen';
import TalentDetailScreen from '../screens/TalentDetailScreen';
import PostedDetailScreen from '../screens/PostedDetailScreen';
import PostJobScreen from '../screens/PostJobScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isSignedIn, role } = useContext(AppContext);
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      {/* Browsing is public (like the web app): visitors start on the job tabs and sign in
          only for actions. Tabs follow the role: visitor, job seeker or recruiter. */}
      <Stack.Screen
        name="App"
        component={role === 'employer' ? EmployerTabs : role === 'applicant' ? ApplicantTabs : GuestTabs}
      />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="Company" component={CompanyScreen} />
      <Stack.Screen name="TalentDetail" component={TalentDetailScreen} />
      {isSignedIn && (
        <>
          <Stack.Screen name="Apply" component={ApplyScreen} />
          <Stack.Screen
            name="ApplySuccess"
            component={ApplySuccessScreen}
            options={{ animation: 'fade', gestureEnabled: false }}
          />
          <Stack.Screen name="PostedDetail" component={PostedDetailScreen} />
          {/* PostJob is also a tab for employers, but reachable as a route for edit (jobId param) */}
          <Stack.Screen name="PostJob" component={PostJobScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      )}
      <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}
