import { getTranslations } from 'next-intl/server'
import { ButtonLink } from '@/components/ui/button'
import { CalendarIcon } from '@/components/ui/icons'

export async function MobileBookingBar() {
  const t = await getTranslations('mobileBar')
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
      <ButtonLink href="/agendar" className="w-full" size="lg">
        <CalendarIcon size={18} />
        {t('book')}
      </ButtonLink>
    </div>
  )
}
