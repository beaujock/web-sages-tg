/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, School, Calendar, Mail, Phone, Globe, User, Info } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

type UpdateEcoleDO = {
    id: string;
    full_name: string;
    short_name: string | null;
    establishment_date: Date | string | null; // Allow string for form input binding
    primary_contact_name: string | null;
    secondary_contact_name: string | null;
    contact_infos: string | null;
    phone_number: string | null;
    email: string | null;
    website: string | null;
    notes: string | null;
};

export default function UpdateEcolePage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string }>;
}) {
  const { clientCode, ecoleId } = use(params);
  const router = useRouter();
  
  const [formData, setFormData] = useState<UpdateEcoleDO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const ecole = data.ecole;
        
        // Format establishment_date for the input type="date"
        let formattedDate = '';
        if (ecole.establishment_date) {
            const d = new Date(ecole.establishment_date);
            formattedDate = d.toISOString().split('T')[0];
        }

        setFormData({
            id: ecole.id,
            full_name: ecole.full_name || '',
            short_name: ecole.short_name || '',
            establishment_date: formattedDate || null,
            primary_contact_name: ecole.primary_contact_name || '',
            secondary_contact_name: ecole.secondary_contact_name || '',
            contact_infos: ecole.contact_infos || '',
            phone_number: ecole.phone_number || '',
            email: ecole.email || '',
            website: ecole.website || '',
            notes: ecole.notes || '',
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchEcoleDetail();
  }, [clientCode, ecoleId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value === '' ? null : value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setSaving(true);
    setError('');

    try {
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
      const token = getCookie(cookieName);
      console.log("Establishment date", formData.establishment_date);
      
        console.log("formData ", formData);

      const payload = {
        ...formData,
        // Ensure date is properly structured or sent as null
        establishment_date: formData.establishment_date ? new Date(formData.establishment_date as string) : null,
      };

      console.log("Payload : ", payload);

      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'école');
      }

      router.push(`/${clientCode}/admin_client/ecoles/${ecoleId}/detail`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-teal-primary animate-spin mb-4" />
        <p className="text-gray-500">Chargement des détails...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href={`/${clientCode}/admin_client/ecoles/${ecoleId}/detail`}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Retour aux détails"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-charcoal-secondary flex items-center gap-2">
              <School className="w-6 h-6 text-teal-primary" />
              Modifier l&apos;école
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Mettez à jour les informations de cet établissement
            </p>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Enregistrer
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-8">
          
          <section>
            <h3 className="text-lg font-semibold text-charcoal-secondary border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-400" />
              Informations Générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none"
                />
              </div>
              <div>
                <label htmlFor="short_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom court
                </label>
                <input
                  type="text"
                  id="short_name"
                  name="short_name"
                  value={formData.short_name || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none"
                />
              </div>
              <div>
                <label htmlFor="establishment_date" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Date de création de l&apos;établissement
                </label>
                <input
                  type="date"
                  id="establishment_date"
                  name="establishment_date"
                  value={(formData.establishment_date as string) || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-charcoal-secondary border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-400" />
              Contacts & Coordonnées
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="primary_contact_name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Contact principal
                </label>
                <input
                  type="text"
                  id="primary_contact_name"
                  name="primary_contact_name"
                  value={formData.primary_contact_name || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none"
                />
              </div>
              <div>
                <label htmlFor="secondary_contact_name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Contact secondaire
                </label>
                <input
                  type="text"
                  id="secondary_contact_name"
                  name="secondary_contact_name"
                  value={formData.secondary_contact_name || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none"
                />
              </div>
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none"
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  Site internet
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="contact_infos" className="block text-sm font-medium text-gray-700 mb-1">
                  Informations de contact (Adresse, etc.)
                </label>
                <textarea
                  id="contact_infos"
                  name="contact_infos"
                  value={formData.contact_infos || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none resize-y"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-charcoal-secondary border-b border-gray-100 pb-2 mb-4">
              Notes
            </h3>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={4}
              placeholder="Ajouter des notes sur cette école..."
              className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none resize-y"
            />
          </section>

        </div>
      </div>
    </form>
  );
}