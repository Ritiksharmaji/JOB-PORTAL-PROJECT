// Static require() maps — React Native needs literal requires for images.

export const LOGOS = {
  Meta: require('./Meta.png'),
  Netflix: require('./Netflix.png'),
  Microsoft: require('./Microsoft.png'),
  Adobe: require('./Adobe.png'),
  Google: require('./Google.png'),
  Spotify: require('./Spotify.png'),
  Amazon: require('./Amazon.png'),
  Apple: require('./Apple.png'),
};

export const AVATARS = {
  avatar: require('./avatar.png'),
  avatar1: require('./avatar1.png'),
  avatar2: require('./avatar2.png'),
};

export const BANNER = require('./banner.jpg');

export const logoFor = (company) => LOGOS[company] || LOGOS.Google;
export const avatarFor = (key) => AVATARS[key] || AVATARS.avatar;
