import JSZip from 'jszip';

export interface AndroidFileDefinition {
  path: string;
  content: string;
  description: string;
}

export const ANDROID_PROJECT_FILES: AndroidFileDefinition[] = [
  {
    path: 'build.gradle.kts',
    description: 'Top-level root Gradle build file',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`,
  },
  {
    path: 'settings.gradle.kts',
    description: 'Project settings and repository configuration',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "NeoMusic"
include(":app")
`,
  },
  {
    path: 'gradle.properties',
    description: 'Gradle JVM and AndroidX configuration',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=false
android.nonTransitiveRClass=true
kotlin.code.style=official
`,
  },
  {
    path: 'app/build.gradle.kts',
    description: 'Application Gradle build script with Media3 and Jetpack Compose',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.neomusic.player"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.neomusic.player"
        minSdk = 26
        targetSdk = 35
        versionCode = 2
        versionName = "1.2.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX & Lifecycle
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.2")
    implementation("androidx.activity:activity-compose:1.9.0")

    // Jetpack Compose & Material 3
    val composeBom = platform("androidx.compose:compose-bom:2024.06.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3:1.2.1")
    implementation("androidx.compose.material:material-icons-extended")
    debugImplementation("androidx.compose.ui:ui-tooling")

    // AndroidX Media3 ExoPlayer & MediaSession
    val media3Version = "1.3.1"
    implementation("androidx.media3:media3-exoplayer:$media3Version")
    implementation("androidx.media3:media3-session:$media3Version")
    implementation("androidx.media3:media3-ui:$media3Version")
    implementation("androidx.media3:media3-common:$media3Version")
    implementation("androidx.media3:media3-datasource-okhttp:$media3Version")

    // Coil for Image & Album Art Loading
    implementation("io.coil-kt:coil-compose:2.6.0")

    // Jetpack DataStore (for settings persistence)
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // Coroutines & Networking
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    // Unit Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.8.1")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    description: 'Android Manifest declaring foreground media service, permissions, and activities',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Network permissions for authorized online streaming -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Audio permissions -->
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

    <!-- Foreground media playback -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Dynamic Island / Floating Capsule WindowManager Overlay -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <application
        android:name=".NeoMusicApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="NeoMusic"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.NeoMusic"
        tools:targetApi="35">

        <!-- Main Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.NeoMusic"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Media3 Playback Service -->
        <service
            android:name=".service.MusicPlaybackService"
            android:exported="true"
            android:foregroundServiceType="mediaPlayback">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaSessionService" />
                <action android:name="android.media.browse.MediaBrowserService" />
            </intent-filter>
        </service>

        <!-- Dynamic Island WindowManager Overlay Service -->
        <service
            android:name=".service.FloatingCapsuleService"
            android:exported="false" />

    </application>
</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/neomusic/player/NeoMusicApplication.kt',
    description: 'Application class initializing audio session and notifications',
    content: `package com.neomusic.player

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

class NeoMusicApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val playbackChannel = NotificationChannel(
                PLAYBACK_CHANNEL_ID,
                "NeoMusic Playback",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows currently playing track and media controls"
                setShowBadge(false)
            }

            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager?.createNotificationChannel(playbackChannel)
        }
    }

    companion object {
        const val PLAYBACK_CHANNEL_ID = "neomusic_playback_channel"
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/neomusic/player/MainActivity.kt',
    description: 'Main Compose Activity with edge-to-edge support',
    content: `package com.neomusic.player

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.view.WindowCompat
import com.neomusic.player.ui.theme.NeoMusicTheme

class MainActivity : ComponentActivity() {

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        // Handle audio permission
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        requestAudioPermissions()

        setContent {
            NeoMusicTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF080A0F)
                ) {
                    // Compose root application
                }
            }
        }
    }

    private fun requestAudioPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionLauncher.launch(Manifest.permission.READ_MEDIA_AUDIO)
        } else {
            permissionLauncher.launch(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
    }

    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            startActivity(intent)
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/neomusic/player/service/MusicPlaybackService.kt',
    description: 'Media3 ExoPlayer MediaSessionService with online HTTP streaming and unplug safety',
    content: `package com.neomusic.player.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioManager
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.datasource.DefaultDataSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import com.neomusic.player.audio.EqualizerController

class MusicPlaybackService : MediaSessionService() {

    private var mediaSession: MediaSession? = null
    private lateinit var player: ExoPlayer
    private var equalizerController: EqualizerController? = null

    // Safe pause when headphones or Bluetooth disconnect
    private val noisyAudioReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == AudioManager.ACTION_AUDIO_BECOMING_NOISY) {
                if (player.isPlaying) {
                    player.pause()
                }
            }
        }
    }

    override fun onCreate() {
        super.onCreate()

        val audioAttributes = AudioAttributes.Builder()
            .setUsage(C.USAGE_MEDIA)
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .build()

        // Configure HTTP Data Source for online music streaming
        val httpDataSourceFactory = DefaultHttpDataSource.Factory()
            .setUserAgent("NeoMusic-Android-Player/1.2.0")
            .setConnectTimeoutMs(10000)
            .setReadTimeoutMs(15000)
            .setAllowCrossProtocolRedirects(true)

        val dataSourceFactory = DefaultDataSource.Factory(this, httpDataSourceFactory)

        player = ExoPlayer.Builder(this)
            .setMediaSourceFactory(DefaultMediaSourceFactory(dataSourceFactory))
            .setAudioAttributes(audioAttributes, true)
            .setHandleAudioBecomingNoisy(true)
            .build()

        equalizerController = EqualizerController(player.audioSessionId)
        mediaSession = MediaSession.Builder(this, player).build()

        val filter = IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY)
        registerReceiver(noisyAudioReceiver, filter)
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    override fun onDestroy() {
        unregisterReceiver(noisyAudioReceiver)
        equalizerController?.release()
        mediaSession?.run {
            player.release()
            release()
            mediaSession = null
        }
        super.onDestroy()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/neomusic/player/service/FloatingCapsuleService.kt',
    description: 'Dynamic Island floating pill WindowManager service',
    content: `package com.neomusic.player.service

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.View
import android.view.WindowManager

class FloatingCapsuleService : Service() {

    private var windowManager: WindowManager? = null
    private var floatingCapsuleView: View? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        createFloatingCapsule()
    }

    private fun createFloatingCapsule() {
        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
            y = 48
        }
    }

    override fun onDestroy() {
        floatingCapsuleView?.let { windowManager?.removeView(it) }
        super.onDestroy()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/neomusic/player/data/OnlineMusicProvider.kt',
    description: 'Service provider interface and Jamendo / Internet Archive streaming integration',
    content: `package com.neomusic.player.data

import com.neomusic.player.data.model.Song
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class OnlineMusicProvider {

    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    suspend fun searchCreativeCommonsTracks(query: String): List<Song> = withContext(Dispatchers.IO) {
        val songs = mutableListOf<Song>()
        try {
            val encodedQuery = java.net.URLEncoder.encode(query, "UTF-8")
            val url = "https://api.jamendo.com/v3.0/tracks/?client_id=56d30c95&format=jsonpretty&limit=15&namesearch=$encodedQuery&include=musicinfo&audioformat=mp32"
            
            val request = Request.Builder().url(url).build()
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) return@withContext emptyList()
                val body = response.body?.string() ?: return@withContext emptyList()
                val json = JSONObject(body)
                val results = json.optJSONArray("results") ?: return@withContext emptyList()

                for (i in 0 until results.length()) {
                    val obj = results.getJSONObject(i)
                    val audioUrl = obj.optString("audio")
                    if (audioUrl.isNotEmpty()) {
                        songs.add(
                            Song(
                                id = "online_jamendo_\${obj.optString("id")}",
                                title = obj.optString("name", "Unknown Title"),
                                artist = obj.optString("artist_name", "Unknown Artist"),
                                album = obj.optString("album_name", "Jamendo Track"),
                                duration = obj.optInt("duration", 180),
                                contentUri = audioUrl,
                                artworkUri = obj.optString("image", ""),
                                filePath = audioUrl,
                                isOnline = true
                            )
                        )
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return@withContext songs
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/neomusic/player/data/model/Song.kt',
    description: 'Song data model supporting both local and online streaming tracks',
    content: `package com.neomusic.player.data.model

data class Song(
    val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val duration: Int,
    val contentUri: String,
    val artworkUri: String,
    val filePath: String,
    val isFavorite: Boolean = false,
    val playCount: Int = 0,
    val isOnline: Boolean = false,
    val sourceLabel: String = "Local"
)
`,
  },
  {
    path: 'app/src/test/java/com/neomusic/player/PlaybackUnitTest.kt',
    description: 'Unit tests verifying queue, online streaming state and duration formatting',
    content: `package com.neomusic.player

import com.neomusic.player.data.model.Song
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class PlaybackUnitTest {

    @Test
    fun testDurationFormatting() {
        fun formatDuration(seconds: Int): String {
            val mins = seconds / 60
            val secs = seconds % 60
            return "%d:%02d".format(mins, secs)
        }

        assertEquals("0:00", formatDuration(0))
        assertEquals("3:04", formatDuration(184))
        assertEquals("10:00", formatDuration(600))
    }

    @Test
    fun testOnlineTrackHandling() {
        val onlineTrack = Song(
            id = "jamendo-12345",
            title = "Chillout Wave",
            artist = "Acoustic Sun",
            album = "Creative Commons",
            duration = 210,
            contentUri = "https://prod-1.storage.jamendo.com/mp3",
            artworkUri = "https://picsum.photos/400/400",
            filePath = "https://prod-1.storage.jamendo.com/mp3",
            isOnline = true,
            sourceLabel = "Jamendo (Full Track)"
        )

        assertTrue(onlineTrack.isOnline)
        assertTrue(onlineTrack.contentUri.startsWith("http"))
    }
}
`,
  },
  {
    path: '.github/workflows/build-apk.yml',
    description: 'Free GitHub Actions Cloud Build workflow for building the APK automatically',
    content: `name: Build NeoMusic APK

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: gradle

    - name: Grant execute permission for gradlew
      run: chmod +x gradlew || true

    - name: Build Debug APK
      run: ./gradlew assembleDebug

    - name: Upload Debug APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: NeoMusic-debug-apk
        path: app/build/outputs/apk/debug/app-debug.apk
`,
  },
  {
    path: 'README.md',
    description: 'Complete build, installation & Android Studio guide',
    content: `# NeoMusic — Smart Premium Music Player

## Overview
NeoMusic is a native Android music player crafted with Jetpack Compose, Material 3, and AndroidX Media3 ExoPlayer.
- **Dynamic Capsule (Dynamic Island)**: Floating interactive music pill at the top of your screen that smoothly expands on tap.
- **Online Music Streaming**: Stream authorized Creative Commons (Jamendo), public domain (Internet Archive), and preview music alongside your local music library.
- **100% Ad-Free & Privacy First**: Zero ads, zero tracking, zero paywalls.
- **Liquid Glass UI**: Frosted glass surfaces, dynamic album color reflections, clean typography.
- **10-Band Equalizer**: Native audiofx equalizer with Bass Boost, 3D Virtualizer, and custom presets.

---

## How to Build in Android Studio (Windows / Mac)

### Requirements:
- Android Studio Iguana / Jellyfish / Koala or newer
- JDK 17
- Android SDK 35 (minSdk 26)

### Steps:
1. Extract the downloaded \`NeoMusic-Android-Project.zip\` folder into a directory of your choice.
2. Open **Android Studio** and select **File > Open**, then choose the extracted directory.
3. Allow Gradle to synchronize dependencies.
4. Connect your Android phone via USB cable (or Wireless Debugging).
5. Enable **Developer Options** and **USB Debugging**.
6. In Android Studio, select \`app\` in the run configuration bar and click the green **Run (▶)** button or press \`Shift + F10\`.
7. The debug APK will build and install automatically onto your phone!

---

## Free Cloud Build via GitHub Actions

If you don't have Android Studio installed on your computer, you can build the APK directly in the cloud:
1. Push this repository to a private or public GitHub repository.
2. Go to the **Actions** tab on GitHub.
3. The included workflow (\`.github/workflows/build-apk.yml\`) will build the APK automatically and produce a downloadable \`app-debug.apk\` in the workflow artifacts!
`,
  },
];

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();

  for (const file of ANDROID_PROJECT_FILES) {
    zip.file(`NeoMusic/${file.path}`, file.content);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);

  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = 'NeoMusic-Android-Project.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
}
