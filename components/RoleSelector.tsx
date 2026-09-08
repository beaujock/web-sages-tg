/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, UserCircle } from 'lucide-react';

export function RoleSelector({ clientCode }: { clientCode: string }) {
  const router = useRouter();
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    // Retrieve roles stored during the initial login step
    const storedRoles = sessionStorage.getItem('userRoles');
    if (storedRoles) {
      const listRoles = JSON.parse(storedRoles);
      if (listRoles.length === 1) router.push(`/${clientCode}/${listRoles[0].toLowerCase()}`);
      setRoles(JSON.parse(storedRoles));
    } else {
      // Fallback if no roles are found
      router.push(`/${clientCode}/login`);
    }
  }, [clientCode, router]);

  const handleRoleSelect = (role: string) => {
    sessionStorage.setItem('activeRole', role.toLowerCase());
    // Redirect to the respective dashboard based on the selected role
    router.push(`/${clientCode}/${role.toLowerCase()}`);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <Shield className="w-12 h-12 text-teal-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Choisissez un rôle</h2>
        <p className="text-gray-500 mt-2">Votre compte possède plusieurs accès.</p>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleSelect(role)}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <UserCircle className="w-6 h-6 text-gray-400 group-hover:text-teal-600" />
              <span className="font-medium text-gray-700 group-hover:text-teal-700 capitalize">
                {role}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-teal-600 transform group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
}