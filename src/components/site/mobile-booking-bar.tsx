import { getTranslations } from 'next-intl/server'
import { ButtonLink } from '@/components/ui/button'
import { CalendarIcon, ChatIcon } from '@/components/ui/icons'
import { whatsappUrl } from '@/modules/catalog/clinic'

export async function MobileBookingBar() {
  const t = await getTranslations('mobileBar')
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
      <div className="flex items-center gap-3">
        <ButtonLink href="/agendar" className="flex-1" size="lg">
          <CalendarIcon size={18} />
          {t('book')}
        </ButtonLink>
        <a
          href={whatsappUrl(t('whatsappMessage'))}
          className="inline-flex size-13 shrink-0 items-center justify-center rounded-full border border-line-strong text-pine-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ChatIcon size={22} />
          <span className="sr-only">{t('whatsapp')}</span>
        </a>
      </div>
    </div>
  )
}
