import Link from 'next/link'
import { CheckIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import type { BookingStep } from '@/modules/booking/search-params'

const STEPS: readonly { key: BookingStep | 'done'; label: string }[] = [
  { key: 'treatment', label: 'Tratamento' },
  { key: 'dentist', label: 'Dentista' },
  { key: 'slot', label: 'Dia e horário' },
  { key: 'details', label: 'Seus dados' },
  { key: 'done', label: 'Confirmação' },
]

export type StepLink = { readonly step: BookingStep; readonly href: string; readonly value: string }

export function Stepper({
  current,
  completed,
}: {
  current: BookingStep
  completed: readonly StepLink[]
}) {
  const currentIndex = STEPS.findIndex((step) => step.key === current)

  return (
    <div>
      <ol className="flex items-center gap-1.5" aria-label="Etapas do agendamento">
        {STEPS.map((step, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo'
          return (
            <li
              key={step.key}
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
                {step.label}
                <span className="sr-only">
                  {state === 'done' ? ' (concluída)' : state === 'current' ? ' (etapa atual)' : ''}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-sm text-ink-soft sm:hidden">
        Etapa {currentIndex + 1} de {STEPS.length} ·{' '}
        <span className="text-ink">{STEPS[currentIndex]?.label}</span>
      </p>

      {completed.length > 0 ? (
        <dl className="mt-6 flex flex-wrap gap-2">
          {completed.map((item) => (
            <div
              key={item.step}
              className="flex items-center gap-2 rounded-full border border-line bg-card py-1.5 pr-1.5 pl-3 text-sm"
            >
              <CheckIcon size={16} className="text-pine-700" />
              <dt className="sr-only">{STEPS.find((step) => step.key === item.step)?.label}</dt>
              <dd className="text-ink">{item.value}</dd>
              <Link
                href={item.href}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium text-pine-800 hover:bg-pine-100"
              >
                Alterar
                <span className="sr-only">
                  {' '}
                  {STEPS.find((step) => step.key === item.step)?.label.toLowerCase()}
                </span>
              </Link>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  )
}
