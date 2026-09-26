import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HVAC Sales Portal',
  description: 'Sales rep portal for HVAC voice agent demos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
