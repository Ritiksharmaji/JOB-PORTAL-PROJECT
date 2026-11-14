import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { AppProvider, AppContext } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { darkColors } from './src/theme';

const Splash = () => (
  <View style={styles.loader}>
    <ActivityIndicator color={darkColors.accent} size="large" />
  </View>
);

// Reads auth-restore state from context + the active theme.
function Root() {
  const { isLoading } = useContext(AppContext);
  const { colors, isDark } = useTheme();
  if (isLoading) return <Splash />;
  const navTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: colors.bg },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) return <Splash />;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <Root />
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, backgroundColor: darkColors.bg, alignItems: 'center', justifyContent: 'center' },
});
