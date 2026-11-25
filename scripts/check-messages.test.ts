import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import en from '../messages/en.json'
import pt from '../messages/pt.json'
import { compareMessages, configuredLocales, placeholders, tags } from './check-messages'

describe('message file check', () => {
  it('passes for the message files in the repository', () => {
    expect(compareMessages({ pt, en }, 'pt')).toEqual([])
    expect(configuredLocales(readFileSync('src/i18n/routing.ts', 'utf8'))).toEqual(['pt', 'en'])
  })

  it('reports keys missing from any language', () => {
    const problems = compareMessages(
      {
        pt: { home: { title: 'Olá', body: 'Texto' } },
        en: { home: { title: 'Hello' }, extra: 'Only here' },
      },
      'pt',
    )

    expect(problems).toEqual([
      { locale: 'pt', key: 'extra', problem: 'missing' },
      { locale: 'en', key: 'home.body', problem: 'missing' },
    ])
  })

  it('reports empty messages and mismatched placeholders or tags', () => {
    const problems = compareMessages(
      {
        pt: { a: 'Ligue para {phone}', b: 'Veja <link>aqui</link>', c: 'Oi' },
        en: { a: 'Call {number}', b: 'See here', c: ' ' },
      },
      'pt',
    )

    expect(problems).toEqual([
      { locale: 'en', key: 'a', problem: 'placeholders' },
      { locale: 'en', key: 'b', problem: 'tags' },
      { locale: 'en', key: 'c', problem: 'empty' },
    ])
  })

  it('reads ICU arguments without confusing plural branches for placeholders', () => {
    expect(placeholders('{count, plural, one {# horário} other {# horários}} · {date}')).toBe(
      'count,date',
    )
    expect(placeholders('Há {count, plural, one {Há # consulta} other {# consultas}}')).toBe(
      'count',
    )
    expect(tags('<em>a</em> e <tabular>{time}</tabular>')).toBe('em,tabular')
  })
})
