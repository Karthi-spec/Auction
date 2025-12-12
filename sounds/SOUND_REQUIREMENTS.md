# IPL Auction Sound Effects Requirements

## Required Sound Files

Place these audio files in the `/sounds/` directory (or `/public/sounds/` for web access):

### 1. **bid.mp3** - Bid Placed Sound
- **When**: Team places a bid
- **Suggested**: Cash register "cha-ching", coin drop, or bell sound
- **Duration**: 0.5-1 second
- **Volume**: Medium (60%)

### 2. **rtm.mp3** - Right to Match Sound  
- **When**: Team uses RTM
- **Suggested**: Power-up sound, dramatic chord, or "match" announcement
- **Duration**: 1-2 seconds
- **Volume**: High (80%)

### 3. **sold.mp3** - Player Sold Sound
- **When**: Player is successfully sold
- **Suggested**: Applause, success fanfare, or "SOLD!" announcement
- **Duration**: 2-3 seconds  
- **Volume**: High (90%)

### 4. **retained.mp3** - Player Retained Sound
- **When**: Player is retained by team
- **Suggested**: Warm success sound, team cheer, or retention chime
- **Duration**: 1-2 seconds
- **Volume**: Medium-High (80%)

### 5. **unsold.mp3** - Player Unsold Sound
- **When**: Player goes unsold
- **Suggested**: Buzzer, "aww" sound, or negative tone
- **Duration**: 1-2 seconds
- **Volume**: Medium (70%)

### 6. **countdown.mp3** - Timer Countdown
- **When**: Last 5 seconds of bidding timer
- **Suggested**: Clock tick, beep, or countdown sound
- **Duration**: 0.2-0.5 seconds (repeats)
- **Volume**: Low-Medium (50%)

### 7. **success.mp3** - General Success
- **When**: Successful actions, confirmations
- **Suggested**: Positive chime, ding, or success tone
- **Duration**: 0.5-1 second
- **Volume**: Medium-High (80%)

### 8. **notification.mp3** - General Notification
- **When**: New bids, updates, alerts
- **Suggested**: Subtle notification sound, soft chime
- **Duration**: 0.3-0.8 seconds
- **Volume**: Medium (60%)

## Free Sound Resources

### Recommended Websites:
1. **Freesound.org** - High quality, free sounds with Creative Commons licenses
2. **Mixkit.co** - Free sound effects, no attribution required
3. **Zapsplat.com** - Professional sounds (free account required)
4. **BBC Sound Effects** - High quality BBC archive sounds
5. **Adobe Audition** - Built-in sound library if you have Creative Cloud

### Search Terms:
- "cash register", "coin drop", "cha-ching" (for bids)
- "power up", "match", "dramatic chord" (for RTM)
- "applause", "crowd cheer", "fanfare" (for sold)
- "success chime", "positive tone" (for retained)
- "buzzer", "negative", "fail sound" (for unsold)
- "clock tick", "countdown beep" (for timer)

## Audio Format Requirements

- **Format**: MP3 (preferred) or WAV
- **Quality**: 44.1kHz, 16-bit minimum
- **File Size**: Keep under 500KB per file for fast loading
- **Normalization**: Ensure consistent volume levels across all files

## Implementation Notes

The audio system will:
- ✅ Automatically preload all sounds for instant playback
- ✅ Handle missing sound files gracefully (no errors)
- ✅ Allow volume control and mute functionality
- ✅ Support multiple simultaneous sound playback
- ✅ Work across all modern browsers

## Quick Setup

1. Download sounds from the recommended sources
2. Convert to MP3 format if needed
3. Rename files to match the required names above
4. Place in `/public/sounds/` directory
5. Test in the auction system

The system will work without sounds, but they greatly enhance the user experience!