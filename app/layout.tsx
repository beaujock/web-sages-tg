import type { Metadata } from 'next';
import { Merriweather } from 'next/font/google';
import './globals.css';

// Load Merriweather font with desired font weights
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SAGES (Système d'Aide à la Gestion d''Etablissements Scolaires)",
  description: 'Gérez efficacement votre établissement scolaire avec SAGES, la solution complète pour la gestion administrative, académique et financière.',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${merriweather.variable} h-full scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-gray-50 text-charcoal-secondary antialiased selection:bg-coral-accent selection:text-white">
        
        {/* 
          We removed the max-w-7xl, mx-auto, and padding from this main tag. 
          Now, your page.tsx will stretch edge-to-edge as intended!
        */}
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>

        {/* Removed the layout footer since page.tsx handles its own footer */}
      </body>
    </html>
  );
}