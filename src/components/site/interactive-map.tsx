'use client'

import { useState } from 'react'
import { MapPinIcon } from '@/components/ui/icons'

export function InteractiveMapToggle({
  latitude,
  longitude,
  labels,
  children,
}: {
  latitude: number
  longitude: number
  labels: { readonly title: string; readonly open: string }
  children: React.ReactNode
}) {
  const [active, setActive] = useState(false)
  const delta = 0.006
  const bbox = [
    longitude - delta,
    latitude - delta * 0.7,
    longitude + delta,
    latitude + delta * 0.7,
  ]
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.join('%2C')}&layer=mapnik&marker=${latitude}%2C${longitude}`

  if (active) {
    return (
      <iframe
        title={labels.title}
        src={src}
        className="absolute inset-0 size-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <>
      {children}
      <button
        type="button"
        onClick={() => setActive(true)}
        className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-[0_8px_24px_-12px_rgba(27,40,35,0.4)] hover:bg-paper"
      >
        <MapPinIcon size={16} />
        {labels.open}
      </button>
    </>
  )
}
