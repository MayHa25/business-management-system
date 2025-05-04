import './globals.css';
import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from '@/components/layouts/main-layout';

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
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}