/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, use, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

const { Loader2, ArrowLeft, Save, UploadCloud, Image : ImageIcon } = LucideIcons;

export default function AddElevePage({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = use(params);
  const router = useRouter();

  // Form state updated to reflect AdminClientCreateEleveDO (without matricule)
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    other_names: '',
    preferred_name: '',
    date_of_birth: '',
    gender: 'M',
    phone_number: '',
    email: '',
    notes: '',
  });

  // Photo state
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('L\'image ne doit pas dépasser 5 Mo.');
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
      const token = getCookie(cookieName);

      if (!token) {
        router.push(`/${clientCode}/login`);
        return;
      }

      // Use FormData to handle both the JSON payload structure and the File upload
      const submitData = new FormData();
      
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
            submitData.append(key, value);
        }
      });
      
      // The backend should derive "created_by" from the authenticated token, 
      // but if your API strictly requires it in the body, you can append it here:
      // submitData.append('created_by', 'current_user_id');

      // Append photo file
      if (photo) {
        submitData.append('photo', photo);
      }

      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/eleves/addeleve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData,
      });

      if (res.status === 401) {
        if (cookieName) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
        router.push(`/${clientCode}/login`);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Erreur lors de la création de l\'élève');
      }

      // Redirect back to students list on success
      router.push(`/${clientCode}/admin_client/eleves`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la création.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href={`/${clientCode}/admin_client/eleves`}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-charcoal-secondary">Ajouter un Élève</h2>
          <p className="text-sm text-gray-500 mt-1">Créez un nouveau dossier d&apos;élève.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">
          
          {/* Photo Upload Section */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden relative group">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <UploadCloud className="w-6 h-6 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs text-gray-500 text-center max-w-30">
                Cliquez pour ajouter une photo (Max 5Mo)
              </span>
            </div>

            {/* Core Identification */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                />
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Date de naissance <span className="text-red-500">*</span></label>
                <input
                  required
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Secondary Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Autres noms (Optionnel)</label>
              <input
                type="text"
                name="other_names"
                value={formData.other_names}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nom usuel (Optionnel)</label>
              <input
                type="text"
                name="preferred_name"
                value={formData.preferred_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Genre <span className="text-red-500">*</span></label>
              <select
                required
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary bg-white transition-colors"
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="O">Autre</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Téléphone (Optionnel)</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Email (Optionnel)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                placeholder="eleve@ecole.com"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Notes médicales ou générales (Optionnel)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors resize-y"
                placeholder="Allergies, remarques spécifiques..."
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
          <Link
            href={`/${clientCode}/admin_client/eleves`}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-medium text-white bg-teal-primary rounded-lg hover:bg-[#005f73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Enregistrer</span>
          </button>
        </div>
      </form>
    </div>
  );
}