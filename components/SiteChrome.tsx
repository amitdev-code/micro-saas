'use client';

import { usePathname } from 'next/navigation';
import { TOOL_PATHS_CHROMELESS } from '@/lib/toolsConfig';
import Footer from './Footer';
import Navbar from './Navbar';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const chromeless = TOOL_PATHS_CHROMELESS.includes(pathname);

  if (chromeless) {
    return <div className="flex-1 min-h-0 w-full min-h-screen flex flex-col">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="flex-1 min-h-0">{children}</div>
      <Footer />
    </>
  );
}
