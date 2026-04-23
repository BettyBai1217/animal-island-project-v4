import type {Metadata} from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: '岛屿日记 - ACNH Web',
  description: 'A web app inspired by Animal Crossing: New Horizons',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${nunito.variable}`}>
      <body className="antialiased selection:bg-[#7ED957] selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
