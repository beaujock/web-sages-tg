'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    requestId?: string
  }>({ type: null, message: '' });

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const formData = new FormData(event.currentTarget);
    const today = new Date(Date.now());

    const payload = {
        status : 'D',
        request_date : today,
        request_code : null,
        request_confirmed : false,
        requester_full_name : formData.get('requester_full_name'),
        requester_email  : formData.get('requester_email'),
        requester_phone   : formData.get('requester_phone'),
        client_full_name  : formData.get('ecole_name'),
        client_code : formData.get('ecole_code'),
        ecole_name: formData.get('ecole_name'),
        ecole_code: formData.get('ecole_code'),
        notes: formData.get('notes'),
        create_date : today,
        created_by  : "SAGES_ONBOARDING"

    };

    const endpoint = process.env.NEXT_PUBLIC_LOG_REQUEST_URL!;
    console.log("Endpoint = ",endpoint);
    console.log("payload = ",payload);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        //console.log("Response = ", response);
        const result = await response.json().catch(() => ({}));
        const reqId = result["requete"].id;
        setStatus({
          type: 'success',
          message: result.message || 'Votre demande a été enregistrée avec succès !',
          requestId: reqId,
        });
        (event.target as HTMLFormElement).reset();
        
        console.log("Requete ID = ", result["requete"].id);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatus({
          type: 'error',
          message: errorData.message || "Une erreur s'est produite lors de l'envoi.",
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
      <Header />

      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="relative bg-linear-to-b from-teal-primary to-[#005f73] text-white py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-1 gap-12 items-center">
            <div className="space-y-6 text-center">
              <span className="inline-block bg-white/10 text-coral-accent font-extrabold px-4 py-1.5 rounded-full text-lg border border-coral-accent/30">
                Système d&apos;Aides à la Gestion d&apos;Etablissements Scolaires (SAGES)
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                La Gestion Complète de Votre Etablissement Scolaire
              </h1>
              <p className="text-lg sm:text-xl text-gray-100 max-w-2xl mx-auto font-light">
                Le Système scolaire (du pré-scolaire en Terminale), les inscriptions, emploi du temps, éditions des bulletins, les évaluations, notifications (absences, devoirs, notes, ...), la comptabilité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a
                  href="#onboarding"
                  className="bg-coral-accent hover:bg-red-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-center text-lg"
                >
                  Utiliser SAGES
                </a>
                <a
                  href="#features"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-8 py-4 rounded-xl transition-all text-center text-lg"
                >
                  Explorer Nos Modules
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4 SELLING POINTS ================= */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal-secondary">
              Pourquoi utiliser SAGES ?
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              Conçu spécifiquement pour réduire les charges opérationnelles, automatiser les tâches administratives et rehausser la qualité de l&apos;enseignement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-teal-primary/10 rounded-xl flex items-center justify-center text-2xl mb-6 text-teal-primary">
                  📊
                </div>
                <span className="text-xs font-bold text-teal-primary tracking-wider uppercase">Module de base 1</span>
                <h3 className="text-2xl font-bold text-charcoal-secondary mt-1 mb-3">
                  Le système scolaire dans son intégralité
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Du pré-scolaire en terminale, consultez les types d&apos;enseignement, les niveaux, les séries, les classes, les matières avec le contenu des enseignements
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-teal-primary/10 rounded-xl flex items-center justify-center text-2xl mb-6 text-teal-primary">
                  📝
                </div>
                <span className="text-xs font-bold text-teal-primary tracking-wider uppercase">Module de base 2</span>
                <h3 className="text-2xl font-bold text-charcoal-secondary mt-1 mb-3">
                  Inscription des éleves
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Créez les classes de votre établissement, saisir les informations des élèves et les inscrire, édition de la liste d&apos;élèves par classe
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-teal-primary/10 rounded-xl flex items-center justify-center text-2xl mb-6 text-teal-primary">
                  💬
                </div>
                <span className="text-xs font-bold text-teal-primary tracking-wider uppercase">Module Notifications</span>
                <h3 className="text-2xl font-bold text-charcoal-secondary mt-1 mb-3">
                  Notifications de tout genre via SMS, WhatsApp, Email
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Les utilisateurs (administrateurs et personnel d&apos;établissements scolaire, parents, élèves) recevront des notifications, de devoirs de maison, notes, évènements à venir, bulletins disponibles, ...
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-teal-primary/10 rounded-xl flex items-center justify-center text-2xl mb-6 text-teal-primary">
                  💳
                </div>
                <span className="text-xs font-bold text-teal-primary tracking-wider uppercase">Module Évaluation</span>
                <h3 className="text-2xl font-bold text-charcoal-secondary mt-1 mb-3">
                  Planification des devoirs, examens, ...
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Planifiez et administrez les devoirs, examens régionaux et nationaux, éditions des bulletins, suivi académique de l&apos;élève.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= REQUEST ONBOARDING SECTION ================= */}
        <section id="onboarding" className="py-20 bg-charcoal-secondary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Prêt à une gestion plus moderne de votre Etablissement Scolaire ?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Commencez votre Intégration à SAGES en remplissant le formulaire ci-dessous. Nous allons vous guider tout au long du processus.
            </p>

            <form
              onSubmit={handleSubmit}
              className="max-w-xl mx-auto space-y-4 text-left bg-white/5 p-8 rounded-2xl border border-white/10"
            >
              {/* Submission Feedback Message & Confirmation Step */}
              {status.message && (
                <div
                  className={`p-6 rounded-xl text-center space-y-4 ${
                    status.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}
                >
                  <p className="font-semibold text-base">{status.message}</p>

                  {status.type === 'success' && (
                    <div className="pt-2 flex flex-col items-center gap-3 border-t border-emerald-500/30">
                      <p className="text-sm text-emerald-100 font-medium">
                        Cliquez le lien ci-dessous pour continuer avec l&apos;intégration à SAGES
                      </p>
                      <Link
                        href={status.requestId ? `onboarding/${status.requestId}/confirmrequest` : '#'}
                        className="inline-block bg-coral-accent hover:bg-red-500 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-all text-sm uppercase tracking-wider"
                      >
                        Continuer
                      </Link>
                    </div>
                  )}
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
                className="w-full bg-coral-accent hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-lg shadow-lg transition-colors text-lg mt-4 flex items-center justify-center"
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
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-800 text-center text-sm">
        <p>© {new Date().getFullYear()} SAGES de BeauJock. Tous droits réservés.</p>
      </footer>
    </div>
  );
}