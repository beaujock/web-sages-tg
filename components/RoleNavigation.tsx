/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Activity, Bell, Search,
  GraduationCap, Users, BookUser, UserCheck, Contact,
  School, Library, BookOpen, Backpack,
  CalendarDays, Clock, ClipboardList, DoorOpen,
  FileText, FileCheck2, Award, BarChart3,
  Receipt, Coins, Calculator,
  Settings, ShieldCheck, Database, HelpCircle,
  LayoutTemplate, LogOut
} from 'lucide-react';

type SagesMenuItem = {
  display_name: string;
  icon_name: string | null;
  end_route: string;
  active: boolean;
};

// Connect DB strings to React components
const iconMap: Record<string, React.ElementType> = {
  'layout-dashboard': LayoutDashboard,
  'users': Users,
  'graduation-cap': GraduationCap,
  'school': School,
  'calendar-days': CalendarDays,
  'file-text': FileText,
  'receipt': Receipt,
  'settings': Settings,
  'shield-check': ShieldCheck,
  'book-open': BookOpen,
  'door-open': DoorOpen,
  'activity': Activity,
  'bell': Bell,
};

export function RoleNavigation({ roleTitle, roleCode, clientCode }: { roleTitle: string, roleCode: string, clientCode: string }) {
  const [menuItems, setMenuItems] = useState<SagesMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedMenus = sessionStorage.getItem('menuItems');
    if (storedMenus) {
      try {
        const parsed = JSON.parse(storedMenus) as SagesMenuItem[];
        setMenuItems(parsed.filter(item => item.active));
      } catch (error) {
        console.error("Failed to parse menu items", error);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    const cookieName = sessionStorage.getItem('cookie_name');
    sessionStorage.clear();
    if (cookieName) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    router.push(`/${clientCode}/login`);
  };

  if (loading) {
    return (
      <aside className="w-16 md:w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col p-4 md:p-6 transition-all duration-300">
        <div className="animate-pulse text-[#2D3748] hidden md:block">Chargement...</div>
      </aside>
    );
  }

  const settingsHref = `/${clientCode}/settings`;
  const isSettingsActive = pathname === settingsHref;

  // The base dashboard route for the current role
  const dashboardHref = `/${clientCode}/${roleCode}`;
  const isDashboardActive = pathname === dashboardHref || pathname === '/';

  return (
    <aside className="w-16 md:w-64 min-h-screen bg-[#2D3748] text-white flex flex-col shadow-lg flex-shrink-0 transition-all duration-300">
      
      {/* Sidebar Header */}
      <div className="p-4 md:p-6 border-b border-gray-700 bg-[#1a202c] flex items-center justify-center md:justify-start h-16 md:h-auto">
        <h1 className="hidden md:block text-xl font-bold tracking-wide truncate">{roleTitle}</h1>
        <LayoutDashboard className="w-6 h-6 md:hidden text-white" />
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 p-2 md:p-4 space-y-2 overflow-y-auto">
        
        {/* Dashboard Link - Now acts as the default active link for the role root */}
        <Link 
          href={dashboardHref}
          className={`flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-3 rounded-md transition-all duration-200 ${
            isDashboardActive 
              ? 'bg-[#007791] text-white' 
              : 'text-gray-300 hover:bg-[#007791] hover:bg-opacity-20 hover:text-white'
          }`}
          title="Tableau de bord"
        >
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" strokeWidth={isDashboardActive ? 2 : 1.5} />
          <span className="hidden md:block font-medium text-sm truncate">Tableau de bord</span>
        </Link>

        {menuItems.length > 0 ? menuItems.map((item, index) => {
          const IconComponent = (item.icon_name && iconMap[item.icon_name.toLowerCase()]) 
            ? iconMap[item.icon_name.toLowerCase()] 
            : LayoutTemplate;
          
          const href = `/${clientCode}/${roleCode}${item.end_route}`;
          const isActive = pathname === href;

          return (
            <Link 
              key={index} 
              href={href}
              className={`flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-3 rounded-md transition-all duration-200 ${
                isActive 
                  ? 'bg-[#007791] text-white' 
                  : 'text-gray-300 hover:bg-[#007791] hover:bg-opacity-20 hover:text-white'
              }`}
              title={item.display_name} 
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2 : 1.5} />
              <span className="hidden md:block font-medium text-sm truncate">{item.display_name}</span>
            </Link>
          );
        }) : (
          <span className="text-[#FF6B6B] text-sm px-2 md:px-4 hidden md:block">Aucun menu disponible.</span>
        )}
      </nav>

      {/* Sidebar Footer with Settings and Logout */}
      <div className="p-2 md:p-4 border-t border-gray-700 flex flex-col space-y-2">
        <Link 
          href={settingsHref}
          className={`flex items-center justify-center md:justify-start md:space-x-3 w-full px-2 md:px-4 py-2.5 rounded-md transition-all duration-200 ${
            isSettingsActive
              ? 'bg-[#007791] text-white' 
              : 'text-gray-300 hover:bg-[#007791] hover:bg-opacity-20 hover:text-white'
          }`}
          title="Paramétrages"
        >
          <Settings className="w-5 h-5 flex-shrink-0" strokeWidth={isSettingsActive ? 2 : 1.5} />
          <span className="hidden md:block font-medium text-sm truncate">Paramétrages</span>
        </Link>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center md:justify-start md:space-x-3 w-full px-2 md:px-4 py-2.5 rounded-md text-gray-300 hover:bg-[#FF6B6B] hover:text-white transition-all duration-200"
          title="Se déconnecter"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
          <span className="hidden md:block font-medium text-sm truncate">Se déconnecter</span>
        </button>

        <div className="hidden md:block text-xs text-gray-500 text-center mt-2">SAGES</div>
      </div>
    </aside>
  );
}