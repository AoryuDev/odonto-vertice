import { getTranslations } from 'next-intl/server'
import { getPathname } from '@/i18n/navigation'
import { localeFrom } from '@/i18n/server'
import { absoluteUrl } from '@/lib/site'
import { buildIcs } from '@/modules/booking/ics'
import { loadManageView } from '@/modules/booking/manage-view'
import { clinic, formatAddressLine } from '@/modules/catalog/clinic'

type Context = { params: Promise<{ locale: string; token: string }> }

export async function GET(_request: Request, { params }: Context) {
  const { locale: requested, token } = await params
  const locale = localeFrom(requested)
  const [t, view] = await Promise.all([
    getTranslations({ locale, namespace: 'calendar' }),
    loadManageView(token),
  ])
  if (!view) return new Response(t('notFound'), { status: 404 })

  const { appointment } = view
  const manageUrl = absoluteUrl(getPathname({ href: `/agendamento/${token}`, locale }))
  const ics = buildIcs({
    uid: `${appointment.id}@odontovertice`,
    start: appointment.startsAt,
    end: appointment.endsAt,
    summary: t('summary', { treatment: appointment.treatment.name, clinic: clinic.name }),
    description: t('description', { dentist: appointment.dentist.displayName, url: manageUrl }),
    location: formatAddressLine(),
    url: manageUrl,
    cancelled: appointment.status === 'cancelled',
  })

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${t('filename')}"`,
      'Cache-Control': 'private, no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex',
    },
  })
}
