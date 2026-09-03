/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { School, Layers, Users, ArrowRight, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/auth';

type DashboardData = {
  clientEcoles: any[] | number;
  clientModules: any[] | number;
  clientActiveUsers: any[] | number;
};

export default function AdminClientDashboard({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  // Unwrap the params using React.use() since it's a Promise in Next.js 15+
  const { clientCode } = use(params);
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Retrieve the token from sessionStorage
        //console.log("Entering fetchDashboardData");
        const token = sessionStorage.getItem('token');
        //console.log("Token retrieved from sessionStorage:", token);

        if (!token) {
          throw new Error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
        }

        // 2. Attach it as a Bearer token in the headers
        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des données du tableau de bord');
        }

        const jsonData = await res.json();
        setData(jsonData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [clientCode]);

  // Handle Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <p className="text-gray-500">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  // Handle Error State
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  // Helper to safely get the count
  const getCount = (field: any[] | number | undefined) => {
    if (Array.isArray(field)) return field.length;
    if (typeof field === 'number') return field;
    return 0;
  };

  const widgets = [
    {
      title: 'Écoles',
      count: getCount(data?.clientEcoles),
      icon: School,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: `/${clientCode}/admin_client/ecoles`,
      linkText: 'Voir les écoles',
    },
    {
      title: 'Modules',
      count: getCount(data?.clientModules),
      icon: Layers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: `/${clientCode}/admin_client/modules`,
      linkText: 'Voir les modules',
    },
    {
      title: 'Utilisateurs Actifs',
      count: getCount(data?.clientActiveUsers),
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      link: `/${clientCode}/admin_client/utilisateurs`,
      linkText: 'Voir les utilisateurs',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Vue d&apos;ensemble</h2>
        <p className="text-sm text-gray-500 mt-1">
          Statistiques principales de votre environnement client.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {widgets.map((widget, index) => {
          const Icon = widget.icon;

          return (
            <div 
              key={index} 
              className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 flex flex-col justify-between transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">{widget.title}</h3>
                <div className={`p-3 rounded-full ${widget.bgColor}`}>
                  <Icon className={`w-6 h-6 ${widget.color}`} strokeWidth={2} />
                </div>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{widget.count}</span>
              </div>

              <Link 
                href={widget.link}
                className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors group"
              >
                {widget.linkText}
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}