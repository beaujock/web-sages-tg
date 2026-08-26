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
    <div className="w-full">
      <RoleNavigation roleTitle="Client Admin" clientCode={clientCode} />
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        {children}
      </div>
    </div>
  );
}