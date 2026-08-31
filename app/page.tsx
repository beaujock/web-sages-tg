import Link from 'next/link';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 w-full">
      <Header />

      <main className="flex-1 w-full">
        {/* ================= HERO SECTION ================= */}
        <section className="relative w-full bg-linear-to-b from-teal-primary to-[#005f73] text-white py-20 lg:py-32 px-4 sm:px-6 lg:px-8 2xl:px-16">
          <div className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 gap-12 items-center">
            <div className="space-y-6 text-center">
              <span className="inline-block bg-white/10 text-coral-accent font-extrabold px-4 py-1.5 rounded-full text-lg border border-coral-accent/30">
                Système d&apos;Aides à la Gestion d&apos;Etablissements Scolaires (SAGES)
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight max-w-5xl mx-auto">
                La Gestion Complète de Votre Etablissement Scolaire
              </h1>
              <p className="text-lg sm:text-2xl text-gray-100 max-w-4xl mx-auto font-light">
                Le Système scolaire (du pré-scolaire en Terminale), les inscriptions, emploi du temps, éditions des bulletins, les évaluations, notifications (absences, devoirs, notes, ...), la comptabilité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link
                  href="/onboarding"
                  className="bg-coral-accent hover:bg-red-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-center text-lg md:text-xl"
                >
                  Utiliser SAGES
                </Link>
                <a
                  href="#modules"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-8 py-4 rounded-xl transition-all text-center text-lg md:text-xl"
                >
                  Explorer Nos Modules
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4 SELLING POINTS ================= */}
        {/* Removed max-width from the section tag to allow full edge-to-edge rendering */}
        <section id="modules" className="w-full py-20 px-4 sm:px-6 lg:px-8 2xl:px-16">
          <div className="text-center max-w-5xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-charcoal-secondary">
              Pourquoi utiliser SAGES ?
            </h2>
            <p className="mt-6 text-gray-600 text-lg sm:text-xl">
              Conçu spécifiquement pour réduire les charges opérationnelles, automatiser les tâches administratives et rehausser la qualité de l&apos;enseignement
            </p>
          </div>

          {/* Expanded to 4 columns on xl screens to take advantage of monitor width */}
          <div className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10">
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

        {/* ================= REQUEST ONBOARDING CALL TO ACTION ================= */}
        <section className="w-full py-24 bg-charcoal-secondary text-white px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-5xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">
              Prêt à une gestion plus moderne de votre Etablissement Scolaire ?
            </h2>
            <p className="text-gray-300 text-lg sm:text-xl mb-10 max-w-3xl mx-auto">
              Commencez votre Intégration à SAGES en remplissant le formulaire d&apos;intégration. Nous allons vous guider tout au long du processus.
            </p>
            <Link
              href="/onboarding"
              className="inline-block bg-coral-accent hover:bg-red-500 text-white font-bold px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg md:text-xl"
            >
              Formulaire d&apos;intégration
            </Link>
          </div>
        </section>
      </main>

      <footer className="w-full bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-800 text-center text-sm">
        <p>© {new Date().getFullYear()} SAGES de BeauJock. Tous droits réservés.</p>
      </footer>
    </div>
  );
}