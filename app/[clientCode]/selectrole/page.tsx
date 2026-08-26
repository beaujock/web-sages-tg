'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL, decodeToken, setClientCookie, DecodedJwtToken } from '@/lib/auth';
import { getRoleRoute } from '../login/page';

export default function SelectRolePage() {
  const router = useRouter();
  const params = useParams();
  const clientCode = params?.clientCode as string;

  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const tempToken = sessionStorage.getItem('tempToken');
    if (!tempToken) {
      router.push(`/app/${clientCode}/login`);
      return;
    }

    try {
      const decoded: DecodedJwtToken = decodeToken(tempToken);
      setRoles(decoded.userRoles || []);
    } catch {
      router.push(`/app/${clientCode}/login`);
    }
  }, [clientCode, router]);

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setLoading(true);
    setError('');

    try {
      const tempToken = sessionStorage.getItem('tempToken');
      const cookieName = sessionStorage.getItem('cookieName') || 'session';

      const res = await fetch(`${API_BASE_URL}/auth/select-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate single-role session token.');
      }

      const { roleToken } = await res.json();
      const decodedRoleToken = decodeToken(roleToken);

      // Overwrite current cookie with scoped role token
      setClientCookie(cookieName, roleToken, decodedRoleToken.expiryDate);

      // Save role context for menu building
      sessionStorage.setItem('activeRole', selectedRole);
      sessionStorage.setItem('userResources', JSON.stringify(decodedRoleToken.userResources));

      const targetRoute = getRoleRoute(selectedRole);
      router.push(`/app/${clientCode}/${targetRoute}`);
    } catch (err: any) {
      setError(err.message || "Erreur d'initialisation de votre role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Selectionne le role</h1>
      <p className="text-sm text-gray-600 text-center mb-6">
        Sélectionnez le role que vous voulez utiliser
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleRoleSubmit} className="space-y-4">
        <div className="space-y-2">
          {roles.map((role) => (
            <label
              key={role}
              className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition ${
                selectedRole === role
                  ? 'border-coral-accent bg-orange-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="capitalize font-medium text-gray-800">
                {role.replace('_', ' ')}
              </span>
              <input
                type="radio"
                name="userRole"
                value={role}
                checked={selectedRole === role}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="text-coral-accent focus:ring-coral-accent"
              />
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={!selectedRole || loading}
          className="w-full py-2.5 px-4 bg-teal-primary text-white font-medium rounded-md hover:bg-teal-700 transition duration-150 disabled:opacity-50"
        >
          {loading ? 'Confirmiation en cours...' : 'Continuez dans SAGES'}
        </button>
      </form>
    </div>
  );
}