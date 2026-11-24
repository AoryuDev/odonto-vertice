import { bookingHref } from '@/modules/booking/booking-routes'
import type { BookingChoice } from '@/modules/booking/booking-view'
import type { StepLink } from './stepper'

export function choiceLinks(
  choice: Pick<BookingChoice, 'treatment' | 'dentist'>,
  anyDentistLabel: string,
): StepLink[] {
  return [
    { step: 'treatment', href: bookingHref({}), value: choice.treatment.name },
    {
      step: 'dentist',
      href: bookingHref({ treatment: choice.treatment.slug }),
      value: choice.dentist?.displayName ?? anyDentistLabel,
    },
  ]
}
