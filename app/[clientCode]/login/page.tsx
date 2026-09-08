/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL, callDecodeToken, callGetUserConnectionInfos, getCookie, setClientCookie } from '@/lib/auth';

// Helper function to retrieve a cookie by its name
/*
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};
*/

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const clientCode = params?.clientCode as string;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const cookieName = sessionStorage.getItem('cookie_name')||null; //return 'BEAUJOCK_SAGES_TG'
        let token = sessionStorage.getItem('token') || sessionStorage.getItem('tempToken') || null;

        // Fallback to reading the cookie if not found in sessionStorage
        if (!token && cookieName) {
          token = getCookie(cookieName) || null;
        }

        if (token && clientCode) {
          const decoded = await callDecodeToken(token);
          if (!decoded || decoded === null) {
            throw new Error("Veuillez vous reconnecter.");
          }
          const userInfos = await callGetUserConnectionInfos(clientCode, decoded.user_id);
          if (!userInfos || userInfos === null) {
            throw new Error("Impossible de récupérer vos informations Veuillez vous reconnecter.");
          }
          if (userInfos.roles.length === 0) {
            throw new Error("Vous n'avez aucun rôle assigné. Veuillez vous reconnecter ou contactez votre administrateur.");
          }
          if (userInfos.roles) {
            if (userInfos.roles.length > 1) {
              router.push(`/${clientCode}/selectrole`);
            } else if (userInfos.roles.length === 1) {
              const roleRoute = userInfos.roles[0].toLocaleLowerCase();
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


  const handleLogin = async (e: React.SubmitEvent) => {
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
      
      //console.log("Response : ", res);
      const data = await res.json();
      console.log("Data : ", data);
      
      const connectionToken = data.connectionToken;
      if (!connectionToken) {
        throw new Error("Echec authentification.\nVérifier vos information d'identification.");
      };
      
      const userId = data.user_id;
      const firstLogin = data.first_login;
      const cookie_name = data.cookie_name;
      const menuItems = data.menu_items;
      //const resources = data.resources;
      const userRoles = data.roles;
      const effective_date = data.effective_date;
      const expiry_date = data.expiry_date;
      const user_full_name = data.user_full_name;

      // Save initial connection context in sessionStorage
      sessionStorage.setItem('token', connectionToken);
      sessionStorage.setItem('cookie_name', cookie_name);
      sessionStorage.setItem('menuItems', JSON.stringify(menuItems));
      sessionStorage.setItem('user_full_name', user_full_name);
      sessionStorage.setItem('user_id', userId);

      //sessionStorage.setItem('userRoles', JSON.stringify(userRoles));
      //console.log("Menu Items stored in sessionStorage: ", menuItems);

      // Store browser cookie
      setClientCookie(cookie_name, connectionToken, expiry_date);

      if (firstLogin) {
        router.push(`/${clientCode}/changepassword`);
        return;
      }

      // Route based on role count
      if (userRoles.length > 1) {
        sessionStorage.setItem('userRoles', JSON.stringify(userRoles));
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
            throw new Error("Echec authentification. Réessayez ou contactez votre administrateur.");
          };
        sessionStorage.setItem('token', connectionToken);
        router.push(`/${clientCode}/${roleRoute}`);
      } else {
        setError('Aucun role associé avec ce compte. Reconnectez vous ou contactez votre administrateur.');
      }
    } catch (err: any) {
      setError(err.message);
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