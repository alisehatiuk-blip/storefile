import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'دیجی‌اسکریپت | فروشگاه اسکریپت‌های حرفه‌ای',
    template: '%s | دیجی‌اسکریپت',
  },
  description: 'فروشگاه تخصصی اسکریپت‌های حرفه‌ای، ابزارهای SaaS و راهکارهای کسب‌وکار',
  keywords: ['اسکریپت', 'SaaS', 'اتوماسیون', 'کسب‌وکار', 'برنامه‌نویسی', 'فروشگاه دیجیتال'],
  authors: [{ name: 'دیجی‌اسکریپت' }],
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: 'دیجی‌اسکریپت',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
