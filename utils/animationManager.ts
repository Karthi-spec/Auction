import { useAuctionStore } from '@/store/auctionStore'

export interface AnimationQueueItem {
  id: string
  type: 'sold' | 'rtm' | 'retained' | 'unsold'
  data: any
  duration: number
  onComplete?: () => void
}

class AnimationManager {
  private queue: AnimationQueueItem[] = []
  private isPlaying = false
  private currentAnimation: AnimationQueueItem | null = null

  // Add animation to queue
  enqueue(animation: AnimationQueueItem) {
    this.queue.push(animation)
    if (!this.isPlaying) {
      this.playNext()
    }
  }

  // Play next animation in queue
  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false
      this.currentAnimation = null
      return
    }

    this.isPlaying = true
    this.currentAnimation = this.queue.shift()!
    
    // Trigger the animation in the store
    this.triggerAnimation(this.currentAnimation)

    // Wait for animation duration
    setTimeout(() => {
      this.completeAnimation()
    }, this.currentAnimation.duration)
  }

  // Trigger animation in store
  private triggerAnimation(animation: AnimationQueueItem) {
    const store = useAuctionStore.getState()
    
    // Clear all other animations first
    store.setShowSoldAnimation(false)
    store.setShowRTMAnimation(false)
    store.setShowRetainedAnimation(false)
    store.setShowUnsoldAnimation(false)

    // Wait a brief moment to ensure previous animations are cleared
    setTimeout(() => {
      switch (animation.type) {
        case 'sold':
          useAuctionStore.setState({
            showSoldAnimation: true,
            soldAnimationData: animation.data
          })
          break
        case 'rtm':
          useAuctionStore.setState({
            showRTMAnimation: true,
            rtmAnimationData: animation.data
          })
          break
        case 'retained':
          useAuctionStore.setState({
            showRetainedAnimation: true,
            retainedAnimationData: animation.data
          })
          break
        case 'unsold':
          useAuctionStore.setState({
            showUnsoldAnimation: true,
            unsoldAnimationData: animation.data
          })
          break
      }
    }, 100)
  }

  // Complete current animation and play next
  private completeAnimation() {
    if (this.currentAnimation) {
      // Clear the animation
      const store = useAuctionStore.getState()
      switch (this.currentAnimation.type) {
        case 'sold':
          store.setShowSoldAnimation(false)
          break
        case 'rtm':
          store.setShowRTMAnimation(false)
          break
        case 'retained':
          store.setShowRetainedAnimation(false)
          break
        case 'unsold':
          store.setShowUnsoldAnimation(false)
          break
      }

      // Call completion callback
      if (this.currentAnimation.onComplete) {
        this.currentAnimation.onComplete()
      }
    }

    // Play next animation
    this.playNext()
  }

  // Clear all animations and queue
  clear() {
    this.queue = []
    this.isPlaying = false
    this.currentAnimation = null
    
    // Clear all animations in store
    const store = useAuctionStore.getState()
    store.setShowSoldAnimation(false)
    store.setShowRTMAnimation(false)
    store.setShowRetainedAnimation(false)
    store.setShowUnsoldAnimation(false)
  }

  // Check if any animation is currently playing
  isAnimationPlaying(): boolean {
    return this.isPlaying
  }

  // Get current animation
  getCurrentAnimation(): AnimationQueueItem | null {
    return this.currentAnimation
  }

  // Get queue length
  getQueueLength(): number {
    return this.queue.length
  }
}

// Export singleton instance
export const animationManager = new AnimationManager()

// Helper functions for common animations
export const triggerSoldAnimation = (team: any, playerName: string, amount: number, onComplete?: () => void) => {
  animationManager.enqueue({
    id: `sold-${Date.now()}`,
    type: 'sold',
    data: { team, playerName, amount },
    duration: 8000, // 8 seconds
    onComplete
  })
}

export const triggerRTMAnimation = (team: any, playerName: string, amount: number, onComplete?: () => void) => {
  animationManager.enqueue({
    id: `rtm-${Date.now()}`,
    type: 'rtm',
    data: { team, playerName, amount },
    duration: 8000, // 8 seconds
    onComplete
  })
}

export const triggerRetainedAnimation = (team: any, playerName: string, amount: number, onComplete?: () => void) => {
  animationManager.enqueue({
    id: `retained-${Date.now()}`,
    type: 'retained',
    data: { team, playerName, amount },
    duration: 8000, // 8 seconds
    onComplete
  })
}

export const triggerUnsoldAnimation = (playerName: string, onComplete?: () => void) => {
  animationManager.enqueue({
    id: `unsold-${Date.now()}`,
    type: 'unsold',
    data: { playerName },
    duration: 6000, // 6 seconds
    onComplete
  })
}