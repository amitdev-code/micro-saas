import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Webeze — Free Online Calculators & Smart Tools',
    template: '%s | Webeze',
  },
  description:
    'Webeze offers free online tools for finance, utility, and text. SIP calculator, EMI calculator, GST calculator, BMI calculator, word counter, JSON formatter and more — instant, private, no signup.',
  keywords: [
    'webeze',
    'free online tools',
    'sip calculator',
    'emi calculator',
    'gst calculator',
    'bmi calculator',
    'word counter',
    'json formatter',
    'discount calculator',
    'age calculator',
    'percentage calculator',
  ],
  authors: [{ name: 'Webeze' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'Webeze — Free Online Calculators & Smart Tools',
    description: 'Free instant tools for finance, utility, and text. No signup. 100% private.',
    siteName: 'Webeze',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Webeze — Free Online Calculators & Smart Tools',
    description: 'Free instant tools for finance, utility, and text. No signup. 100% private.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-ZNVTDC7YQ6"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-ZNVTDC7YQ6');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
