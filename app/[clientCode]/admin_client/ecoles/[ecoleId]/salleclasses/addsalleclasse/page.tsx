/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Save, BookOpen } from 'lucide-react';
import { API_BASE_URL } from '@/lib/auth';

export type AdminClientCreateSalleClasseDO = {
    ecole_id                 : string;
    classe_id                : string;
    code                     : string;
    description              : string|null;
    notes                    : string|null
};

type BaseClass = {
  id: string;
  short_name: string;
};

export default function CreateClassroomPage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string }>;
}) {
  const { clientCode, ecoleId } = use(params);
  const router = useRouter();

  const [formData, setFormData] = useState({
    code: '',
    classe_id: '',
    description: '',
    notes: ''
  });
  
  const [baseClasses, setBaseClasses] = useState<BaseClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const jsonData = await res.json();
        
        if (!res.ok) {
          throw new Error(jsonData.message || 'Erreur lors du chargement des classes');
        }

        setBaseClasses(Array.isArray(jsonData) ? jsonData : jsonData.classes || []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [clientCode, ecoleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');

      if (!token) {
        throw new Error("Errur de connexion. Veuillez vous reconnecter.");
      }

      const payload: AdminClientCreateSalleClasseDO = {
        ecole_id: ecoleId,
        classe_id: formData.classe_id,
        code: formData.code,
        description: formData.description || null,
        notes: formData.notes || null
      };

      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses/addsalleclasse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      console.log("Result : ", res);

      const jsonData = await res.json();

      if (!res.ok) {
        setError(jsonData.message);
        setIsSubmitting(false);
        //throw new Error(jsonData.message || '');
        //setError(jsonData.message);
      }

      if (res.ok) router.push(`/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses`);
      
    } catch (err: any) {
      console.error(err);
      setError("Erreur Système. Réessayer. Si l'erreur insiste, contactez votre administrateur");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-charcoal-secondary mb-1">
            <BookOpen className="w-6 h-6 text-teal-primary" />
            <h2 className="text-2xl font-bold">Créer une nouvelle classe</h2>
          </div>
          <p className="text-sm text-gray-500">
            Remplissez les informations ci-dessous pour ajouter une classe à l&apos;école
          </p>
        </div>
        
        <Link
          href={`/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses`}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-charcoal-secondary transition-colors shadow-sm shrink-0"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="font-medium">Retour</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Code de la classe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="code"
              name="code"
              required
              value={formData.code}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-primary focus:border-teal-primary outline-none transition-colors"
              placeholder="ex: 6emeA"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="classe_id" className="block text-sm font-medium text-gray-700">
              Niveau / Classe de base <span className="text-red-500">*</span>
            </label>
            <select
              id="classe_id"
              name="classe_id"
              required
              value={formData.classe_id}
              onChange={handleChange}
              disabled={loadingClasses}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-primary focus:border-teal-primary outline-none transition-colors disabled:bg-gray-100"
            >
              <option value="" disabled>
                {loadingClasses ? 'Chargement des classes...' : 'Sélectionnez une classe de base'}
              </option>
              {baseClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.short_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-primary focus:border-teal-primary outline-none transition-colors"
              placeholder="Description optionnelle de la classe..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-primary focus:border-teal-primary outline-none transition-colors"
              placeholder="Notes internes..."
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
          <Link
            href={`/${clientCode}/admin_client/ecoles/${ecoleId}/salleclasses`}
            className="px-4 py-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center space-x-2 px-6 py-2 bg-teal-primary text-white rounded-lg hover:bg-[#005f73] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span className="font-medium">
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer la classe'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}