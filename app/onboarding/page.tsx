'use client';

import { useState } from 'react';
import Link from 'next/link';
import HeaderWithoutSages from '@/components/HeaderWithoutSages';

export default function OnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    requestId?: string;
  }>({ type: null, message: '' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const formData = new FormData(event.currentTarget);
    const today = new Date(Date.now());

    const payload = {
      status: 'D',
      request_date: today,
      request_code: null,
      request_confirmed: false,
      requester_full_name: formData.get('requester_full_name'),
      requester_email: formData.get('requester_email'),
      requester_phone: formData.get('requester_phone'),
      client_full_name: formData.get('ecole_name'),
      client_code: formData.get('ecole_code'),
      ecole_name: formData.get('ecole_name'),
      ecole_code: formData.get('ecole_code'),
      notes: formData.get('notes'),
      create_date: today,
      created_by: 'SAGES_ONBOARDING',
    };

    const endpoint = process.env.NEXT_PUBLIC_LOG_REQUEST_URL as string;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        const reqId = result['requete']?.id;
        setStatus({
          type: 'success',
          message: result.message || 'Votre demande a été enregistrée avec succès !\nUn email de confirmation avec un code de validation vous a été envoyé. \nUtilisez ce code pour confirmer votre demande.',
          requestId: reqId,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatus({
          type: 'error',
          message: errorData.message,
        });
      }
    } catch (error) {
      console.error('External API Request Failed:', error);
      setStatus({
        type: 'error',
        message: 'Impossible de contacter le serveur. Veuillez vérifier votre connexion.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderWithoutSages />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-charcoal-secondary text-white p-8 sm:p-12 rounded-2xl shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Prêt à une gestion plus moderne de votre Etablissement Scolaire ?
            </h1>
            <p className="text-gray-300 text-lg">
              Commencez votre Intégration à SAGES en remplissant le formulaire ci-dessous. Nous allons vous guider tout au long du processus.
            </p>
          </div>

          {status.type === 'success' ? (
            <div className="p-6 rounded-xl text-center space-y-6 bg-emerald-500/20 text-emerald-200 border border-emerald-500/40">
              <p className="font-semibold text-base whitespace-pre-line">{status.message}</p>

              <div className="pt-4 flex flex-col items-center gap-3 border-t border-emerald-500/30">
                <p className="text-sm text-emerald-100 font-medium">
                  Cliquez le lien ci-dessous pour continuer avec l&apos;intégration à SAGES
                </p>
                <Link
                  href={status.requestId ? `/onboarding/${status.requestId}/confirmrequest` : '#'}
                  className="inline-block bg-coral-accent hover:bg-red-500 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-all text-sm uppercase tracking-wider"
                >
                  Continuer
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {status.type === 'error' && (
                <div className="p-4 rounded-xl text-center bg-red-500/20 text-red-300 border border-red-500/40">
                  <p className="font-semibold text-base">{status.message}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Etablissement scolaire (Nom Complet) *
                </label>
                <input
                  type="text"
                  name="ecole_name"
                  placeholder="Collège d'Enseignement Général Attikpa Kagounou"
                  className="w-full px-4 py-3 rounded-lg bg-white text-charcoal-secondary focus:outline-none focus:ring-2 focus:ring-coral-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Etablissement scolaire (Petit nom) *
                </label>
                <input
                  type="text"
                  name="ecole_code"
                  placeholder="CEG Attikpa"
                  className="w-full px-4 py-3 rounded-lg bg-white text-charcoal-secondary focus:outline-none focus:ring-2 focus:ring-coral-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Votre nom et prénom *
                </label>
                <input
                  type="text"
                  name="requester_full_name"
                  placeholder="Koffi Abalo"
                  className="w-full px-4 py-3 rounded-lg bg-white text-charcoal-secondary focus:outline-none focus:ring-2 focus:ring-coral-accent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-200">
                    Votre Email *
                  </label>
                  <input
                    type="email"
                    name="requester_email"
                    placeholder="koffi@ecole.edu"
                    className="w-full px-4 py-3 rounded-lg bg-white text-charcoal-secondary focus:outline-none focus:ring-2 focus:ring-coral-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-200">
                    Votre Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="requester_phone"
                    placeholder="+228 90 00 00 00"
                    className="w-full px-4 py-3 rounded-lg bg-white text-charcoal-secondary focus:outline-none focus:ring-2 focus:ring-coral-accent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Votre fonction (Dans l&apos;établissement scolaire)
                </label>
                <select
                  name="notes"
                  defaultValue=""
                  className="w-full px-4 py-3 rounded-lg bg-white text-charcoal-secondary focus:outline-none focus:ring-2 focus:ring-coral-accent"
                >
                  <option value="" disabled>
                    Choisir une option
                  </option>
                  <option value="Directeur">Directeur</option>
                  <option value="Fondateur">Fondateur</option>
                  <option value="Surveillant">Surveillant</option>
                  <option value="Secrétaire">Secrétaire</option>
                  <option value="Autre personnel">Autre personnel</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-coral-accent hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-lg shadow-lg transition-colors text-lg mt-4 flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Envoi en cours...
                  </span>
                ) : (
                  'Soumettre votre demande'
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-800 text-center text-sm">
        <p>© {new Date().getFullYear()} SAGES de BeauJock. Tous droits réservés.</p>
      </footer>
    </div>
  );
}