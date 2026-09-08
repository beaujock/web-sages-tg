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
import { API_BASE_URL } from '@/lib/auth';

type SagesMenuItem = {
  display_name: string;
  icon_name: string | null;
  end_route: string;
  active: boolean;
};

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

export function RoleNavigation({ roleCode, clientCode }: { roleCode: string, clientCode: string }) {
  const [menuItems, setMenuItems] = useState<SagesMenuItem[]>([]);
  const [userFullName, setUserFullName] = useState<string>(''); 
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchConnectionInfos = async () => {
      try {
        // Retrieve userId from session storage
        const userId = sessionStorage.getItem('user_id');
        const storedName = sessionStorage.getItem('user_full_name') || '<Utilisateur>';
        setUserFullName(storedName);

        if (!userId) {
          console.warn("No userId found in session storage.");
          setLoading(false);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/${clientCode}/${roleCode}/${userId}/connectioninfos`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch connection infos');
        }

        const data = await response.json();
        console.log("Connection infos data", data);
        
        // Adjust these property accesses depending on your exact API response structure
        if (data.userRoleInfos.menu_items) {
            setMenuItems(data.userInfos.menu_items.filter((item: SagesMenuItem) => item.active));
        }

        // Optional: Update full name if the API returns it
        if (data.userRoleInfos.full_name) {
            setUserFullName(data.userInfos.full_name);
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
            <UserCheck className="w-4 h-4 text-teal-primary" />
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
          <LayoutDashboard className="w-5 h-5 shrink-0" strokeWidth={isDashboardActive ? 2 : 1.5} />
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
          <Settings className="w-5 h-5 shrink-0" strokeWidth={isSettingsActive ? 2 : 1.5} />
          <span className="hidden md:block font-medium text-sm truncate">Paramétrages</span>
        </Link>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center md:justify-start md:space-x-3 w-full px-2 md:px-4 py-2.5 rounded-md text-gray-300 hover:bg-[#FF6B6B] hover:text-white transition-all duration-200"
          title="Se déconnecter"
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          <span className="hidden md:block font-medium text-sm truncate">Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}