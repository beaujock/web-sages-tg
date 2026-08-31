/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL, decodeToken, setClientCookie } from '@/lib/auth';

// Helper function to retrieve a cookie by its name
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const clientCode = params?.clientCode as string;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- NEW: Check for existing cookie/token on page load ---
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const cookieName = sessionStorage.getItem('cookie_name');
        let token = sessionStorage.getItem('tempToken') || sessionStorage.getItem('token');

        // Fallback to reading the cookie if not found in sessionStorage
        if (!token && cookieName) {
          token = getCookie(cookieName) || null;
        }

        if (token && clientCode) {
          const decoded = await decodeToken(token);
          
          if (decoded?.user?.roles) {
            // Redirect based on role count just like in handleLogin
            if (decoded.user.roles.length > 1) {
              router.push(`/${clientCode}/selectrole`);
            } else if (decoded.user.roles.length === 1) {
              const roleRoute = decoded.user.roles[0].toLocaleLowerCase();
              router.push(`/${clientCode}/${roleRoute}`);
            }
          }
        }
      } catch (err) {
        console.log("No valid existing session found or token expired", err);
        // Clean up invalid session data
        sessionStorage.removeItem('tempToken');
        sessionStorage.removeItem('token');
      }
    };

    checkExistingSession();
  }, [clientCode, router]);
  // ---------------------------------------------------------

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientCode : clientCode,
          userName: identifier,
          password : password,
        }),
      });
      
      if (!res.ok) {
        throw new Error("Echec authentification.\nVérifier vos information d'identification.");
      }
      
      console.log("Response : ", res);
      const data = await res.json();
      console.log("Data : ", data);
      
      const connectionToken = data.connectionToken;
      const cookie_name = data.cookie_name;
      const effective_date = data.effective_date;
      const expiry_date = data.expiry_date; 
      const menuItems = data.menu_items;
      //console.log("connection token : ", connectionToken);
      const decoded = await decodeToken(connectionToken);
      console.log("Decoded token : ", decoded);

      // Save initial connection context in sessionStorage
      sessionStorage.setItem('tempToken', connectionToken);
      sessionStorage.setItem('cookie_name', cookie_name);

      // Save menu items in sessionStorage
      sessionStorage.setItem('menuItems', JSON.stringify(menuItems));
      console.log("Menu items saved in sessionStorage: ", menuItems);

      // Store browser cookie
      setClientCookie(cookie_name, connectionToken, expiry_date);

      // Route based on role count
      if (decoded.user.roles.length > 1) {
        router.push(`/${clientCode}/selectrole`);
      } else if (decoded.user.roles.length === 1) {
        const roleRoute = decoded.user.roles[0].toLocaleLowerCase();

          const responseAddUserSession = await fetch(`${API_BASE_URL}/addusersession`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: connectionToken,
              token_effective_time: effective_date,
              token_expiry_time: expiry_date,
            }),
          });
          if (!responseAddUserSession.ok) {
            throw new Error("Echec ajout jeton utilisateur.");
          };
        sessionStorage.setItem('token', connectionToken);
        router.push(`/${clientCode}/${roleRoute}`);
      } else {
        setError('Aucun role associé avec ce compte');
      }
    } catch (err: any) {
      setError(err.message || "Une erreur d'authentification de l'utilisateur s'est produite");
    } finally {
      setLoading(false);
    }
  };

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