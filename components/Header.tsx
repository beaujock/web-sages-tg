import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Top Contact Bar */}
      <div className="bg-charcoal-secondary text-gray-200 text-xs sm:text-sm py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          {/* Phone & Email Contacts */}
          <div className="flex items-center space-x-6">
            <a 
              href="tel:+18007243733" 
              className="flex items-center space-x-2 text-gray-300 hover:text-coral-accent transition-colors"
            >
              <svg className="w-4 h-4 text-coral-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+1 780 293 3890</span>
            </a>
            <a 
              href="mailto:info@sages.io" 
              className="flex items-center space-x-2 text-gray-300 hover:text-coral-accent transition-colors"
            >
              <svg className="w-4 h-4 text-coral-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>info.beaujock@gmail.com</span>
            </a>
          </div>

          {/* Top Right Togo Flag */}
          <div className="flex items-center gap-1" title="Togo">
            <svg 
              className="w-6 h-4 rounded-sm shadow-sm overflow-hidden" 
              viewBox="0 0 500 300" 
              aria-label="Drapeau du Togo"
            >
              <rect width="500" height="300" fill="#006A4E" />
              <rect y="60" width="500" height="60" fill="#FFCE00" />
              <rect y="180" width="500" height="60" fill="#FFCE00" />
              <rect width="180" height="180" fill="#D21034" />
              <polygon fill="#FFFFFF" points="90,45 101,78 135,78 108,98 118,131 90,111 62,131 72,98 45,78 79,78" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logos: Beaujock (Company) + SAGES (Solution) */}
        <Link href="/" className="flex items-center space-x-3.5 focus:outline-none">
          <Image
            src="/BEAUJOCK-LOGO_02.jpg"
            alt="Beaujock"
            width={60}
            height={25}
            className="h-auto w-auto object-contain"
            priority
          />
          
          <Image
            src="/SAGES_LOGO_02.jpg"
            alt="Platform SAGES"
            width={80}
            height={25}
            className="h-auto w-auto object-contain"
            priority
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-charcoal-secondary">
          <a href="./#modules" className="hover:text-teal-primary transition-colors">
            Modules
          </a>
          <a href="/contact" className="hover:text-teal-primary transition-colors">
            Contactez-nous
          </a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center space-x-4">
          <a
            href="./onboarding"
            className="bg-coral-accent hover:bg-red-500 text-white font-semibold text-sm px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-200"
          >
            Essayer SAGES
          </a>
        </div>
      </div>
    </header>
  );
}