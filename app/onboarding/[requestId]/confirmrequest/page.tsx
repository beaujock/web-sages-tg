'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import HeaderWithoutSages from '@/components/HeaderWithoutSages';

interface PageProps {
  params: Promise<{
    requestId: string;
  }>;
}

export default function ConfirmRequestPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.requestId;

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const baseUrl = process.env.NEXT_PUBLIC_ONBOARDING_URL as string;
    const endpoint = `${baseUrl}${requestId}/confirmrequest`;
    const payload = { requestCode: code };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        setStatus({
          type: 'success',
          message:
            result.message ||
            "Votre code de vérification a été validé avec succès ! Votre demande a été transmise à l'équipe d'intégration. Vous recevrez bientôt un e-mail avec les prochaines étapes",
        });
        setCode('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatus({
          type: 'error',
          message: errorData.message || 'Code incorrect ou expiré. Veuillez réessayer.',
        });
      }
    } catch (error) {
      console.error('Verification Request Failed:', error);
      setStatus({
        type: 'error',
        message: 'Impossible de contacter le serveur. Veuillez vérifier votre connexion.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-charcoal-secondary">
      <HeaderWithoutSages />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-gray-200 shadow-lg space-y-6">
          {status.type === 'success' ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto text-emerald-600">
                ✓
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-charcoal-secondary">
                  Demande confirmée.
                </h1>
                <p className="text-sm text-emerald-800 bg-emerald-50 p-4 rounded-xl border border-emerald-200 font-medium leading-relaxed">
                  {status.message}
                </p>
              </div>

              <Link
                href="/"
                className="inline-block w-full bg-coral-accent hover:bg-red-500 text-white font-bold py-3.5 rounded-lg shadow-md transition-colors text-base text-center"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-teal-primary/10 rounded-full flex items-center justify-center text-3xl mx-auto text-teal-primary">
                  ✉️
                </div>
                <h1 className="text-2xl font-bold text-charcoal-secondary">
                  Vérification de votre demande
                </h1>
                <p className="text-sm text-gray-600">
                  Veuillez saisir le code de vérification envoyé à votre adresse e-mail.
                </p>
              </div>

              {status.type === 'error' && (
                <div className="p-4 rounded-xl text-center text-sm font-semibold bg-red-500/10 text-red-700 border border-red-500/30">
                  {status.message}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Code de vérification *
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: 123456"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-coral-accent text-center text-lg font-mono tracking-widest"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !code.trim()}
                  className="w-full bg-coral-accent hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-lg shadow-md transition-colors text-base flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Vérification...
                    </span>
                  ) : (
                    'Vérifier le code'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}