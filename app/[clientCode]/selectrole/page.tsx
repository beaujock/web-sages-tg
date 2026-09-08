import { RoleSelector } from '@/components/RoleSelector';

export default async function SelectRolePage({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = await params;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <RoleSelector clientCode={clientCode} />
    </div>
  );
}