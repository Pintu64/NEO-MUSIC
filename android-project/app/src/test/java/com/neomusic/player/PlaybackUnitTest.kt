package com.neomusic.player

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
    fun testQueueNavigation() {
        val queue = listOf("song1", "song2", "song3")
        var currentIndex = 0

        // Next
        currentIndex = (currentIndex + 1).coerceAtMost(queue.size - 1)
        assertEquals(1, currentIndex)

        // Previous
        currentIndex = (currentIndex - 1).coerceAtLeast(0)
        assertEquals(0, currentIndex)
    }

    @Test
    fun testDuplicateDetectionLogic() {
        fun isDuplicate(s1: Song, s2: Song): Boolean {
            val titleMatch = s1.title.trim().equals(s2.title.trim(), ignoreCase = true)
            val artistMatch = s1.artist.trim().equals(s2.artist.trim(), ignoreCase = true)
            val durationMatch = Math.abs(s1.duration - s2.duration) <= 3
            return titleMatch && artistMatch && durationMatch
        }

        val trackA = Song("1", "Night Drive", "Kaelen", "Album A", 180, "", "", "/path/a.mp3")
        val trackB = Song("2", "Night Drive", "Kaelen", "Album A", 181, "", "", "/path/b.mp3")
        val trackC = Song("3", "Sun Rise", "Kaelen", "Album A", 180, "", "", "/path/c.mp3")

        assertTrue(isDuplicate(trackA, trackB))
        assertEquals(false, isDuplicate(trackA, trackC))
    }
}
