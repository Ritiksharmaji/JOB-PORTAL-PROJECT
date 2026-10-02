import { Platform } from 'react-native';

// Base URL of the Spring Boot backend (no /api context path; routes are root-relative,
// e.g. POST http://<host>:8080/auth/login).
//
// On a physical device `localhost` points at the PHONE, not your PC. Set your PC's
// LAN IP here (e.g. 'http://192.168.0.55:8080') and rebuild, or start Metro with a
// cache reset: `npx react-native start --reset-cache`.
//
// Unlike Expo, bare React Native does not inline process.env at build time, so this is
// a plain editable constant. Leave it null to use the emulator/simulator fallbacks below.
const MANUAL_API_URL = null;

const FALLBACK_API_URL = Platform.select({
  android: 'https://job-portal-project-1-f7oc.onrender.com', // deployed backend (Render)
  ios: 'https://job-portal-project-1-f7oc.onrender.com', // deployed backend (Render)
  default: 'https://job-portal-project-1-f7oc.onrender.com',
});

export const API_URL = MANUAL_API_URL || FALLBACK_API_URL;
