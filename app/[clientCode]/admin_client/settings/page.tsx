/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Settings, Calendar, Users, School, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

type ClientSettingsDO = {
    client_id                   : string;
    annee_scolaire_id           : string;
    annee_scolaire_label        : string;
    max_schools                 : number;
    max_admin_client_users      : number;
    max_admin_ecole_users       : number;
    max_admin_classroom_users   : number;
    max_teacher_users           : number;
    max_parent_users            : number;
    max_eleve_users             : number;
};

type AnneeScolaireDO = {
    id: string;
    label: string;
};

// Read-only limits displayed to the client admin
const LIMITS: { key: keyof ClientSettingsDO; label: string }[] = [
  { key: 'max_schools', label: 'Écoles' },
  { key: 'max_admin_client_users', label: 'Administrateurs client' },
  { key: 'max_admin_ecole_users', label: 'Administrateurs école' },
  { key: 'max_admin_classroom_users', label: 'Administrateurs de classe' },
  { key: 'max_teacher_users', label: 'Enseignants (Utilisateurs)' },
  { key: 'max_parent_users', label: 'Parents (Utilisateurs)' },
  { key: 'max_eleve_users', label: 'Élèves (Utilisateurs)' },
];

export default function ClientSettingsPage({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = use(params);
  const router = useRouter();

  const [settings, setSettings] = useState<ClientSettingsDO | null>(null);
  const [anneesScolaires, setAnneesScolaires] = useState<AnneeScolaireDO[]>([]);
  const [selectedAnneeId, setSelectedAnneeId] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
        const token = getCookie(cookieName);

        if (!token) {
          router.push('/login');
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };

        const [settingsRes, anneesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/${clientCode}/admin_client/settings`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/${clientCode}/lookups/anneescolaires`, { method: 'GET', headers }),
        ]);

        if (settingsRes.status === 401 || settingsRes.status === 400) {
          router.push('/login');
          return;
        }

        if (!settingsRes.ok) throw new Error('Erreur lors de la récupération des paramètres');

        const settingsData = await settingsRes.json();
        const clientSettings: ClientSettingsDO = settingsData.settings ?? settingsData;
        setSettings(clientSettings);
        setSelectedAnneeId(clientSettings.annee_scolaire_id);

        if (anneesRes.ok) {
          const anneesData = await anneesRes.json();
          setAnneesScolaires(Array.isArray(anneesData) ? anneesData : anneesData.anneescolaires || []);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [clientCode, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || selectedAnneeId === settings.annee_scolaire_id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
      const token = getCookie(cookieName);

      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/settings/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ annee_scolaire_id: selectedAnneeId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'année scolaire');
      }

      const selectedAnnee = anneesScolaires.find((a) => a.id === selectedAnneeId);
      setSettings({
        ...settings,
        annee_scolaire_id: selectedAnneeId,
        annee_scolaire_label: selectedAnnee?.label ?? settings.annee_scolaire_label,
      });
      setSuccess('Année scolaire mise à jour avec succès');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-teal-primary animate-spin mb-4" />
        <p className="text-gray-500">Chargement des paramètres...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
        {error || 'Paramètres introuvables'}
      </div>
    );
  }

  const isUnchanged = selectedAnneeId === settings.annee_scolaire_id;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-secondary flex items-center gap-2">
            <Settings className="w-6 h-6 text-teal-primary" />
            Paramètres
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Consultez les paramètres de votre compte et choisissez l&apos;année scolaire en cours
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || isUnchanged}
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

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-8">

          <section>
            <h3 className="text-lg font-semibold text-charcoal-secondary border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              Année scolaire
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="annee_scolaire_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Année scolaire en cours
                </label>
                <select
                  id="annee_scolaire_id"
                  name="annee_scolaire_id"
                  value={selectedAnneeId}
                  onChange={(e) => {
                    setSelectedAnneeId(e.target.value);
                    setSuccess('');
                  }}
                  className="w-full p-3 bg-white rounded-lg text-gray-800 border border-gray-300 focus:border-teal-primary focus:ring-1 focus:ring-teal-primary transition-colors outline-none"
                >
                  {/* Keep the current year selectable even if the lookup did not return it */}
                  {!anneesScolaires.some((a) => a.id === settings.annee_scolaire_id) && (
                    <option value={settings.annee_scolaire_id}>{settings.annee_scolaire_label}</option>
                  )}
                  {anneesScolaires.map((annee) => (
                    <option key={annee.id} value={annee.id}>
                      {annee.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-charcoal-secondary border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              Limites du compte
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LIMITS.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg"
                >
                  <span className="text-sm text-gray-600 flex items-center gap-1.5">
                    {key === 'max_schools' && <School className="w-4 h-4" />}
                    {label}
                  </span>
                  <span className="text-lg font-semibold text-charcoal-secondary">
                    {settings[key]}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Ces limites sont définies par votre abonnement et ne peuvent pas être modifiées.
            </p>
          </section>

        </div>
      </div>
    </form>
  );
}
