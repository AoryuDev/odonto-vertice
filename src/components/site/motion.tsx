'use client'

import { domAnimation, LazyMotion, m, MotionConfig, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}

type RevealProps = HTMLMotionProps<'div'> & { delay?: number; distance?: number }

export function Reveal({ delay = 0, distance = 18, children, ...props }: RevealProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </m.div>
  )
}
