/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
// Added 'Plus' icon for the creation button
import { Loader2, School, Eye, Edit, Plus } from 'lucide-react';
import { API_BASE_URL } from '@/lib/auth';

type AdminClientEcoleDisplay = {
    id                      : string,
    full_name               : string,
    short_name              : string|null,
    establishment_date      : Date|null;
    code                    : string,
    primary_contact_name    : string|null,
    secondary_contact_name  : string|null,
    contact_infos           : string|null,
    phone_number            : string|null,
    email                   : string|null,
    website                 : string|null,
    notes                   : string|null,
    create_date             : Date,
    created_by              : string,
    change_date             : Date|null,
    changed_by              : string|null
};

export default function EcolesPage({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = use(params);
  
  const [ecoles, setEcoles] = useState<AdminClientEcoleDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEcoles = async () => {
      try {
        const token = sessionStorage.getItem('token');

        if (!token) {
          throw new Error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        }

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Erreur lors de la récupération de la liste des écoles');
        }

        const jsonData = await res.json();
        setEcoles(Array.isArray(jsonData) ? jsonData : jsonData.clientEcoles || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchEcoles();
  }, [clientCode]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <p className="text-gray-500">Chargement des écoles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Liste des Écoles</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos écoles.
          </p>
        </div>
        
        {/* Creation Button in Header */}
        <Link
          href={`/${clientCode}/admin_client/ecoles/new`}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 shrink-0" />
          <span className="font-medium">Nouvelle école</span>
        </Link>
      </div>

      {ecoles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <School className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Aucune école n&apos;est actuellement associée à ce client. Commencez par en ajouter une.
          </p>
          {/* Creation Button in Empty State */}
          <Link
            href={`/${clientCode}/admin_client/ecoles/new`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="font-medium">Créer une école</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {ecoles.map((ecole) => (
            <div 
              key={ecole.id} 
              className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50"
            >
              {/* Ecole Info */}
              <div className="flex items-center space-x-3 truncate pr-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                  <School className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-800 truncate">
                  {ecole.full_name || 'École sans nom'}
                </h3>
              </div>
              
              {/* Action Links */}
              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  href={`/${clientCode}/admin_client/ecoles/${ecole.id}`}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-teal-600 hover:border-teal-200 transition-colors"
                  title="Détails"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline text-sm font-medium">Détails</span>
                </Link>

                <Link
                  href={`/${clientCode}/admin_client/ecoles/${ecole.id}/edit`}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
                  title="Mettre à jour"
                >
                  <Edit className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline text-sm font-medium">Mettre à jour</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}