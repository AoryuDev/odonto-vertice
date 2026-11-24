import { getLocale } from 'next-intl/server'

export async function LocaleField() {
  return <input type="hidden" name="locale" value={await getLocale()} />
}
