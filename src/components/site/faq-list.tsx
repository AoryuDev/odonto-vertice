import { PlusIcon } from '@/components/ui/icons'

export type Faq = { readonly question: string; readonly answer: string }

export function FaqList({ items }: { items: readonly Faq[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.question} className="group border-b border-line">
          <summary className="flex items-start justify-between gap-6 py-5 text-left font-display text-[1.3rem] leading-snug text-ink md:text-[1.45rem]">
            {item.question}
            <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-pine-800 transition-transform duration-300 group-open:rotate-45">
              <PlusIcon size={16} />
            </span>
          </summary>
          <p className="max-w-2xl pr-12 pb-6 text-ink-soft">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
