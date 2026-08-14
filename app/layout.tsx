import type {Metadata} from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css'; // Global styles

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pigma | Sustainable Luxury Real Estate Thailand',
  description: 'Experience an unparalleled sustainable luxury lifestyle with Pigma. Premium eco-conscious villas and tropical oceanfront estates in Phuket and Koh Samui, Thailand.',
  openGraph: {
    title: 'Pigma | Sustainable Luxury Real Estate Thailand',
    description: 'Experience an unparalleled sustainable luxury lifestyle with Pigma. Premium eco-conscious villas and tropical oceanfront estates in Phuket and Koh Samui, Thailand.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pigma | Sustainable Luxury Real Estate Thailand',
    description: 'Experience an unparalleled sustainable luxury lifestyle with Pigma. Premium eco-conscious villas and tropical oceanfront estates in Phuket and Koh Samui, Thailand.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${plusJakarta.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
