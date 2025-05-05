import './globals.css';
import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from '@/components/layouts/main-layout';
import FCMNotifications from '@/components/ui/fcm-notifications'; // ✅ הוספה כאן

const rubik = Rubik({ 
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-rubik',
});

export const metadata: Metadata = {
  title: 'ניהול עסק',
  description: 'מערכת לניהול עסקים קטנים',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="icon" href="/icon-512.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#0b3d2e" />
      </head>
      <body className={`${rubik.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <MainLayout>
            {children}
          </MainLayout>
          <FCMNotifications /> {/* ✅ זה מה שצריך */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
