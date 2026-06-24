# Jobify — Mobile App (React Native + Expo)

A native mobile version of the Jobify job portal, converted from the web frontend.
Dark theme with a bright-sun-yellow accent and Poppins type. Built with **Expo** so it
runs on Android, iOS, and web from one codebase.

## Quick start

```bash
cd JobifyMobile
npm install          # install dependencies
npx expo install     # (recommended) align native package versions to your Expo SDK
npm start            # start the Metro bundler
```

Then:
- Press **a** to open the Android emulator (or scan the QR code with **Expo Go** on your phone)
- Press **i** for the iOS simulator (macOS only)
- Press **w** for web

> If `npm start` reports version mismatches, run `npx expo install` once — it pins
> `react`, `react-native`, and the navigation/native packages to versions compatible
> with the installed Expo SDK.

## What's included

Two roles, switchable from the Profile screen (or chosen at login):

**Job Seeker**
- Login / Sign up
- Home — greeting, search, categories, featured jobs
- Find Jobs — search, filter chips, job list
- Job Detail — info grid, skills, description, save + Apply
- Apply — form, resume upload placeholder, success screen
- My Jobs — Applied (with status) / Saved tabs
- Profile — banner, about, skills, experience, certifications
- Company profile — overview, stats, specialties, open roles

**Employer**
- Find Talent — candidate cards with skills + expected CTC
- Candidate Detail — about, skills, invite
- Post a Job — full form
- Posted Jobs (Listings) — your active postings
- Posted Detail — applicants per job with status

## Project structure

```
JobifyMobile/
├── App.js                     # entry: fonts, providers, navigation container
├── app.json                   # Expo config
├── package.json
├── babel.config.js
└── src/
    ├── theme.js               # colors, fonts, radii (design tokens)
    ├── assets/                # logos, avatars, banner + require() maps (index.js)
    ├── context/AppContext.js  # role + saved-jobs + history-tab state
    ├── data/                  # jobs, talents, profile (sample data from the web app)
    ├── components/            # JobCard, Tag, Field, PrimaryButton, ScreenHeader
    ├── navigation/            # RootNavigator (stack) + Tabs (applicant/employer)
    └── screens/               # all 15 screens
```

## Notes

- **State is in-memory** (React Context). Saving a job, switching roles, and the
  applied/saved tabs work in-session. Wire `src/data/*` and `AppContext` to your real
  API / persistence layer to make it production-ready.
- **Fonts**: Poppins via `@expo-google-fonts/poppins`, loaded in `App.js`.
- **Icons**: `@expo/vector-icons` (Ionicons).
- Forms are presentational (no backend submit) — `Submit` / `Publish` navigate to the
  next screen so you can demo the full flow.
