import './globals.css';
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cionpip-financial-system-website.vercel.app'),
  title: 'Cionpip | النظام المالي',
  description: 'Cionpip — Forex & Crypto Trading',
  icons: { icon: '/favicon-512.png', apple: '/apple-touch-icon.png' },
  openGraph: { title: 'Cionpip - Forex & Crypto Trading', description: 'نظام Cionpip المالي', images: ['/og-image.png'] },
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
};
export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
