'use client';

import { useState } from 'react';
import Header from '@/components/Header';

import { sendOnboardingEmail } from '../actions/sendOnboardingEmail';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const formData = new FormData(event.currentTarget);
    const result = await sendOnboardingEmail(formData);

    setIsSubmitting(false);

    if (result.success) {
      setStatus({ type: 'success', message: result.message });
      (event.target as HTMLFormElement).reset();
    } else {
      setStatus({ type: 'error', message: result.message });
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
            {/* Selling Point 1 */}
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

            {/* Selling Point 2 */}
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

            {/* Selling Point 3 */}
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

            {/* Selling Point 4 */}
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
              {/* Submission Feedback Message */}
              {status.message && (
                <div
                  className={`p-4 rounded-lg text-sm font-semibold text-center ${
                    status.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}
                >
                  {status.message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Etablissement scolaire (Nom Complet) *
                </label>
                <input
                  type="text"
                  name="schoolFullName"
                  placeholder="Collège d'Enseignement Général Attikpa Kagounou"
                  className="w-full px-4 py-3 rounded-lg bg-white text-charcoal-secondary focus:outline-none focus:ring-2 focus:ring-coral-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Etablissement scolaire (Petit nom)
                </label>
                <input
                  type="text"
                  name="schoolShortName"
                  placeholder="CEG Attikpa"
                  className="w-full px-4 py-3 rounded-lg bg-white text-charcoal-secondary focus:outline-none focus:ring-2 focus:ring-coral-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">
                  Votre nom et prénom *
                </label>
                <input
                  type="text"
                  name="contactName"
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
                    name="email"
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
                    name="phone"
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
                  name="role"
                  defaultValue=""
                  className="w-full px-4 py-3 rounded-lg bg-white text-charcoal-secondary focus:outline-none focus:ring-2 focus:ring-coral-accent"
                >
                  <option value="" disabled>Choisir une option</option>
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
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-800 text-center text-sm">
        <p>© {new Date().getFullYear()} SAGES de BeauJock. Tous droits réservés.</p>
      </footer>
    </div>
  );
}