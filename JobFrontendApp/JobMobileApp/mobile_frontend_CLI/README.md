# Jobify Mobile — React Native CLI

A **bare React Native (CLI)** port of the Expo app in [`../mobile_frontend`](../mobile_frontend).
Same screens, navigation, contexts, services and Spring Boot backend integration — the only
things that changed are the Expo-specific APIs, which were swapped for their community
equivalents, plus the native `android/` and `ios/` projects that the CLI needs.

React Native `0.74.5`, React `18.2.0` (matched to the original Expo app).

---

## Prerequisites

- **Node** >= 18
- **JDK 17** and the **Android SDK** (Android Studio) for Android
- **Xcode** + **CocoaPods** for iOS (macOS only)

See the official guide: <https://reactnative.dev/docs/set-up-your-environment>.

## Install & run

```bash
npm install
```

The bundled fonts (Poppins + the vector-icon set) are linked from `react-native.config.js`.
After a fresh `npm install`, link them into the native projects once:

```bash
npx react-native-asset
```

iOS also needs its native pods:

```bash
cd ios && pod install && cd ..
```

Then start Metro and run a platform:

```bash
npm start            # Metro bundler
npm run android      # build & launch on Android emulator/device
npm run ios          # build & launch on iOS simulator (macOS)
```

## Backend URL

The API base URL lives in [`src/config.js`](src/config.js). By default it targets the
local backend via the emulator/simulator loopback:

- Android emulator → `http://10.0.2.2:8080`
- iOS simulator → `http://localhost:8080`

To run against a **physical device**, set `MANUAL_API_URL` in `src/config.js` to your
PC's LAN IP (e.g. `http://192.168.0.55:8080`) and rebuild. Cleartext HTTP is already
enabled for Android (`usesCleartextTraffic`) and local networking for iOS.

---

## What changed vs. the Expo app

| Concern | Expo (`mobile_frontend`) | React Native CLI (this project) |
| --- | --- | --- |
| Entry point | `node_modules/expo/AppEntry.js` | `index.js` → `AppRegistry.registerComponent` |
| Status bar | `expo-status-bar` | `StatusBar` from `react-native` |
| Icons | `@expo/vector-icons` (Ionicons) | `react-native-vector-icons/Ionicons` |
| Fonts | `@expo-google-fonts/poppins` + `useFonts()` | TTFs in `assets/fonts`, linked natively (no runtime load) |
| Document picker | `expo-document-picker` | `react-native-document-picker` |
| Image picker | `expo-image-picker` | `react-native-image-picker` |
| File → base64 | `expo-file-system` | `react-native-fs` |
| Env / API URL | `EXPO_PUBLIC_API_URL` (bundler-inlined) | plain constant in `src/config.js` |
| Native projects | managed by Expo | committed `android/` + `ios/` folders |

Unchanged: `@react-navigation/*`, `axios`, `@react-native-async-storage/async-storage`,
`jwt-decode`, `react-native-safe-area-context`, `react-native-screens`, and the entire
`src/` tree (screens, components, contexts, services, data, utils, theme).

### Font family names

The font families referenced in `src/theme.js` (`Poppins_400Regular`, `Poppins_500Medium`,
`Poppins_600SemiBold`, `Poppins_700Bold`) match the bundled TTF **filenames**, so Android
resolves them directly. On iOS the family is resolved by PostScript name; the Poppins files
register under these same names, but if a weight ever renders as the system font, verify the
name with an app such as *Font Book* and adjust `theme.js` accordingly.
