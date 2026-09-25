/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, School, Calendar, Mail, Phone, Globe, User, Clock, Info } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

type DisplayEcoleDO = {
    id: string;
    full_name: string;
    short_name: string | null;
    establishment_date: Date | null;
    code: string;
    primary_contact_name: string | null;
    secondary_contact_name: string | null;
    contact_infos: string | null;
    phone_number: string | null;
    email: string | null;
    website: string | null;
    notes: string | null;
    create_date: Date;
    created_by: string;
    change_date: Date | null;
    changed_by: string | null;
};

export default function EcoleDetailPage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string }>;
}) {
  const { clientCode, ecoleId } = use(params);
  const router = useRouter();
  
  const [ecole, setEcole] = useState<DisplayEcoleDO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEcoleDetail = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);

        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch using the specific detail endpoint provided
        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/detail`, { 
          method: 'GET', 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          } 
        });

        if (res.status === 401 || res.status === 400) {
          if (!token && cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
          router.push('/login');
          return;
        }

        if (!res.ok) throw new Error('Erreur lors de la récupération des détails de l\'école');
        
        const data = await res.json();
        setEcole(data.ecole);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchEcoleDetail();
  }, [clientCode, ecoleId, router]);

  const formatDate = (dateValue: Date | string | null) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateValue: Date | string | null) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-teal-primary animate-spin mb-4" />
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
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
            <h2 className="text-2xl font-bold text-charcoal-secondary flex items-center gap-2">
              <School className="w-6 h-6 text-teal-primary" />
              {ecole.short_name || ecole.full_name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Détails et informations de l&apos;établissement
            </p>
          </div>
        </div>
        
        <Link
          href={`/${clientCode}/admin_client/ecoles/${ecoleId}/update`}
          className="inline-flex items-center justify-center px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm font-medium"
        >
          Modifier l&apos;école
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-8">
          
          {/* General Information */}
          <section>
            <h3 className="text-lg font-semibold text-charcoal-secondary border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-400" />
              Informations Générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nom complet</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100">
                  {ecole.full_name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nom court</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 min-h-11.5">
                  {ecole.short_name || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Code</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 font-mono">
                  {ecole.code}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Date de création de l&apos;établissement
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 min-h-11.5">
                  {formatDate(ecole.establishment_date) || '-'}
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h3 className="text-lg font-semibold text-charcoal-secondary border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-400" />
              Contacts & Coordonnées
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Contact principal
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 min-h-11.5">
                  {ecole.primary_contact_name || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Contact secondaire
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 min-h-11.5">
                  {ecole.secondary_contact_name || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 min-h-11.5">
                  {ecole.phone_number || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 min-h-11.5">
                  {ecole.email || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  Site internet
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-teal-600 border border-gray-100 min-h-11.5">
                  {ecole.website ? (
                    <a href={ecole.website.startsWith('http') ? ecole.website : `https://${ecole.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {ecole.website}
                    </a>
                  ) : '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Informations de contact (Adresse, etc.)</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 min-h-11.5 whitespace-pre-wrap">
                  {ecole.contact_infos || '-'}
                </div>
              </div>
            </div>
          </section>

          {/* Additional Notes */}
          <section>
            <h3 className="text-lg font-semibold text-charcoal-secondary border-b border-gray-100 pb-2 mb-4">
              Notes
            </h3>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 min-h-20 whitespace-pre-wrap">
              {ecole.notes || 'Aucune note associée à cette école.'}
            </div>
          </section>

          {/* System Metadata - Explicitly Disabled Inputs as requested */}
          <section>
            <h3 className="text-lg font-semibold text-charcoal-secondary border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Métadonnées Système
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Créé le</label>
                <input 
                  type="text" 
                  disabled 
                  value={formatDateTime(ecole.create_date)}
                  className="w-full p-2 bg-gray-100 text-gray-500 border border-gray-200 rounded-md cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Créé par</label>
                <input 
                  type="text" 
                  disabled 
                  value={ecole.created_by || ''}
                  className="w-full p-2 bg-gray-100 text-gray-500 border border-gray-200 rounded-md cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Modifié le</label>
                <input 
                  type="text" 
                  disabled 
                  value={formatDateTime(ecole.change_date)}
                  className="w-full p-2 bg-gray-100 text-gray-500 border border-gray-200 rounded-md cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Modifié par</label>
                <input 
                  type="text" 
                  disabled 
                  value={ecole.changed_by || ''}
                  className="w-full p-2 bg-gray-100 text-gray-500 border border-gray-200 rounded-md cursor-not-allowed"
                />
              </div>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}