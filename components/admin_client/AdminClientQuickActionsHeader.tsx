import Link from 'next/link';
import { School, BookOpen, UserPlus, FileSignature } from 'lucide-react';

export function AdminClientQuickActionsHeader({ clientCode }: { clientCode: string }) {
  const actions = [
    {
      label: 'Créer une école',
      href: `/${clientCode}/admin_client/ecoles/create`,
      icon: School,
    },
    {
      label: 'Créer une classe',
      href: `/${clientCode}/admin_client/classes/create`, 
      icon: BookOpen,
    },
    {
      label: 'Nouvelle inscription',
      href: `/${clientCode}/admin_client/inscriptions/create`, 
      icon: FileSignature,
    },
    {
      label: 'Nouveau / Nouvelle élève',
      href: `/${clientCode}/admin_client/eleves/create`, 
      icon: UserPlus,
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {/* Changed to flex-wrap with a default left alignment (justify-start) */}
      <div className="flex flex-wrap items-center justify-start gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              href={action.href}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors"
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}