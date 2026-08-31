import { RoleNavigation } from '@/components/RoleNavigation';
import { DashboardTopBar } from '@/components/admin_client/DashboardTopBar'; // Import the top bar we created

export default async function AdminClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = await params;

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Sidebar remains on the left */}
      <RoleNavigation roleTitle="Accès Client" roleCode="admin_client" clientCode={clientCode} />
      
      {/* 
        Wrap the Top Bar and Content in a flex column 
        so the bar stays at the top of the remaining space 
      */}
      <div className="flex-1 flex flex-col w-full">
        {/* Horizontal Menu Bar */}
        {/*<DashboardTopBar clientCode={clientCode} roleCode="admin_client" />*/}
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}