/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, School } from 'lucide-react';
import { API_BASE_URL } from '@/lib/auth';

export default function EditEcolePage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string }>;
}) {
  const { clientCode, ecoleId } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    short_name: '',
    code: '',
    establishment_date: '',
    primary_contact_name: '',
    secondary_contact_name: '',
    contact_infos: '',
    phone_number: '',
    email: '',
    website: '',
    notes: '',
  });

  // Fetch initial data
  useEffect(() => {
    const fetchEcoleDetails = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error("Aucun jeton d'authentification trouvé.");

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Erreur lors de la récupération des détails de l\'école');

        const jsonData = await res.json();
        const ecole = jsonData.ecole || jsonData;

        // Format the date for the HTML date input (YYYY-MM-DD)
        const formattedDate = ecole.establishment_date 
          ? new Date(ecole.establishment_date).toISOString().split('T')[0]
          : '';

        setFormData({
          full_name: ecole.full_name || '',
          short_name: ecole.short_name || '',
          code: ecole.code || '',
          establishment_date: formattedDate,
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
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchEcoleDetails();
  }, [clientCode, ecoleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error("Aucun jeton d'authentification trouvé.");

      // Clean up empty strings to null for optional fields if your API requires it
      const payload = {
        ...formData,
        establishment_date: formData.establishment_date ? new Date(formData.establishment_date).toISOString() : null,
      };

      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/edit`, {
        method: 'PATCH', // or 'PUT' depending on your backend
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'école');
      }

      setSuccess('École mise à jour avec succès ! Redirection...');
      
      // Redirect back to the details page after a short delay
      setTimeout(() => {
        router.push(`/${clientCode}/admin_client/ecoles/${ecoleId}`);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <p className="text-gray-500">Chargement du formulaire...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="flex items-center space-x-4">
        <Link 
          href={`/${clientCode}/admin_client/ecoles/${ecoleId}`}
          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          title="Retour aux détails"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <School className="w-6 h-6 text-teal-600" />
            Mettre à jour l&apos;école
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Modifiez les informations de {formData.full_name || "l'établissement"}.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {success}
        </div>
      )}

      {/* Form Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Nom Complet (Required) */}
          <div className="space-y-2">
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Nom Complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Code (Required) */}
          <div className="space-y-2">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Code de l&apos;école <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="code"
              name="code"
              required
              value={formData.code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Nom Court */}
          <div className="space-y-2">
            <label htmlFor="short_name" className="block text-sm font-medium text-gray-700">
              Nom Court
            </label>
            <input
              type="text"
              id="short_name"
              name="short_name"
              value={formData.short_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Date de création */}
          <div className="space-y-2">
            <label htmlFor="establishment_date" className="block text-sm font-medium text-gray-700">
              Date de création
            </label>
            <input
              type="date"
              id="establishment_date"
              name="establishment_date"
              value={formData.establishment_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Contact Principal */}
          <div className="space-y-2">
            <label htmlFor="primary_contact_name" className="block text-sm font-medium text-gray-700">
              Contact Principal
            </label>
            <input
              type="text"
              id="primary_contact_name"
              name="primary_contact_name"
              value={formData.primary_contact_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Site Web */}
          <div className="space-y-2">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Site Web
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="https://"
            />
          </div>
        </div>

        {/* Notes (Full Width) */}
        <div className="mt-6 space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
          <Link
            href={`/${clientCode}/admin_client/ecoles/${ecoleId}`}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span className="font-medium">{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}