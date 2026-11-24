export const PG_EXCLUSION_VIOLATION = '23P01'
export const PG_RAISE_EXCEPTION = 'P0001'

export type DbError = { code?: string; message: string }

export function isExclusionViolation(error: DbError): boolean {
  return error.code === PG_EXCLUSION_VIOLATION
}

export function raisedReason(error: DbError): string | undefined {
  return error.code === PG_RAISE_EXCEPTION ? error.message : undefined
}
