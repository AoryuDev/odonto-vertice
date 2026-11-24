import { routing } from '@/i18n/routing'
import { capitalize, formatLongDate, formatTime } from '@/lib/format'
import { clinic, formatAddressLine } from '@/modules/catalog/clinic'
import type { AppointmentNotice, NoticeKind } from './types'

const locale = routing.defaultLocale

type Copy = { subject: string; heading: string; lead: string; cta: string }

const COPY: Record<NoticeKind, (notice: AppointmentNotice) => Copy> = {
  confirmation: ({ appointment }) => ({
    subject: `Consulta confirmada — ${appointment.treatmentName}, ${formatTime(appointment.startsAt, locale)}`,
    heading: 'Sua consulta está confirmada',
    lead: 'Guarde este e-mail. Pelo link abaixo você remarca ou cancela sem precisar ligar.',
    cta: 'Ver, remarcar ou cancelar',
  }),
  reminder: ({ appointment }) => ({
    subject: `Lembrete: amanhã às ${formatTime(appointment.startsAt, locale)} na ${clinic.name}`,
    heading: 'Até amanhã',
    lead: 'Passando para lembrar da sua consulta. Se não puder vir, avise pelo link para liberarmos o horário para outro paciente.',
    cta: 'Remarcar ou cancelar',
  }),
  reschedule: ({ appointment }) => ({
    subject: `Consulta remarcada para ${formatLongDate(appointment.startsAt, locale)}`,
    heading: 'Novo horário confirmado',
    lead: 'Sua consulta foi remarcada. O link para gerenciar continua o mesmo.',
    cta: 'Ver detalhes',
  }),
  cancellation: () => ({
    subject: `Consulta cancelada — ${clinic.name}`,
    heading: 'Consulta cancelada',
    lead: 'O horário foi liberado. Quando quiser, é só agendar de novo pelo site.',
    cta: 'Agendar outro horário',
  }),
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}

export function describeWhen(notice: AppointmentNotice): string {
  const { startsAt } = notice.appointment
  return `${capitalize(formatLongDate(startsAt, locale))}, às ${formatTime(startsAt, locale)}`
}

export function renderShortText(notice: AppointmentNotice): string {
  const copy = COPY[notice.kind](notice)
  const { appointment } = notice
  return [
    `${clinic.name} — ${copy.heading}`,
    `Olá, ${firstName(notice.patient.name)}. ${copy.lead}`,
    `${appointment.treatmentName} com ${appointment.dentistName}`,
    describeWhen(notice),
    formatAddressLine(),
    `${copy.cta}: ${appointment.manageUrl}`,
  ].join('\n')
}

export type RenderedEmail = { subject: string; text: string; html: string }

export function renderEmail(notice: AppointmentNotice): RenderedEmail {
  const copy = COPY[notice.kind](notice)
  const { appointment } = notice
  const safe = {
    name: escapeHtml(firstName(notice.patient.name)),
    treatment: escapeHtml(appointment.treatmentName),
    dentist: escapeHtml(appointment.dentistName),
    when: escapeHtml(describeWhen(notice)),
    url: escapeHtml(appointment.manageUrl),
    address: escapeHtml(formatAddressLine()),
  }

  const html = `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;background:#f6f1e8;font-family:Arial,Helvetica,sans-serif;color:#1d2a25">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border:1px solid #e6dccb;border-radius:12px">
        <tr><td style="padding:28px 32px 8px;font-family:Georgia,serif;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#1f4d3f">${escapeHtml(clinic.name)}</td></tr>
        <tr><td style="padding:0 32px;font-family:Georgia,serif;font-size:28px;line-height:1.2;color:#173b30">${escapeHtml(copy.heading)}</td></tr>
        <tr><td style="padding:16px 32px 0;font-size:16px;line-height:1.6">Olá, ${safe.name}. ${escapeHtml(copy.lead)}</td></tr>
        <tr><td style="padding:24px 32px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e6dccb;border-bottom:1px solid #e6dccb">
            <tr><td style="padding:16px 0 4px;font-size:13px;color:#5b6b64">Quando</td></tr>
            <tr><td style="padding:0 0 12px;font-size:17px;font-weight:bold">${safe.when}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#5b6b64">Consulta</td></tr>
            <tr><td style="padding:0 0 12px;font-size:16px">${safe.treatment} com ${safe.dentist}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#5b6b64">Onde</td></tr>
            <tr><td style="padding:0 0 16px;font-size:16px">${safe.address}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 32px"><a href="${safe.url}" style="display:inline-block;background:#1f4d3f;color:#fffdf8;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:15px">${escapeHtml(copy.cta)}</a></td></tr>
        <tr><td style="padding:0 32px 28px;font-size:13px;line-height:1.6;color:#5b6b64">Chegue com 10 minutos de antecedência. Dúvidas: ${escapeHtml(clinic.phone.display)}.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject: copy.subject, text: renderShortText(notice), html }
}
