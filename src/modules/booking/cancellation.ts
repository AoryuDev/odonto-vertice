import { PATIENT_CANCELLATION_REASONS, type PatientCancellationReason } from './schemas'

const PATIENT_PREFIX = 'patient'

export type CancellationNote =
  | { readonly kind: 'patient'; readonly reason: PatientCancellationReason | undefined }
  | { readonly kind: 'staff'; readonly text: string }

export function patientCancellationCode(reason?: PatientCancellationReason): string {
  return reason ? `${PATIENT_PREFIX}:${reason}` : PATIENT_PREFIX
}

export function parseCancellationNote(value: string): CancellationNote {
  if (value === PATIENT_PREFIX) return { kind: 'patient', reason: undefined }
  const [prefix, code] = value.split(':')
  const reason = PATIENT_CANCELLATION_REASONS.find((candidate) => candidate === code)
  if (prefix === PATIENT_PREFIX && reason) return { kind: 'patient', reason }
  return { kind: 'staff', text: value }
}
