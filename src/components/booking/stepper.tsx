import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { CheckIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import type { BookingStep } from '@/modules/booking/booking-routes'

const STEPS = ['treatment', 'dentist', 'slot', 'details', 'done'] as const satisfies readonly (
  BookingStep | 'done'
)[]

export type StepLink = { readonly step: BookingStep; readonly href: string; readonly value: string }

export function Stepper({
  current,
  completed,
}: {
  current: BookingStep
  completed: readonly StepLink[]
}) {
  const t = useTranslations('booking.stepper')
  const currentIndex = STEPS.findIndex((step) => step === current)
  const label = (step: BookingStep | 'done') => t(`steps.${step}`)

  return (
    <div>
      <ol className="flex items-center gap-1.5" aria-label={t('label')}>
        {STEPS.map((step, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo'
          return (
            <li
              key={step}
              aria-current={state === 'current' ? 'step' : undefined}
              className="flex flex-1 flex-col gap-2"
            >
              <span
                className={cn(
                  'h-1 rounded-full',
                  state === 'todo'
                    ? 'bg-line'
                    : state === 'current'
                      ? 'bg-clay-500'
                      : 'bg-pine-700',
                )}
              />
              <span
                className={cn(
                  'hidden text-xs font-medium sm:block',
                  state === 'todo' ? 'text-ink-soft' : 'text-ink',
                )}
              >
                {label(step)}
                <span className="sr-only">
                  {state === 'done'
                    ? ` ${t('stateDone')}`
                    : state === 'current'
                      ? ` ${t('stateCurrent')}`
                      : ''}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-sm text-ink-soft sm:hidden">
        {t.rich('progress', {
          current: currentIndex + 1,
          total: STEPS.length,
          label: label(current),
          step: (chunks) => <span className="text-ink">{chunks}</span>,
        })}
      </p>

      {completed.length > 0 ? (
        <ul aria-label={t('choices')} className="mt-6 flex flex-wrap gap-2">
          {completed.map((item) => (
            <li
              key={item.step}
              className="flex items-center gap-2 rounded-full border border-line bg-card py-1.5 pr-1.5 pl-3 text-sm"
            >
              <CheckIcon size={16} className="text-pine-700" />
              <span className="sr-only">{label(item.step)}: </span>
              <span className="text-ink">{item.value}</span>
              <Link
                href={item.href}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium text-pine-800 hover:bg-pine-100"
              >
                {t('change')}
                <span className="sr-only"> {label(item.step).toLowerCase()}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
