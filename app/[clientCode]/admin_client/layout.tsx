import { RoleNavigation } from '@/components/RoleNavigation';

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
      <RoleNavigation roleCode="admin_client" clientCode={clientCode} />
      
      <div className="flex-1 flex flex-col w-full">
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