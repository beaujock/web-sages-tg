import { EcoleHeader } from '@/components/EcoleHeader';

export default async function EcoleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientCode: string; ecoleId: string }>;
}) {
  const { clientCode, ecoleId } = await params;

  return (
    <>
      <EcoleHeader clientCode={clientCode} ecoleId={ecoleId} />
      {children}
    </>
  );
}
