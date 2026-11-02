export const metadata = {
  title: 'Cionpip System',
  description: 'Financial System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
