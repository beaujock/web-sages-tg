'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL, decodeToken, setClientCookie } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const clientCode = params?.clientCode as string;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientCode,
          usernameOrEmail: identifier,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error("Echec authentification. Vérifier vos information d'identification.");
      }

      const data = await res.json();
      const { cookieName, token } = data;
      const decoded = decodeToken(token);

      // Save initial connection context in sessionStorage
      sessionStorage.setItem('tempToken', token);
      sessionStorage.setItem('cookieName', cookieName);

      // Store browser cookie
      setClientCookie(cookieName, token, decoded.expiryDate);

      // Route based on role count
      if (decoded.userRoles.length > 1) {
        router.push(`/app/${clientCode}/selectrole`);
      } else if (decoded.userRoles.length === 1) {
        const roleRoute = getRoleRoute(decoded.userRoles[0]);
        router.push(`/app/${clientCode}/${roleRoute}`);
      } else {
        setError('Aucun role associé ave ce compte');
      }
    } catch (err: any) {
      setError(err.message || "Une erreur d'authentification s'est produite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Login</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Login ou email
          </label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-coral-accent focus:border-coral-accent text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-coral-accent focus:border-coral-accent text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-teal-primary text-white font-medium rounded-md hover:bg-teal-700 transition duration-150 disabled:opacity-50"
        >
          {loading ? 'Authentification..' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

export function getRoleRoute(role: string): string {
  switch (role) {
    case 'client_admin':
      return 'admin_client';
    case 'school_admin':
      return 'admin_ecole';
    default:
      return 'dashboard';
  }
}