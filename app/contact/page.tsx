'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { sendContactEmail } from '@/actions/sendContactEmail';

export default function Contact() {
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
    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await sendContactEmail(payload);

      if (response.success) {
        setStatus({ type: 'success', message: response.message });
        (event.target as HTMLFormElement).reset();
      } else {
        setStatus({ type: 'error', message: response.message });
      }
    } catch (error) {
      console.error('Submission Error:', error);
      setStatus({
        type: 'error',
        message: 'Une erreur inattendue est survenue.',
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
        <section className="relative bg-linear-to-b from-teal-primary to-[#005f73] text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <span className="inline-block bg-white/10 text-coral-accent font-extrabold px-4 py-1.5 rounded-full text-sm border border-coral-accent/30 uppercase tracking-wider">
              Contactez-nous
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold">Besoin d&apos;informations ?</h1>
            <p className="text-lg text-gray-100 max-w-2xl mx-auto font-light">
              Notre équipe est à votre disposition pour répondre à toutes vos questions concernant l&apos;intégration et l&apos;utilisation de SAGES.
            </p>
          </div>
        </section>

        {/* ================= CONTACT INFO & FORM SECTION ================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Direct Contact Details */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-charcoal-secondary">Nos Coordonnées</h2>
              <p className="text-gray-600">
                N&apos;hésitez pas à nous joindre directement via nos canaux officiels.
              </p>

              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-primary/10 rounded-xl flex items-center justify-center text-xl text-teal-primary shrink-0">
                    📍
                  </div>
                  <div>
                    <h3 className="font-bold text-charcoal-secondary text-lg">Adresse</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Siège Social SAGES, Boulevard du 13 Janvier, Lomé, Togo
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-primary/10 rounded-xl flex items-center justify-center text-xl text-teal-primary shrink-0">
                    📞
                  </div>
                  <div>
                    <h3 className="font-bold text-charcoal-secondary text-lg">Téléphone</h3>
                    <p className="text-gray-600 text-sm mt-1">+228 90 00 00 00 / +228 22 00 00 00</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-primary/10 rounded-xl flex items-center justify-center text-xl text-teal-primary shrink-0">
                    ✉️
                  </div>
                  <div>
                    <h3 className="font-bold text-charcoal-secondary text-lg">Email</h3>
                    <p className="text-gray-600 text-sm mt-1">info.sages.beaujock@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-charcoal-secondary mb-2">Envoyez-nous un message</h2>
              <p className="text-gray-600 mb-8">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {status.message && (
                  <div
                    className={`p-4 rounded-xl text-center text-sm font-semibold ${
                      status.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-700 border border-red-500/30'
                    }`}
                  >
                    {status.message}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-charcoal-secondary">
                      Nom et Prénom *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Koffi Abalo"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-slate-50 text-charcoal-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-charcoal-secondary">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="koffi@ecole.edu"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-slate-50 text-charcoal-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral-accent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-charcoal-secondary">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+228 90 00 00 00"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-slate-50 text-charcoal-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-charcoal-secondary">
                      Sujet
                    </label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Demande d'informations"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-slate-50 text-charcoal-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-charcoal-secondary">
                    Votre Message *
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Écrivez votre message ici..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-slate-50 text-charcoal-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral-accent resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-coral-accent hover:bg-red-500 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-lg shadow-lg transition-colors text-base flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer le message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-800 text-center text-sm">
        <p>© {new Date().getFullYear()} SAGES de BeauJock. Tous droits réservés.</p>
      </footer>
    </div>
  );
}