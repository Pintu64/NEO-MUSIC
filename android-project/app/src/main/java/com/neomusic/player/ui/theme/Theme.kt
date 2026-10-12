package com.neomusic.player.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF00F2FE),
    secondary = Color(0xFF38F9D7),
    tertiary = Color(0xFFFF4B2B),
    background = Color(0xFF080A0F),
    surface = Color(0xFF121826).copy(alpha = 0.65f),
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onBackground = Color(0xFFF1F5F9),
    onSurface = Color(0xFFF1F5F9)
)

@Composable
fun NeoMusicTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
