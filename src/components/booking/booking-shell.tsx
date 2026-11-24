import type { ReactNode } from 'react'
import type { BookingStep } from '@/modules/booking/booking-routes'
import { Stepper, type StepLink } from './stepper'
import { StepTransition } from './step-transition'

export function BookingShell({
  step,
  completed = [],
  children,
}: {
  step: BookingStep
  completed?: readonly StepLink[]
  children: ReactNode
}) {
  return (
    <div className="container-page py-8 md:py-14">
      <Stepper current={step} completed={completed} />
      <div className="mt-10">
        <StepTransition stepKey={step}>{children}</StepTransition>
      </div>
    </div>
  )
}
