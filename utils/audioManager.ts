// Audio Manager for IPL Auction System
class AudioManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map()
  private isEnabled: boolean = true
  private volume: number = 0.7
  private debugMode: boolean = true

  constructor() {
    // Initialize audio cache only in browser environment
    if (typeof window !== 'undefined') {
      this.preloadSounds()
    }
  }

  private preloadSounds() {
    const sounds = [
      'bid',
      'rtm',
      'sold',
      'retained', 
      'unsold',
      'countdown',
      'success',
      'notification'
    ]

    if (this.debugMode) {
      console.log('🔊 AudioManager: Preloading sounds...')
    }

    sounds.forEach(sound => {
      try {
        // Try MP3 first, then WAV as fallback
        const audio = new Audio(`/sounds/${sound}.mp3`)
        audio.preload = 'auto'
        audio.volume = this.volume
        
        // Add event listeners for debugging
        audio.addEventListener('canplaythrough', () => {
          if (this.debugMode) {
            console.log(`✅ Sound loaded: ${sound}.mp3`)
          }
        })
        
        audio.addEventListener('error', (e) => {
          if (this.debugMode) {
            console.warn(`❌ Failed to load ${sound}.mp3, trying WAV...`)
          }
          
          // Try WAV as fallback
          const wavAudio = new Audio(`/sounds/${sound}.wav`)
          wavAudio.preload = 'auto'
          wavAudio.volume = this.volume
          
          wavAudio.addEventListener('canplaythrough', () => {
            if (this.debugMode) {
              console.log(`✅ Sound loaded: ${sound}.wav`)
            }
          })
          
          wavAudio.addEventListener('error', (e2) => {
            console.warn(`❌ Failed to load both ${sound}.mp3 and ${sound}.wav`, e2)
          })
          
          this.audioCache.set(sound, wavAudio)
        })
        
        this.audioCache.set(sound, audio)
      } catch (error) {
        console.warn(`Could not preload sound: ${sound}`, error)
      }
    })
  }

  private playSound(soundName: string, volume?: number) {
    if (!this.isEnabled) {
      if (this.debugMode) {
        console.log(`🔇 Audio disabled, skipping: ${soundName}`)
      }
      return
    }

    if (this.debugMode) {
      console.log(`🔊 Attempting to play sound: ${soundName}`)
    }

    try {
      const audio = this.audioCache.get(soundName)
      if (audio) {
        // Clone the audio to allow multiple simultaneous plays
        const audioClone = audio.cloneNode() as HTMLAudioElement
        audioClone.volume = volume !== undefined ? volume : this.volume
        
        if (this.debugMode) {
          console.log(`🎵 Playing ${soundName} at volume ${audioClone.volume}`)
        }
        
        // Play the sound
        const playPromise = audioClone.play()
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (this.debugMode) {
                console.log(`✅ Successfully played: ${soundName}`)
              }
            })
            .catch(error => {
              console.warn(`❌ Could not play sound: ${soundName}`, error)
              // Try to create a beep sound as fallback
              this.createBeepSound()
            })
        }
      } else {
        console.warn(`❌ Sound not found in cache: ${soundName}`)
        // Try to create a beep sound as fallback
        this.createBeepSound()
      }
    } catch (error) {
      console.warn(`❌ Error playing sound: ${soundName}`, error)
    }
  }

  // Fallback beep sound using Web Audio API
  private createBeepSound() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
      
      if (this.debugMode) {
        console.log('🔔 Played fallback beep sound')
      }
    } catch (error) {
      console.warn('Could not create fallback beep sound', error)
    }
  }

  // Public methods for different auction actions
  playBidSound() {
    this.playSound('bid', 0.6)
  }

  playRTMSound() {
    this.playSound('rtm', 0.8)
  }

  playSoldSound() {
    this.playSound('sold', 0.9)
  }

  playRetainedSound() {
    this.playSound('retained', 0.8)
  }

  playUnsoldSound() {
    this.playSound('unsold', 0.7)
  }

  playCountdownSound() {
    this.playSound('countdown', 0.5)
  }

  playSuccessSound() {
    this.playSound('success', 0.8)
  }

  playNotificationSound() {
    this.playSound('notification', 0.6)
  }

  // Control methods
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    this.audioCache.forEach(audio => {
      audio.volume = this.volume
    })
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled
    return this.isEnabled
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  isAudioEnabled(): boolean {
    return this.isEnabled
  }

  getVolume(): number {
    return this.volume
  }

  setDebugMode(enabled: boolean) {
    this.debugMode = enabled
    console.log(`🔊 AudioManager debug mode: ${enabled ? 'ON' : 'OFF'}`)
  }

  // Test method to check if audio system is working
  testAudio() {
    console.log('🧪 Testing audio system...')
    console.log(`Audio enabled: ${this.isEnabled}`)
    console.log(`Volume: ${this.volume}`)
    console.log(`Cached sounds: ${Array.from(this.audioCache.keys()).join(', ')}`)
    
    // Test with a beep sound
    this.createBeepSound()
  }
}

// Export singleton instance
export const audioManager = new AudioManager()
export default audioManager