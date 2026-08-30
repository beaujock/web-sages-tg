'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, UserPlus, Presentation, ChevronRight } from 'lucide-react';

export function DashboardTopBar({ clientCode, roleCode }: { clientCode: string, roleCode: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Define your quick actions here
  const quickActions = [
    {
      name: 'Inscrire un élève',
      href: `/${clientCode}/${roleCode}/register-student`,
      icon: UserPlus,
    },
    {
      name: 'Ajouter une classe',
      href: `/${clientCode}/${roleCode}/add-classroom`,
      icon: Presentation,
    }
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left side: Dashboard Title / Breadcrumb context */}
          <div className="flex items-center text-gray-800 font-semibold text-lg">
            <span>Actions Rapides</span>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-sm font-normal text-gray-500">Gestion</span>
          </div>

          {/* Right side: Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isActive = pathname === action.href;
              
              return (
                <Link
                  key={index}
                  href={action.href}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive 
                      ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" strokeWidth={2} />
                  {action.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-colors"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isActive = pathname === action.href;

              return (
                <Link
                  key={index}
                  href={action.href}
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                  className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-teal-100 text-teal-800'
                      : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" strokeWidth={1.5} />
                  {action.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}