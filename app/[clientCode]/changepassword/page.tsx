/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

export default function ChangePasswordPage({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const router = useRouter();
  const { clientCode } = use(params);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      // Retrieve temporary token given at initial login
      let token = sessionStorage.getItem('tempToken') || null;
      const cookieName = sessionStorage.getItem('cookie_name');
      
      if (!token && cookieName) {
        token = getCookie(cookieName) || null;
      }

      if (!token) {
        router.push(`/${clientCode}/login`);
        return;
      }
      console.log("token : ", token);
      const res = await fetch(`${API_BASE_URL}/changepassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: password }),
      });
      console.log("Change password response status:", res);

      if (!res.ok) {
        throw new Error('Erreur lors de la modification du mot de passe.');
      }

      // Clear temp tokens and push back to login
      sessionStorage.removeItem('tempToken');
      router.push(`/${clientCode}/login`);
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-6">
          <Lock className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Première connexion</h2>
          <p className="text-sm text-gray-500 mt-2">
            Veuillez personnaliser votre mot de passe pour sécuriser votre compte.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="••••••••"
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="••••••••"
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Enregistrer et continuer'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}