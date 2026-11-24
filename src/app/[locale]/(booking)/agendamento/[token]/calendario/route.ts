import { absoluteUrl } from '@/lib/site'
import { buildIcs } from '@/modules/booking/ics'
import { loadManageView } from '@/modules/booking/manage-view'
import { formatAddressLine } from '@/modules/catalog/clinic'

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const view = await loadManageView(token)
  if (!view) return new Response('Agendamento não encontrado', { status: 404 })

  const { appointment } = view
  const ics = buildIcs({
    uid: `${appointment.id}@odontovertice`,
    start: appointment.startsAt,
    end: appointment.endsAt,
    summary: `${appointment.treatment.name} · Odonto Vértice`,
    description: `Consulta com ${appointment.dentist.displayName}. Para remarcar ou cancelar: ${absoluteUrl(`/agendamento/${token}`)}`,
    location: formatAddressLine(),
    url: absoluteUrl(`/agendamento/${token}`),
    cancelled: appointment.status === 'cancelled',
  })

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="consulta-odonto-vertice.ics"',
      'Cache-Control': 'private, no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex',
    },
  })
}
