// Links bundled font assets into the native projects.
// After `npm install`, run `npx react-native-asset` to copy these fonts
// into the Android and iOS builds (Poppins + the react-native-vector-icons set).
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts', './node_modules/react-native-vector-icons/Fonts'],
};
