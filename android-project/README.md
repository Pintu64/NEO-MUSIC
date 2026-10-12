# NeoMusic — Smart Premium Music Player

## Overview
NeoMusic is a native Android music player crafted with Jetpack Compose, Material 3, and AndroidX Media3 ExoPlayer.
- **100% Ad-Free & Privacy First**: Zero ads, zero tracking, zero internet permissions required.
- **Liquid Glass UI**: Frosted glass surfaces, dynamic album color reflections, clean typography.
- **Dynamic Capsule (Dynamic Island)**: Floating interactive music pill at the top of your screen that smoothly expands on tap.
- **Smart Library & Listening**: Duplicate detection, missing artwork health check, smart weighted shuffle, and offline mood mixes.
- **10-Band Equalizer**: Native audiofx equalizer with Bass Boost, 3D Virtualizer, and custom presets.
- **Local Audio Engine**: High-fidelity Media3 ExoPlayer with gapless playback, lockscreen controls, and headphone disconnect protection.

---

## How to Build in Android Studio (Windows / Mac)

### Requirements:
- Android Studio Iguana / Jellyfish / Koala or newer
- JDK 17
- Android SDK 35 (minSdk 26)

### Steps:
1. Extract the project folder into a directory of your choice.
2. Open **Android Studio** and select **File > Open**, then choose this directory.
3. Allow Gradle to synchronize dependencies.
4. Connect your Android phone via USB cable (or Wireless Debugging).
5. Enable **Developer Options** and **USB Debugging**:
   - Go to *Settings > About Phone* and tap *Build Number* 7 times.
   - Go to *Settings > System > Developer Options* and turn ON *USB Debugging*.
6. In Android Studio, select \`app\` in the run configuration bar and click the green **Run (▶)** button or press \`Shift + F10\`.
7. The debug APK will build and install automatically onto your phone!

---

## Free Cloud Build via GitHub Actions

If you don't have Android Studio installed on your computer, you can build the APK directly in the cloud:
1. Push this repository to a private or public GitHub repository.
2. Go to the **Actions** tab on GitHub.
3. The included workflow (\`.github/workflows/build-apk.yml\`) will build the APK automatically and produce a downloadable \`app-debug.apk\` in the workflow artifacts!
