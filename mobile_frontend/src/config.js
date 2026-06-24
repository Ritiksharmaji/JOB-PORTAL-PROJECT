import { Platform } from 'react-native';

// Base URL of the Spring Boot backend (no /api context path; routes are root-relative,
// e.g. POST http://<host>:8080/auth/login).
//
// On a physical phone (Expo Go) `localhost` points at the PHONE, not your PC, so set
// EXPO_PUBLIC_API_URL in mobile_frontend/.env to your PC's LAN IP, e.g.
//   EXPO_PUBLIC_API_URL=http://192.168.0.55:8080
// Restart Expo after changing it (npx expo start -c).
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

const FALLBACK_API_URL = Platform.select({
  android: 'http://10.0.2.2:8080', // Android emulator -> host machine's localhost
  ios: 'http://localhost:8080', // iOS simulator
  default: 'http://localhost:8080',
});

export const API_URL = ENV_API_URL || FALLBACK_API_URL;
