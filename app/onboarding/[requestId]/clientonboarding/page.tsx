/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import HeaderWithoutSages from '@/components/HeaderWithoutSages';

interface PageProps {
  params: Promise<{
    requestId: string;
  }>;
}

interface StepDefinition {
  stepOrder: number;
  name: string;
  getApiUrl: (ctx: { requestId: string; onboardingId?: string; clientId?: string; schoolId?: string }) => string;
}

interface StepState {
  stepOrder: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  errorMessage?: string;
}

// Hardcoded onboarding steps configuration
const HARDCODED_STEPS: StepDefinition[] = [
  {
    stepOrder: 1,
    name: "Création du dossier d'intégration",
    getApiUrl: ({ requestId }) =>
      `${process.env.NEXT_PUBLIC_ONBOARDING_URL || ''}${requestId}/createonboarding`,
  },
  {
    stepOrder: 2,
    name: "Génération des étapes de configuration",
    getApiUrl: ({ requestId, onboardingId }) =>
      `${process.env.NEXT_PUBLIC_ONBOARDING_URL || ''}${requestId}/createonboarding/${onboardingId || ''}/createonboardingsteps`,
  },
  {
    stepOrder: 3,
    name: "Création du dossier client",
    getApiUrl: ({ requestId, onboardingId }) =>
      `${process.env.NEXT_PUBLIC_ONBOARDING_URL || ''}${requestId}/createonboarding/${onboardingId || ''}/registerclient`,
  },
  {
    stepOrder: 4,
    name: "Ajout des module de base au client",
    getApiUrl: ({ requestId, onboardingId, clientId }) =>
      `${process.env.NEXT_PUBLIC_ONBOARDING_URL || ''}${requestId}/createonboarding/${onboardingId || ''}/registerclient/${clientId || ''}/addmodules`,
  },
  {
    stepOrder: 5,
    name: "Ajout de parametres au client",
    getApiUrl: ({ requestId, onboardingId, clientId }) =>
      `${process.env.NEXT_PUBLIC_ONBOARDING_URL || ''}${requestId}/createonboarding/${onboardingId || ''}/registerclient/${clientId || ''}/adddefaultsettings`,
  },
  {
    stepOrder: 6,
    name: "Création de l'école",
    getApiUrl: ({ requestId, onboardingId, clientId }) =>
      `${process.env.NEXT_PUBLIC_ONBOARDING_URL || ''}${requestId}/createonboarding/${onboardingId || ''}/registerclient/${clientId || ''}/registerschool`,
  },
  {
    stepOrder: 7,
    name: "Ajout de l'école au portfolio du client",
    getApiUrl: ({ requestId, onboardingId, clientId, schoolId }) =>
      `${process.env.NEXT_PUBLIC_ONBOARDING_URL || ''}${requestId}/createonboarding/${onboardingId || ''}/registerclient/${clientId || ''}/registerschool/${schoolId || ''}/addschooltoclient`,
  },
  {
    stepOrder: 8,
    name: "Création de l'administrateur client",
    getApiUrl: ({ requestId, onboardingId, clientId }) =>
      `${process.env.NEXT_PUBLIC_ONBOARDING_URL || ''}${requestId}/createonboarding/${onboardingId || ''}/registerclient/${clientId || ''}/registeruser`,
  },
];

export default function ClientOnboardingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.requestId;
  const router = useRouter();

  const [steps, setSteps] = useState<StepState[]>(
    HARDCODED_STEPS.map((s) => ({
      stepOrder: s.stepOrder,
      name: s.name,
      status: 'pending',
    }))
  );
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    async function executeOnboardingPipeline() {
      let onboardingId: string | undefined = undefined;
      let clientId: string | undefined = undefined;
      let schoolId: string | undefined = undefined;

      for (const stepDef of HARDCODED_STEPS) {
        if (!isSubscribed) return;

        // Mark current step as in progress
        setSteps((prev) =>
          prev.map((s) =>
            s.stepOrder === stepDef.stepOrder ? { ...s, status: 'in_progress' } : s
          )
        );

        try {
          const endpoint = stepDef.getApiUrl({ requestId, onboardingId, clientId, schoolId });
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            throw new Error(`Erreur lors de l'exécution de l'étape : ${stepDef.name}`);
          }

          const responseData = await response.json().catch(() => ({}));

          // Capture contextual data returned by API calls
          if (responseData.onboardingId) {
            onboardingId = responseData.onboardingId;
          }
          if (responseData.newClientId) {
            clientId = responseData.newClientId;
          }

          if (responseData.schoolId) {
            schoolId = responseData.schoolId;
          }

          if (!isSubscribed) return;

          // Mark current step as completed
          setSteps((prev) =>
            prev.map((s) =>
              s.stepOrder === stepDef.stepOrder ? { ...s, status: 'completed' } : s
            )
          );

          // Brief delay for visual transition smoothness
          await new Promise((r) => setTimeout(r, 1000));
        } catch (err: any) {
          if (!isSubscribed) return;

          setSteps((prev) =>
            prev.map((s) =>
              s.stepOrder === stepDef.stepOrder
                ? { ...s, status: 'error', errorMessage: err.message }
                : s
            )
          );
          return; // Stop pipeline on error
        }
      }

      // Mark the process as completed instead of redirecting to login
      if (isSubscribed) {
        setIsCompleted(true);
      }
    }

    executeOnboardingPipeline();

    return () => {
      isSubscribed = false;
    };
  }, [requestId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-charcoal-secondary">
      <HeaderWithoutSages />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl bg-white p-8 rounded-2xl border border-gray-200 shadow-lg space-y-6">
          {isCompleted ? (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-charcoal-secondary">
                  Initialisation terminée !
                </h1>
                <p className="text-sm text-gray-600">
                  Un e-mail vous a été envoyé avec les instructions de connexion.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                Retour à l&apos;accueil
              </button>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-charcoal-secondary">
                  Initialisation de votre plateforme
                </h1>
                <p className="text-sm text-gray-600">
                  Veuillez patienter pendant le traitement séquentiel des étapes.
                </p>
              </div>

              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.stepOrder}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      step.status === 'in_progress'
                        ? 'bg-teal-primary/5 border-teal-primary/40'
                        : step.status === 'completed'
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : step.status === 'error'
                        ? 'bg-red-500/5 border-red-500/30'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {step.status === 'completed' && (
                        <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          ✓
                        </div>
                      )}
                      {step.status === 'in_progress' && (
                        <div className="w-7 h-7 rounded-full border-2 border-teal-primary border-t-transparent animate-spin" />
                      )}
                      {step.status === 'pending' && (
                        <div className="w-7 h-7 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-semibold text-xs">
                          {step.stepOrder}
                        </div>
                      )}
                      {step.status === 'error' && (
                        <div className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          ✕
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3
                        className={`font-semibold text-base ${
                          step.status === 'pending' ? 'text-gray-500' : 'text-charcoal-secondary'
                        }`}
                      >
                        {step.name}
                      </h3>
                      {step.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">{step.errorMessage}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}