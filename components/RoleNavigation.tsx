/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

type SagesMenuItem = {
  display_name: string;
  icon_name: string | null;
  end_route: string;
  active: boolean;
};

export function RoleNavigation({ roleCode, clientCode }: { roleCode: string, clientCode: string }) {
  const [menuItems, setMenuItems] = useState<SagesMenuItem[]>([]);
  const [userFullName, setUserFullName] = useState<string>(''); 
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchConnectionInfos = async () => {
      try {
        //const connectionToken = sessionStorage.getItem('token');
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const connectionToken = getCookie(cookieName);

        if (!connectionToken) {
          console.warn("No token found in session storage.");
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/${clientCode}/${roleCode}/menu`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${connectionToken}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch connection infos');
        }

        const data = await response.json();
        console.log("Connection infos data", data);
        
        if (data.menuItems) {
          console.log("MenuItems : ", data.menuItems);
            setMenuItems(data.menuItems.filter((item: SagesMenuItem) => item.active));
        }

        if (data.userFullName) {
            setUserFullName(data.userFullName);
        }

      } catch (error) {
        console.error("Failed to load connection infos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectionInfos();
  }, [clientCode, roleCode]);

  const handleLogout = () => {
    const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
    if (cookieName) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    router.push(`/${clientCode}/login`);
  };

  if (loading) {
    return (
      <aside className="w-16 md:w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col p-4 md:p-6 transition-all duration-300">
        <div className="animate-pulse text-charcoal-secondary hidden md:block">Chargement...</div>
      </aside>
    );
  }

  const settingsHref = `/${clientCode}/settings`;
  const isSettingsActive = pathname === settingsHref;

  const dashboardHref = `/${clientCode}/${roleCode}`;
  const isDashboardActive = pathname === dashboardHref || pathname === '/';

  return (
    <aside className="w-16 md:w-64 min-h-screen bg-charcoal-secondary text-white flex flex-col shadow-lg shrink-0 transition-all duration-300">
      
      <nav className="flex-1 p-2 md:p-4 space-y-2 overflow-y-auto">
        
        <div className="hidden md:flex flex-col px-2 md:px-4 py-2 mb-2 border-b border-gray-700/50 pb-4">
          <div className="flex items-center space-x-2">
            <LucideIcons.UserCheck className="w-4 h-4 text-teal-primary" />
            <span className="font-semibold text-sm truncate text-white">{userFullName}</span>
          </div>
        </div>

        {/* Dashboard Link */}
        <Link 
          href={dashboardHref}
          className={`flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-3 rounded-md transition-all duration-200 ${
            isDashboardActive 
              ? 'bg-teal-primary text-white' 
              : 'text-gray-300 hover:bg-teal-primary hover:bg-opacity-20 hover:text-white'
          }`}
          title="Tableau de bord"
        >
          <LucideIcons.LayoutDashboard className="w-5 h-5 shrink-0" strokeWidth={isDashboardActive ? 2 : 1.5} />
          <span className="hidden md:block font-medium text-sm truncate">Tableau de bord</span>
        </Link>

        {menuItems.length > 0 ? menuItems.map((item, index) => {
          // Dynamically resolves the exact component name (e.g., "NotebookPen") from the Lucide module
          const IconComponent = (item.icon_name && LucideIcons[item.icon_name as keyof typeof LucideIcons] as React.ElementType) 
            || LucideIcons.LayoutTemplate;
          
          const href = `/${clientCode}/${roleCode}${item.end_route}`;
          const isActive = pathname === href;

          return (
            <Link 
              key={index} 
              href={href}
              className={`flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-3 rounded-md transition-all duration-200 ${
                isActive 
                  ? 'bg-teal-primary text-white' 
                  : 'text-gray-300 hover:bg-teal-primary hover:bg-opacity-20 hover:text-white'
              }`}
              title={item.display_name} 
            >
              <IconComponent className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
              <span className="hidden md:block font-medium text-sm truncate">{item.display_name}</span>
            </Link>
          );
        }) : (
          <span className="text-coral-accent text-sm px-2 md:px-4 hidden md:block">Aucun menu disponible.</span>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-2 md:p-4 border-t border-gray-700 flex flex-col space-y-2">
        <Link 
          href={settingsHref}
          className={`flex items-center justify-center md:justify-start md:space-x-3 w-full px-2 md:px-4 py-2.5 rounded-md transition-all duration-200 ${
            isSettingsActive
              ? 'bg-teal-primary text-white' 
              : 'text-gray-300 hover:bg-teal-primary hover:bg-opacity-20 hover:text-white'
          }`}
          title="Paramétrages"
        >
          <LucideIcons.Settings className="w-5 h-5 shrink-0" strokeWidth={isSettingsActive ? 2 : 1.5} />
          <span className="hidden md:block font-medium text-sm truncate">Paramétrages</span>
        </Link>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center md:justify-start md:space-x-3 w-full px-2 md:px-4 py-2.5 rounded-md text-gray-300 hover:bg-coral-accent hover:text-white transition-all duration-200"
          title="Se déconnecter"
        >
          <LucideIcons.LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          <span className="hidden md:block font-medium text-sm truncate">Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}