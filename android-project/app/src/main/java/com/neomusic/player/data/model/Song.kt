package com.neomusic.player.data.model

data class Song(
    val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val duration: Int,
    val contentUri: String,
    val artworkUri: String,
    val filePath: String,
    val isFavorite: Boolean = false
)
