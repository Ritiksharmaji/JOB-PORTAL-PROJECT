import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />
      <RootNavigator />
    </NavigationContainer>
  );
}

// Fonts (Poppins) are bundled natively via react-native.config.js + react-native-asset,
// so there is no runtime font-loading step as there was under Expo's useFonts().
export default function App() {
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
