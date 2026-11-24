'use client'

import * as m from 'motion/react-m'
import type { ReactNode } from 'react'

export function StepTransition({ stepKey, children }: { stepKey: string; children: ReactNode }) {
  return (
    <m.div
      key={stepKey}
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  )
}
