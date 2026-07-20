import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Creator Attribution Dashboard',
  description: 'Track visitors, leads, and revenue back to specific content items.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 flex min-h-screen`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="p-8 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
