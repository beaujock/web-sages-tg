'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LayoutTemplate, LogOut, Settings, UserCheck } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';
import { LucideIconByName } from '@/components/LucideIconByName';

type SagesMenuItem = {
  display_name: string;
  icon_name: string | null; // kebab-case Lucide name, e.g. "door-open", "notebook-pen"
  end_route: string;
  active: boolean;
};

type DisplayClientDO = {
  id: string;
  systeme_scolaire_id: string;
  systeme_scolaire_label: string;
  active: boolean;
  active_label: string;
  status: string;
  status_label: string;
  legal_name: string;
  short_name: string | null;
  code: string;
  address: string | null;
  website: string | null;
  main_contact_name: string | null;
  main_contact_email: string | null;
  main_contact_phone: string | null;
  other_contact_infos: string | null;
  notes: string | null;
  create_date: Date;
  created_by: string;
  change_date: Date | null;
  changed_by: string | null;
};

type InfoRoleDO = {
  id: string;
  name: string;
  code: string;
};

const ICON_CLASS = 'w-5 h-5 shrink-0';

function NavLink({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-3 rounded-md transition-all duration-200 ${
        active
          ? 'bg-teal-primary text-white'
          : 'text-gray-300 hover:bg-teal-primary hover:bg-opacity-20 hover:text-white'
      }`}
      title={label}
    >
      {icon}
      <span className="hidden md:block font-medium text-sm truncate">{label}</span>
    </Link>
  );
}

export function RoleNavigation({
  roleCode,
  clientCode,
  children,
}: {
  roleCode: string;
  clientCode: string;
  children: ReactNode;
}) {
  const [menuItems, setMenuItems] = useState<SagesMenuItem[]>([]);
  const [userFullName, setUserFullName] = useState<string>('');
  const [client, setClient] = useState<DisplayClientDO | null>(null);
  const [role, setRole] = useState<InfoRoleDO | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchConnectionInfos = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const connectionToken = getCookie(cookieName);

        if (!connectionToken) {
          console.warn("No token found in cookies.");
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

        if (Array.isArray(data.menuItems)) {
          setMenuItems(data.menuItems.filter((item: SagesMenuItem) => item.active));
        }

        if (data.userFullName) {
          setUserFullName(data.userFullName);
        }

        if (data.client) {
          setClient(data.client);
        }

        if (data.role) {
          setRole(data.role);
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

  const settingsHref = `/${clientCode}/settings`;
  const isSettingsActive = pathname === settingsHref;

  const dashboardHref = `/${clientCode}/${roleCode}`;
  const isDashboardActive = pathname === dashboardHref || pathname === '/';

  const sidebar = loading ? (
    <aside className="w-16 md:w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col p-4 md:p-6 transition-all duration-300">
      <div className="animate-pulse text-charcoal-secondary hidden md:block">Chargement...</div>
    </aside>
  ) : (
    <aside className="w-16 md:w-64 min-h-screen bg-charcoal-secondary text-white flex flex-col shadow-lg shrink-0 transition-all duration-300">

      <nav className="flex-1 p-2 md:p-4 space-y-2 overflow-y-auto">

        <NavLink
          href={dashboardHref}
          label="Tableau de bord"
          active={isDashboardActive}
          icon={<LayoutDashboard className={ICON_CLASS} strokeWidth={isDashboardActive ? 2 : 1.5} />}
        />

        {menuItems.length > 0 ? menuItems.map((item) => {
          const href = `/${clientCode}/${roleCode}${item.end_route}`;
          const isActive = pathname === href;

          return (
            <NavLink
              key={item.end_route}
              href={href}
              label={item.display_name}
              active={isActive}
              icon={<LucideIconByName name={item.icon_name} fallback={LayoutTemplate} className={ICON_CLASS} strokeWidth={isActive ? 2 : 1.5} />}
            />
          );
        }) : (
          <span className="text-coral-accent text-sm px-2 md:px-4 hidden md:block">Aucun menu disponible.</span>
        )}
      </nav>
    </aside>
  );

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {sidebar}

      <div className="flex-1 flex flex-col w-full min-w-0">
        <header className="flex items-center justify-between gap-4 bg-white border-b border-gray-200 px-4 md:px-6 py-3 shadow-sm">
          <div className="flex flex-col items-start space-y-1 min-w-0">
            <h1 className="text-base md:text-lg font-bold uppercase tracking-wide text-teal-primary truncate max-w-full" title={client?.legal_name}>
              {client?.legal_name}
            </h1>
            <Link
              href={settingsHref}
              className={`flex items-center space-x-1.5 text-xs font-medium transition-colors duration-200 ${
                isSettingsActive ? 'text-teal-primary' : 'text-gray-500 hover:text-teal-primary'
              }`}
              title="Paramétrages"
            >
              <Settings className="w-4 h-4 shrink-0" strokeWidth={isSettingsActive ? 2 : 1.5} />
              <span>Paramétrages</span>
            </Link>
          </div>

          <div className="flex flex-col items-end text-right space-y-0.5 min-w-0 shrink-0">
            {userFullName && (
              <div className="flex items-center space-x-2 min-w-0">
                <UserCheck className="w-4 h-4 text-teal-primary shrink-0" />
                <span className="font-semibold text-sm text-charcoal-secondary truncate">{userFullName}</span>
              </div>
            )}
            {role?.name && (
              <span className="text-xs text-gray-500 truncate max-w-full">{role.name}</span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 pt-1 text-xs font-medium text-gray-500 hover:text-coral-accent transition-colors duration-200"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>Se déconnecter</span>
            </button>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
