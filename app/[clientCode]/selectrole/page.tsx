/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL, decodeToken } from '@/lib/auth';

export default function SelectRolePage() {
  const router = useRouter();
  const params = useParams();
  const clientCode = params?.clientCode as string;

  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initRoleSelection = async () => {
      const tempToken = sessionStorage.getItem('tempToken');

      if (!tempToken) {
        router.push(`/app/${clientCode}/login`);
        return;
      }

      try {
        const decoded = await decodeToken(tempToken);
        const userRoles = decoded?.user?.roles || [];

        if (userRoles.length === 0) {
          setError('Aucun rôle associé à ce compte.');
        } else {
          setRoles(userRoles);
          setSelectedRole(userRoles[0]);
        }
      } catch {
        setError('Impossible de lire la session utilisateur.');
      }
    };

    initRoleSelection();
  }, [clientCode, router]);

  const handleRoleSelection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setLoading(true);
    setError('');

    try {
      const tempToken = sessionStorage.getItem('tempToken');

      const responseAddUserSession = await fetch(`${API_BASE_URL}/addusersession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tempToken,
          role: selectedRole,
        }),
      });

      if (!responseAddUserSession.ok) {
        throw new Error('Échec du choix du rôle pour la session.');
      }

      const roleRoute = selectedRole.toLowerCase();
      router.push(`/app/${clientCode}/${roleRoute}`);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la sélection du rôle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Sélectionner un rôle
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleRoleSelection} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rôles disponibles
          </label>
          <div className="space-y-2">
            {roles.map((role) => (
              <label
                key={role}
                className={`flex items-center p-3 border rounded-md cursor-pointer transition ${
                  selectedRole === role
                    ? 'border-teal-primary bg-teal-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={selectedRole === role}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="h-4 w-4 text-teal-primary focus:ring-teal-primary border-gray-300"
                />
                <span className="ml-3 text-sm font-medium text-gray-900 capitalize">
                  {role.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedRole}
          className="w-full py-2.5 px-4 bg-teal-primary text-white font-medium rounded-md hover:bg-teal-700 transition duration-150 disabled:opacity-50 mt-4"
        >
          {loading ? 'Validation...' : 'Confirmer le rôle'}
        </button>
      </form>
    </div>
  );
}