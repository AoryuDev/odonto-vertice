'use client'

import { LazyMotion, MotionConfig } from 'motion/react'
import * as m from 'motion/react-m'
import type { ComponentProps, ReactNode } from 'react'

const loadFeatures = () => import('./motion-features').then((module) => module.default)

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}

type RevealProps = ComponentProps<typeof m.div> & { delay?: number; distance?: number }

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
