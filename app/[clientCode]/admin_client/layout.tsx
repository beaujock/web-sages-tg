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
    // Sidebar on the left, header on top of the content area
    <RoleNavigation roleCode="admin_client" clientCode={clientCode}>
      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {children}
        </div>
      </main>
    </RoleNavigation>
  );
}
