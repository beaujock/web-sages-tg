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

          <div className="hidden md:block text-xs text-gray-400 font-light">
            Une Meilleure Gestion de Votre Etablissement Scolaire
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* SAGES Logo */}
        <Link href="/" className="flex items-center focus:outline-none">
          <Image
            src="/SAGES_LOGO_02.jpg"
            alt="Platform SAGES"
            width={180}
            height={50}
            className="h-18 w-auto object-contain"
            priority
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-charcoal-secondary">
          <a href="./#features" className="hover:text-teal-primary transition-colors">
            Modules
          </a>
         {/*
          <a href="#solutions" className="hover:text-teal-primary transition-colors">
            Solutions
          </a>
          
          <a href="#testimonials" className="hover:text-teal-primary transition-colors">
            Témoignages
          </a>
          
          <a href="#about" className="hover:text-teal-primary transition-colors">
            Qui sommes-nous ?
          </a>
           */}
          <a href="/contact" className="hover:text-teal-primary transition-colors">
            Contactez-nous
          </a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center space-x-4">
          <a
            href="./#onboarding"
            className="bg-coral-accent hover:bg-red-500 text-white font-semibold text-sm px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-200"
          >
            Utiliser SAGES
          </a>
        </div>
      </div>
    </header>
  );
}