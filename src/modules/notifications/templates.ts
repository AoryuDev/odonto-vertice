import { createTranslator } from 'next-intl'
import { HTML_LANG } from '@/i18n/locales'
import type { AppLocale } from '@/i18n/routing'
import { SERVER_MESSAGES } from '@/i18n/server-messages'
import { capitalize, formatLongDate, formatTime } from '@/lib/format'
import { clinic, formatAddressLine } from '@/modules/catalog/clinic'
import type { AppointmentNotice } from './types'

type Copy = { subject: string; heading: string; lead: string; cta: string }

function emailTranslator(locale: AppLocale) {
  return createTranslator({ locale, messages: SERVER_MESSAGES[locale], namespace: 'email' })
}

function copyFor(notice: AppointmentNotice): Copy {
  const t = emailTranslator(notice.locale)
  const { startsAt, treatmentName } = notice.appointment
  const values = {
    treatment: treatmentName,
    time: formatTime(startsAt, notice.locale),
    date: formatLongDate(startsAt, notice.locale),
    clinic: clinic.name,
  }
  return {
    subject: t(`kinds.${notice.kind}.subject`, values),
    heading: t(`kinds.${notice.kind}.heading`),
    lead: t(`kinds.${notice.kind}.lead`),
    cta: t(`kinds.${notice.kind}.cta`),
  }
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
  return emailTranslator(notice.locale)('whenValue', {
    date: capitalize(formatLongDate(startsAt, notice.locale)),
    time: formatTime(startsAt, notice.locale),
  })
}

export function describeWhenForWhatsApp(notice: AppointmentNotice): string {
  const { startsAt } = notice.appointment
  return emailTranslator(notice.locale)('whatsappWhen', {
    date: capitalize(formatLongDate(startsAt, notice.locale)),
    time: formatTime(startsAt, notice.locale),
  })
}

function describeVisit(notice: AppointmentNotice): string {
  return emailTranslator(notice.locale)('visitValue', {
    treatment: notice.appointment.treatmentName,
    dentist: notice.appointment.dentistName,
  })
}

export function renderShortText(notice: AppointmentNotice): string {
  const t = emailTranslator(notice.locale)
  const copy = copyFor(notice)
  return [
    `${clinic.name} — ${copy.heading}`,
    `${t('greeting', { name: firstName(notice.patient.name) })} ${copy.lead}`,
    describeVisit(notice),
    describeWhen(notice),
    formatAddressLine(),
    `${copy.cta}: ${notice.appointment.manageUrl}`,
  ].join('\n')
}

export type RenderedEmail = { subject: string; text: string; html: string }

export function renderEmail(notice: AppointmentNotice): RenderedEmail {
  const t = emailTranslator(notice.locale)
  const copy = copyFor(notice)
  const safe = {
    greeting: escapeHtml(t('greeting', { name: firstName(notice.patient.name) })),
    visit: escapeHtml(describeVisit(notice)),
    when: escapeHtml(describeWhen(notice)),
    url: escapeHtml(notice.appointment.manageUrl),
    address: escapeHtml(formatAddressLine()),
    footer: escapeHtml(t('footer', { email: clinic.email })),
  }

  const html = `<!doctype html>
<html lang="${HTML_LANG[notice.locale]}">
<body style="margin:0;background:#f6f1e8;font-family:Arial,Helvetica,sans-serif;color:#1d2a25">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border:1px solid #e6dccb;border-radius:12px">
        <tr><td style="padding:28px 32px 8px;font-family:Georgia,serif;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#1f4d3f">${escapeHtml(clinic.name)}</td></tr>
        <tr><td style="padding:0 32px;font-family:Georgia,serif;font-size:28px;line-height:1.2;color:#173b30">${escapeHtml(copy.heading)}</td></tr>
        <tr><td style="padding:16px 32px 0;font-size:16px;line-height:1.6">${safe.greeting} ${escapeHtml(copy.lead)}</td></tr>
        <tr><td style="padding:24px 32px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e6dccb;border-bottom:1px solid #e6dccb">
            <tr><td style="padding:16px 0 4px;font-size:13px;color:#5b6b64">${escapeHtml(t('when'))}</td></tr>
            <tr><td style="padding:0 0 12px;font-size:17px;font-weight:bold">${safe.when}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#5b6b64">${escapeHtml(t('visit'))}</td></tr>
            <tr><td style="padding:0 0 12px;font-size:16px">${safe.visit}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#5b6b64">${escapeHtml(t('where'))}</td></tr>
            <tr><td style="padding:0 0 16px;font-size:16px">${safe.address}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 32px"><a href="${safe.url}" style="display:inline-block;background:#1f4d3f;color:#fffdf8;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:15px">${escapeHtml(copy.cta)}</a></td></tr>
        <tr><td style="padding:0 32px 28px;font-size:13px;line-height:1.6;color:#5b6b64">${safe.footer}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject: copy.subject, text: renderShortText(notice), html }
}
