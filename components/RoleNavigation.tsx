'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RoleNavigationProps {
  roleTitle: string;
  clientCode: string;
}

export function RoleNavigation({ roleTitle, clientCode }: RoleNavigationProps) {
  const [resources, setResources] = useState<string[]>([]);

  useEffect(() => {
    // Menu items generated once upon route initialization
    const storedResources = sessionStorage.getItem('userResources');
    if (storedResources) {
      setResources(JSON.parse(storedResources));
    }
  }, []);

  return (
    <header className="w-full bg-teal-primary text-white shadow-md mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-bold tracking-tight">SAGES</span>
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded uppercase">
            {roleTitle}
          </span>
        </div>

        {/* Dynamic Route Navigation Menu */}
        <nav className="flex space-x-4 text-sm font-medium">
          {resources.map((res) => (
            <Link
              key={res}
              href={`/app/${clientCode}/${roleTitle.toLowerCase().replace(' ', '_')}/${res}`}
              className="hover:text-coral-accent transition-colors duration-200 capitalize"
            >
              {res.replace('_', ' ')}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}