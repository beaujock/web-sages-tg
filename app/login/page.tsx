'use client';

import { useState, use } from 'react';
import HeaderWithoutSages from '@/components/HeaderWithoutSages';

interface PageProps {
  params: Promise<{
    clientCode: string;
  }>;
}

export default function ClientLoginPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const clientCode = resolvedParams.clientCode;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const endpoint = `${process.env.NEXT_PUBLIC_AUTH_URL || '/api/auth'}/login`;
    const payload = {
      clientCode,
      username,
      password,
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          alert('Connexion réussie !');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Identifiants invalides. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('Impossible de se connecter au serveur. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-charcoal-secondary">
      <HeaderWithoutSages />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-gray-200 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-block bg-teal-primary/10 text-teal-primary font-bold text-xs uppercase px-3 py-1 rounded-full">
              Établissement : {clientCode}
            </span>
            <h1 className="text-2xl font-bold text-charcoal-secondary">
              Connexion à SAGES
            </h1>
            <p className="text-sm text-gray-600">
              Saisissez les identifiants envoyés à votre adresse email.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl text-center text-sm font-semibold bg-red-500/10 text-red-700 border border-red-500/30">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nom d&apos;utilisateur ou Email *
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin@ecole.edu"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-coral-accent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-coral-accent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !username || !password}
              className="w-full bg-coral-accent hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-lg shadow-md transition-colors text-base flex items-center justify-center mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}