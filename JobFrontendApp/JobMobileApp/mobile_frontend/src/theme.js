// Jobify design tokens — dark + light palettes (toggle via ThemeContext).
export const darkColors = {
  bg: '#2d2d2d',
  card: '#3d3d3d',
  cardAlt: '#454545',
  input: '#2d2d2d',
  border: '#4f4f4f',
  borderSoft: '#454545',
  navBar: '#252525',
  accent: '#ffbd20',
  onAccent: '#2d2d2d',
  text: '#e7e7e7',
  textDim: '#b0b0b0',
  muted: '#888888',
  white: '#ffffff',
  success: '#34d399',
  warning: '#ffbd20',
  danger: '#f87171',
};

export const lightColors = {
  bg: '#f4f4f5',
  card: '#ffffff',
  cardAlt: '#ececed',
  input: '#ffffff',
  border: '#d9d9de',
  borderSoft: '#e6e6ea',
  navBar: '#ffffff',
  accent: '#ffbd20',
  onAccent: '#2d2d2d',
  text: '#1d1d1f',
  textDim: '#5d5d65',
  muted: '#8a8a93',
  white: '#ffffff',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
};

// Default export kept as dark for any module-level reference / fallback.
export const colors = darkColors;

// Poppins families from @expo-google-fonts/poppins
export const font = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};
