import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1d4a3c',
      }}
    >
      <svg width="120" height="120" viewBox="0 0 28 28" fill="none">
        <path
          d="M7.2 4.6c2.4-1.3 4.6-1.2 6.8.3 2.2-1.5 4.4-1.6 6.8-.3 2.4 1.3 3 4.4 2.1 8.1-.8 3.4-1.7 6.5-2.6 9.4-.6 1.8-3 1.8-3.5 0L15.6 17h-3.2l-1.2 5.1c-.5 1.8-2.9 1.8-3.5 0-.9-2.9-1.8-6-2.6-9.4-.9-3.7-.3-6.8 2.1-8.1Z"
          stroke="#f6f1e8"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="m10.3 8.6 3.7 4.2 3.7-4.2"
          stroke="#efcfba"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    size,
  )
}
