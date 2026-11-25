import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export type MessageTree = { readonly [key: string]: string | MessageTree }

export type MessageProblem = {
  readonly locale: string
  readonly key: string
  readonly problem: 'missing' | 'empty' | 'placeholders' | 'tags'
}

export function flatten(tree: MessageTree, prefix = ''): Map<string, string> {
  const entries = new Map<string, string>()
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') entries.set(path, value)
    else for (const [nested, text] of flatten(value, path)) entries.set(nested, text)
  }
  return entries
}

function uniqueSorted(values: Iterable<string>): string {
  return [...new Set(values)].sort().join(',')
}

export function placeholders(message: string): string {
  return uniqueSorted(
    Array.from(message.matchAll(/\{\s*([A-Za-z_]\w*)\s*[,}]/g), (match) => match[1] ?? ''),
  )
}

export function tags(message: string): string {
  return uniqueSorted(Array.from(message.matchAll(/<(\w+)>/g), (match) => match[1] ?? ''))
}

export function compareMessages(
  byLocale: Readonly<Record<string, MessageTree>>,
  reference: string,
): MessageProblem[] {
  const flat = Object.fromEntries(
    Object.entries(byLocale).map(([locale, tree]) => [locale, flatten(tree)]),
  )
  const allKeys = new Set(Object.values(flat).flatMap((entries) => [...entries.keys()]))
  const base = flat[reference] ?? new Map<string, string>()
  const problems: MessageProblem[] = []

  for (const [locale, entries] of Object.entries(flat)) {
    for (const key of [...allKeys].sort()) {
      const message = entries.get(key)
      if (message === undefined) {
        problems.push({ locale, key, problem: 'missing' })
        continue
      }
      if (message.trim() === '') problems.push({ locale, key, problem: 'empty' })
      const original = base.get(key)
      if (locale === reference || original === undefined) continue
      if (placeholders(message) !== placeholders(original))
        problems.push({ locale, key, problem: 'placeholders' })
      if (tags(message) !== tags(original)) problems.push({ locale, key, problem: 'tags' })
    }
  }
  return problems
}

export function configuredLocales(routingSource: string): string[] {
  const list = /locales:\s*\[([^\]]*)\]/.exec(routingSource)?.[1] ?? ''
  return Array.from(list.matchAll(/'([^']+)'/g), (match) => match[1] ?? '')
}

function main(): number {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const directory = join(root, 'messages')
  const byLocale: Record<string, MessageTree> = Object.fromEntries(
    readdirSync(directory)
      .filter((file) => file.endsWith('.json'))
      .map((file) => [
        basename(file, '.json'),
        JSON.parse(readFileSync(join(directory, file), 'utf8')) as MessageTree,
      ]),
  )
  const locales = configuredLocales(readFileSync(join(root, 'src/i18n/routing.ts'), 'utf8'))
  const missingFiles = locales.filter((locale) => !(locale in byLocale))
  const problems = compareMessages(byLocale, locales[0] ?? 'pt')

  for (const locale of missingFiles) console.error(`messages/${locale}.json is missing`)
  for (const { locale, key, problem } of problems) console.error(`${locale}: ${key} (${problem})`)
  if (missingFiles.length > 0 || problems.length > 0) {
    console.error(`\n${problems.length + missingFiles.length} problem(s) in the message files`)
    return 1
  }
  const keyCount = flatten(byLocale[locales[0] ?? 'pt'] ?? {}).size
  console.info(`Messages OK: ${keyCount} keys in ${locales.join(', ')}`)
  return 0
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(main())
