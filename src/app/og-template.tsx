import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

async function loadFonts() {
  const [display, sans] = await Promise.all([
    readFile(join(process.cwd(), 'src/assets/fonts/Newsreader-Medium.woff')),
    readFile(join(process.cwd(), 'src/assets/fonts/HankenGrotesk-Medium.woff')),
  ])
  return [
    { name: 'Newsreader', data: display, weight: 500 as const, style: 'normal' as const },
    { name: 'Hanken Grotesk', data: sans, weight: 500 as const, style: 'normal' as const },
  ]
}

export async function renderOgImage({ eyebrow, title }: { eyebrow: string; title: string }) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#f6f1e8',
        fontFamily: 'Hanken Grotesk',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          flex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#153a2f' }}>
          <svg width="56" height="56" viewBox="0 0 28 28" fill="none">
            <path
              d="M7.2 4.6c2.4-1.3 4.6-1.2 6.8.3 2.2-1.5 4.4-1.6 6.8-.3 2.4 1.3 3 4.4 2.1 8.1-.8 3.4-1.7 6.5-2.6 9.4-.6 1.8-3 1.8-3.5 0L15.6 17h-3.2l-1.2 5.1c-.5 1.8-2.9 1.8-3.5 0-.9-2.9-1.8-6-2.6-9.4-.9-3.7-.3-6.8 2.1-8.1Z"
              stroke="#153a2f"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="m10.3 8.6 3.7 4.2 3.7-4.2"
              stroke="#c0673d"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontFamily: 'Newsreader', fontSize: 40 }}>Odonto Vértice</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              color: '#a14f2b',
              fontSize: 26,
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              fontFamily: 'Newsreader',
              fontSize: 76,
              lineHeight: 1.05,
              color: '#1b2823',
              marginTop: 20,
              maxWidth: 820,
            }}
          >
            {title}
          </span>
        </div>
        <span style={{ fontSize: 26, color: '#4a5852' }}>
          Avenida T-10 · Setor Bueno · Goiânia — GO
        </span>
      </div>
      <div style={{ width: 150, display: 'flex', background: '#1d4a3c' }} />
    </div>,
    { ...OG_SIZE, fonts: await loadFonts() },
  )
}
