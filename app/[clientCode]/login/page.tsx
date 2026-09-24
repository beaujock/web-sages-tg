/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL, getCookie, setClientCookie } from '@/lib/auth';

export default function LoginPage() { // page.tsx
  const router = useRouter();
  const params = useParams();
  const clientCode = params?.clientCode as string;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New state to manage the initial token check
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const verifyExistingSession = async () => {
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
      const token = getCookie(cookieName);

      if (!token) {
        setIsCheckingToken(false);
        return;
      }

      try {
        // Attempt to validate the token against your backend
        // Adjust the endpoint ("/validate") to match your actual API structure
        const res = await fetch(`${API_BASE_URL}/${clientCode}/validateuser`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
        });

        if (res.ok) {
          const data = await res.json();
          
          // Route based on validation response, mimicking your login logic
          if (data.first_login) {
            router.push(`/${clientCode}/changepassword`);
            return;
          }

          if (data.roles && data.roles.length > 1) {
            router.push(`/${clientCode}/selectrole`);
          } else if (data.roles && data.roles.length === 1) {
            const roleRoute = data.roles[0].toLowerCase();
            router.push(`/${clientCode}/${roleRoute}`);
          } else {
            // Fallback if roles aren't provided by validation endpoint
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            router.push(`/${clientCode}`);
          }
        } else {
          // Token is invalid/expired; clear it and show the login form
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          setIsCheckingToken(false);
        }
      } catch (err) {
        console.error("Erreur de validation du token:", err);
        setIsCheckingToken(false);
      }
    };

    if (clientCode) {
      verifyExistingSession();
    } else {
      setIsCheckingToken(false);
    }
  }, [clientCode, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientCode: clientCode,
          userName: identifier,
          password: password,
        }),
      });
      
      if (!res.ok) {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string; 
        const token = getCookie(cookieName); 
        if (!token && cookieName)
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`; 
        throw new Error("Echec authentification.\nVérifiez vos informations d'identification.");
      }
      
      const data = await res.json();
      
      const connectionToken = data.connectionToken;
      if (!connectionToken) {
        const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string; 
        const token = getCookie(cookieName); 
        if (!token && cookieName)
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        throw new Error("Echec authentification.\nVérifiez vos informations d'identification.");
      }
      
      const firstLogin = data.first_login;
      const cookie_name = data.cookie_name;
      const userRoles = data.roles;
      const effective_date = data.effective_date;
      const expiry_date = data.expiry_date;

      // 1. Store the browser cookie (this is what proxy.ts will read)
      setClientCookie(cookie_name, connectionToken, expiry_date);

      // 2. Handle first-time login redirection
      if (firstLogin) {
        router.push(`/${clientCode}/changepassword`);
        return;
      }

      // 3. Route based on role count
      if (userRoles.length > 1) {
        router.push(`/${clientCode}/selectrole`);
      } else if (userRoles.length === 1) {
        const roleRoute = userRoles[0].toLowerCase();

        const responseAddUserSession = await fetch(`${API_BASE_URL}/addusersession`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: connectionToken,
            token_effective_time: new Date(effective_date),
            token_expiry_time: new Date(expiry_date),
          }),
        });

        if (!responseAddUserSession.ok) {
          const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string; 
          const token = getCookie(cookieName); 
          if (!token && cookieName)
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          throw new Error("Echec authentification. Réessayez ou contactez votre administrateur.");
        }
        router.push(`/${clientCode}/${roleRoute}`);
      } else {
        setError('Aucun rôle associé avec ce compte. Reconnectez-vous ou contactez votre administrateur.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render a loading state while checking for an existing token
  if (isCheckingToken) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 flex justify-center items-center min-h-[300px]">
        <div className="text-gray-600 text-sm font-medium">Vérification de la session...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Connexion (SAGES)</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Identifiant ou email
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
          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
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