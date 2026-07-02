# Apple Design Context

## Product
- **Name**: AI Dance (app #001 of the app-studio factory; template lives in `template-base/`)
- **Description**: Drop a photo, pick a style, get a studio-quality AI video of that person dancing (optionally transformed into anime/zombie/toon/painting first).
- **Category**: Photo & Video (Gen-Z viral, subscription)
- **Stage**: Development (pre-TestFlight)

## Platforms
| Platform | Supported | Min OS | Notes |
|----------|-----------|--------|-------|
| iOS      | Yes       | SDK 54 default (iOS 15.1+) | iPhone only, portrait only, `supportsTablet: false` |
| Others   | No        |        | Expo web used for dev previews only |

## Technology
- **UI Framework**: React Native 0.81 + Expo SDK 54 (managed), expo-router stack
- **Architecture**: Single-window; screens: index gate → onboarding → home → paywall (modal) → settings
- **Key modules**: expo-image-picker, expo-video, expo-media-library, expo-sharing, expo-haptics, reanimated 4, expo-linear-gradient

## Design System
- **Base**: Custom tokens in `template-base/src/constants/theme.ts` ("Afterglow / Midnight Stage" direction)
- **Brand Colors**: bg #0B0710 (warm plum-black), surface #171320, primary #FF477E (coral-magenta), iris #8B6BFF, spark #46E5FF, text #FBF7FF / #A79FB5
- **Typography**: Unbounded (display), Inter (body), Space Grotesk (kicker) via @expo-google-fonts
- **Dark Mode**: Dark-ONLY (`userInterfaceStyle: dark`); Colors.light === Colors.dark
- **Dynamic Type**: Not yet (fixed type scale in `Type` tokens)

## Accessibility
- **Target Level**: Baseline+ (44pt targets, labels on icon-only controls, reduce-motion respected on ambient loops)
- **Key Considerations**: ambient animations gated behind reduce-motion; video player is decorative-loop (muted)

## Users
- **Primary Persona**: Gen-Z/millennial social creator; makes shareable clips of self/pets/friends
- **Key Use Cases**: one-thumb use, on the couch; generate → wait 2–5 min → save/share to TikTok/IG
- **Known Challenges**: long AI render wait (needs rich loading state); honest free-preview → paywall conversion; Apple 4.3 originality
