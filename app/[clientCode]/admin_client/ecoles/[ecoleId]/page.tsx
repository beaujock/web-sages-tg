/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, School, Edit } from 'lucide-react';
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

const DetailRow = ({ label, value }: { label: string, value: string | Date | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 sm:w-1/3 font-medium">{label}</span>
      <span className="text-sm text-gray-900 sm:w-2/3">{String(value)}</span>
    </div>
  );
};

export default function EcoleDetailsPage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string }>;
}) {
  const { clientCode, ecoleId } = use(params);
  
  const [ecole, setEcole] = useState<AdminClientEcoleDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEcoleDetails = async () => {
      try {
        const token = sessionStorage.getItem('token');

        if (!token) {
          throw new Error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        }

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des détails de l\'école');
        }

        const jsonData = await res.json();
        setEcole(jsonData.ecole || jsonData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchEcoleDetails();
  }, [clientCode, ecoleId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <p className="text-gray-500">Chargement des détails...</p>
      </div>
    );
  }

  if (error || !ecole) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
        {error || "L'école n'a pas pu être trouvée."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link 
            href={`/${clientCode}/admin_client/ecoles`}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Retour à la liste"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <School className="w-6 h-6 text-teal-600" />
              {ecole.full_name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Détails complets de l&apos;établissement.
            </p>
          </div>
        </div>

        <Link
          href={`/${clientCode}/admin_client/ecoles/${ecole.id}/edit`}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
        >
          <Edit className="w-4 h-4 shrink-0" />
          <span className="font-medium">Mettre à jour</span>
        </Link>
      </div>

      {/* Details Card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: General Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Informations Générales</h3>
            <div className="space-y-1">
              <DetailRow label="Nom Complet" value={ecole.full_name} />
              <DetailRow label="Nom Court" value={ecole.short_name} />
              {/*<DetailRow label="Code" value={ecole.code} />*/}
              <DetailRow label="Date de création" value={ecole.establishment_date ? new Date(ecole.establishment_date).toLocaleDateString('fr-FR') : null} />
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contact & Coordonnées</h3>
            <div className="space-y-1">
              <DetailRow label="Contact Principal" value={ecole.primary_contact_name} />
              <DetailRow label="Contact Secondaire" value={ecole.secondary_contact_name} />
              <DetailRow label="Téléphone (Contact)" value={ecole.phone_number} />
              <DetailRow label="Email" value={ecole.email} />
              <DetailRow label="Site Internet" value={ecole.website} />
              <DetailRow label="Téléphone (Ecole)" value={ecole.contact_infos} />
            </div>
          </div>
        </div>

        {/* Full width section for Notes */}
        {ecole.notes && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {ecole.notes}
            </p>
          </div>
        )}
        
        {/* Metadata section */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
            <span>Créé par: {ecole.created_by} le {new Date(ecole.create_date).toLocaleDateString('fr-FR')}</span>
            {ecole.changed_by && ecole.change_date && (
                <span>Dernière modification par: {ecole.changed_by} le {new Date(ecole.change_date).toLocaleDateString('fr-FR')}</span>
            )}
        </div>
      </div>
    </div>
  );
}