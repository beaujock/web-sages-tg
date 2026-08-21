import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
const roleCode = "admin_client"; // Hardcoded role code for admin_client

interface MenuItem {
  id: string | number;
  label: string;
  icon?: string;
  path: string;
}

interface UserProfile {
  name: string;
  role: 'admin_client' | 'admin_ecole' | 'enseignant' | 'eleve' | 'parent' | string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ clientCode: string}>;
}

async function fetchRoleMenu(roleCode: string): Promise<MenuItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SAGES_BASE_URL;
  if (!baseUrl) return [];

  /*
  try {
    const res = await fetch(`${baseUrl}/api/menu?role=${role}&clientCode=${clientCode}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 }, // Cache menu for 5 minutes
    });
    */
   try {
    const response = await fetch(`${baseUrl}menu/${roleCode}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const menuitems:MenuItem[]=[];
        for (const item of result.menuItems) {
          menuitems.push({
            id: item.id,
            label: item.name,
            icon: item.icon,
            path: roleCode + item.end_route,
          });
        }
        return menuitems;
    }
    else  return [];

  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

export default async function ClientDashboardLayout({ children, params }: DashboardLayoutProps) {
  const { clientCode } = await params;
  const cookieStore = await cookies();
  const cookieName = process.env.COOKIE_NAME || 'sages_session';
  const authCookie = cookieStore.get(cookieName)?.value;

  // 1. Redirect to login if no authentication cookie exists
  if (!authCookie) {
    redirect(`/${clientCode}/login`);
  }

  let user: UserProfile | null = null;
  let token = authCookie;

  try {
    const parsed = JSON.parse(authCookie);
    user = parsed.user || parsed;
    token = parsed.token || authCookie;
  } catch {
    user = { name: 'Utilisateur SAGES', role: 'guest' };
  }

  // 2. Fetch role-specific menu from external API
  const menuItems = await fetchRoleMenu(roleCode);

  return (
    <div className="min-h-screen flex bg-gray-50 text-charcoal-secondary font-sans">
      {/* Left Vertical Sidebar Menu */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 shadow-sm">
        <div className="p-6 flex flex-col h-full overflow-hidden">
          {/* Client Branding */}
          <div className="pb-4 border-b border-gray-100">
            <span className="text-xs font-bold tracking-wider text-teal-primary uppercase block">
              {clientCode}
            </span>
            <span className="text-lg font-bold text-gray-800 tracking-tight">SAGES Portal</span>
          </div>

          {/* Logged-In User Badge */}
          <div className="my-4 p-3 bg-gray-50 rounded-lg border border-gray-100 flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Connecté en tant que:</span>
            <span className="text-sm font-bold text-gray-800 truncate mt-0.5">
              {user?.name || 'Utilisateur'}
            </span>
            <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-coral-accent bg-coral-accent/10 px-2 py-0.5 rounded w-fit">
              {user?.role ? user.role.replace('_', ' ') : 'N/A'}
            </span>
          </div>

          {/* Dynamic Navigation Links */}
          <nav className="flex-1 mt-2 space-y-1 overflow-y-auto pr-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={`/${clientCode}${item.path}`}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-teal-primary hover:bg-teal-primary/5 rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom Logout Action */}
          <div className="pt-4 border-t border-gray-100">
            <a
              href={`/api/auth/logout?clientCode=${clientCode}`}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-coral-accent hover:bg-red-500 rounded-full shadow-sm transition-colors duration-200"
            >
              Déconnexion
            </a>
          </div>
        </div>
      </aside>

      {/* Main Responsive Body Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}