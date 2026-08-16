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
  title: "SAGES (Système d''Aide à la Gestion d''Etablissements Scolaires)",
  description: 'Built with Next.js, Tailwind CSS v4, and Merriweather typography.',
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
        {/* Navigation Header */}
        {/* 
        <header className="w-full bg-teal-primary text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <span className="text-xl font-bold tracking-tight">SAGES</span>
            <nav className="flex space-x-4 text-sm font-medium">
              <a href="#" className="hover:text-coral-accent transition-colors duration-200">
                Home
              </a>
              <a href="#" className="hover:text-coral-accent transition-colors duration-200">
                About
              </a>
            </nav>
          </div>
        </header>
        */}

        {/* Main Responsive Content Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-gray-200 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} BEAUJOCK Tous droits réservés.
          </div>
        </footer>
      </body>
    </html>
  );
}