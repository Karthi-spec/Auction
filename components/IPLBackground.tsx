'use client'

import { motion } from 'framer-motion'

export default function IPLBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Decorative circles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-dotted"
          style={{
            width: `${200 + i * 50}px`,
            height: `${200 + i * 50}px`,
            top: i % 2 === 0 ? `${10 + i * 5}%` : 'auto',
            bottom: i % 2 === 1 ? `${10 + i * 5}%` : 'auto',
            left: i % 3 === 0 ? `${-5 + i * 10}%` : 'auto',
            right: i % 3 !== 0 ? `${-5 + i * 10}%` : 'auto',
            borderColor: i % 2 === 0 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(139, 92, 246, 0.1)',
          }}
          animate={{
            rotate: i % 2 === 0 ? 360 : -360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: {
              duration: 40 + i * 10,
              repeat: Infinity,
              ease: 'linear',
            },
            scale: {
              duration: 5 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        />
      ))}

      {/* Glowing orbs */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full blur-3xl"
          style={{
            width: `${150 + i * 50}px`,
            height: `${150 + i * 50}px`,
            top: i % 2 === 0 ? `${20 + i * 15}%` : 'auto',
            bottom: i % 2 === 1 ? `${20 + i * 15}%` : 'auto',
            left: i % 2 === 0 ? `${10 + i * 20}%` : 'auto',
            right: i % 2 === 1 ? `${10 + i * 20}%` : 'auto',
            background: i % 2 === 0 
              ? 'radial-gradient(circle, rgba(255, 215, 0, 0.15), transparent)'
              : 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Dotted connection lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="dots" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#FFD700" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  )
}
