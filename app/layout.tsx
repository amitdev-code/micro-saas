import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const BASE_URL = 'https://webeze.in';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Webeze — Free Online Calculators & Smart Tools',
    template: '%s | Webeze',
  },
  description:
    'Free online calculators & tools for finance, health & developers. SIP calculator, EMI calculator, GST calculator, BMI calculator, word counter, JSON formatter — instant results, no sign-up.',
  keywords: [
    'sip calculator',
    'emi calculator',
    'gst calculator',
    'bmi calculator',
    'fd calculator',
    'discount calculator',
    'age calculator',
    'percentage calculator',
    'word counter',
    'json formatter',
    'free online tools',
    'financial calculator india',
    'online calculator',
  ],
  authors: [{ name: 'Webeze', url: BASE_URL }],
  creator: 'Webeze',
  publisher: 'Webeze',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    title: 'Webeze — Free Online Calculators & Smart Tools',
    description:
      'Free online calculators & tools for finance, health & developers. Instant results, no sign-up required.',
    siteName: 'Webeze',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webeze_in',
    title: 'Webeze — Free Online Calculators & Smart Tools',
    description:
      'Free online calculators & tools for finance, health & developers. Instant results, no sign-up required.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Webeze',
  url: BASE_URL,
  description:
    'Free online calculators & tools for finance, health & developers.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/tools/{search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Webeze',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    'Webeze provides free online calculators and tools for finance, health, and developers.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['English', 'Hindi'],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
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
