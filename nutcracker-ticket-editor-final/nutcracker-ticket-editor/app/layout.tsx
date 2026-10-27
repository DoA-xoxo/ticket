
import type { Metadata } from 'next';
import {
  Noto_Serif_KR,
  Noto_Sans_KR,
  Nanum_Myeongjo,
  Nanum_Gothic,
  Nanum_Pen_Script,
  Nanum_Brush_Script,
} from 'next/font/google';
import './globals.css';

const notoSerif = Noto_Serif_KR({
  subsets: ['latin'],
  variable: '--font-noto-serif',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
});

const nanumMyeongjo = Nanum_Myeongjo({
  subsets: ['latin'],
  variable: '--font-nanum-myeongjo',
  weight: ['400', '700', '800'],
  display: 'swap',
});

const nanumGothic = Nanum_Gothic({
  subsets: ['latin'],
  variable: '--font-nanum-gothic',
  weight: ['400', '700', '800'],
  display: 'swap',
});

const nanumPen = Nanum_Pen_Script({
  subsets: ['latin'],
  variable: '--font-nanum-pen',
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hodo Ticket Studio',
  description: '티켓을 직접 디자인하고 PNG로 저장하세요.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body
        className={[
          notoSerif.variable,
          notoSans.variable,
          nanumMyeongjo.variable,
          nanumGothic.variable,
          nanumPen.variable,
        ].join(' ')}
      >
        {children}
      </body>
    </html>
  );
}
