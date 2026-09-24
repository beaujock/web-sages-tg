/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, use, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth'; 

const { 
  Loader2, ArrowLeft, Save, UploadCloud, Image: ImageIcon, 
  CheckCircle2, User, School, Presentation, Calendar, AlignLeft 
} = LucideIcons;

export default function AddElevePage({
  params,
}: {
  params: Promise<{ clientCode: string }>;
}) {
  const { clientCode } = use(params); 
  const router = useRouter(); 

  // Form Data - Section 1: Student
  const [eleveData, setEleveData] = useState({
    last_name: '',
    first_name: '',
    other_names: '',
    preferred_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    email: '',
    notes: '',
  });

  // Form Data - Section 2: Registration
  const [inscriptionData, setInscriptionData] = useState({
    ecoleId: '',
    salleclasseId: '',
    registrationDate: new Date().toISOString().split('T')[0],
    registrationNotes: '',
  });

  // Lookups State
  const [genders, setGenders] = useState<{ code: string; label: string }[]>([]); 
  const [schools, setSchools] = useState<{ id: string; short_name: string; [key: string]: any }[]>([]);
  const [classrooms, setClassrooms] = useState<{ id: string; code: string; [key: string]: any }[]>([]);

  // UI & File State
  const [photo, setPhoto] = useState<File | null>(null); 
  const [photoPreview, setPhotoPreview] = useState<string | null>(null); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [error, setError] = useState(''); 
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Visual Progress State
  const [progress, setProgress] = useState({
    studentCreated: false,
    inscriptionCreated: false,
    photoUploaded: false,
  });

  // Fetch genders and schools on mount
  useEffect(() => {
    const fetchInitialLookups = async () => {
      try {
        const token = getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string); 
        if (!token) return;

        // Fetch Genders
        const gendersRes = await fetch(`${API_BASE_URL}/${clientCode}/lookups/genders`, {
          headers: { Authorization: `Bearer ${token}` }, 
        });

        if (gendersRes.ok) {
          const data = await gendersRes.json();
          setGenders(data.genders); 
          if (data.genders.length > 0) {
            setEleveData((prev) => ({ ...prev, gender: data.genders[0].code })); 
          }
        }

        // Fetch Schools
        const schoolsRes = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/lookups/listecoles`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (schoolsRes.ok) {
          const data = await schoolsRes.json();
          setSchools(Array.isArray(data) ? data : data.ecoles || []);
        }

      } catch (err) {
        console.error('Erreur lors du chargement des données de référence:', err);
      }
    };

    fetchInitialLookups();
  }, [clientCode]);

  // Fetch Classrooms when School changes
  useEffect(() => {
    if (!inscriptionData.ecoleId) {
      setClassrooms([]);
      setInscriptionData(prev => ({ ...prev, salleclasseId: '' }));
      return;
    }

    const fetchClassrooms = async () => {
      setLoadingClasses(true);
      try {
        console.log("Ecole ID : ", inscriptionData.ecoleId);
        const token = getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string);

        const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/lookups/listecolesalleclasses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ ecoleId: inscriptionData.ecoleId })
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Classroomd :  ", data.salleclasses);
          setClassrooms(Array.isArray(data) ? data : data.salleclasses || []);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des classes:', err);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClassrooms();
  }, [inscriptionData.ecoleId, clientCode]);


  const handleEleveChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEleveData((prev) => ({ ...prev, [name]: value })); 
  };

  const handleInscriptionChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInscriptionData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        setError('L\'image ne doit pas dépasser 5 Mo.'); 
        return;
      }
      setPhoto(file); 
      setPhotoPreview(URL.createObjectURL(file)); 
      setError(''); 
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); 
    setError(''); 
    setProgress({ studentCreated: false, inscriptionCreated: false, photoUploaded: false });

    try {
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string; 
      const token = getCookie(cookieName); 

      if (!token) {
        router.push(`/${clientCode}/login`); 
        return;
      }

      // Step 1: Create student record and registration
      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/eleves/addeleve`, {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ 
          eleveData, 
          inscriptionData 
        }),
      });

      if (res.status === 401) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`; 
        router.push(`/${clientCode}/login`); 
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null); 
        throw new Error(errorData?.message || 'Erreur lors de la création de l\'élève'); 
      }

      const responseData = await res.json(); 
      const eleveMatricule = responseData.eleve?.matricule; 

      // Visual update for success steps based on API response
      setProgress(prev => ({ ...prev, studentCreated: true }));
      await new Promise(resolve => setTimeout(resolve, 400)); // Slight delay for visual progression
      setProgress(prev => ({ ...prev, inscriptionCreated: true }));

      // Step 2: Upload photo to NEON Storage
      if (photo && eleveMatricule) { 
        const photoData = new FormData(); 
        photoData.append('file', photo); 
        photoData.append('folder', `${clientCode.toLowerCase()}`); 
        photoData.append('filename', `eleves/${eleveMatricule}.jpg`); 

        const uploadRes = await fetch(`${API_BASE_URL}/${clientCode}/storage/uploadeleve`, {
          method: 'POST', 
          headers: {
            'Authorization': `Bearer ${token}`, 
          },
          body: photoData, 
        });

        if (!uploadRes.ok) {
          console.warn('L\'élève a été créé, mais le téléchargement de la photo a échoué.'); 
        }
      }
      setProgress(prev => ({ ...prev, photoUploaded: true }));

      // Redirect after success visual flow
      setTimeout(() => {
        router.push(`/${clientCode}/admin_client/eleves`); 
      }, 1000);

    } catch (err: any) {
      console.error(err); 
      setError(err.message || 'Une erreur est survenue lors de la création.'); 
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href={`/${clientCode}/admin_client/eleves`}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500" 
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-charcoal-secondary">Ajouter un Élève</h2>
          <p className="text-sm text-gray-500 mt-1">Créez un nouveau dossier d&apos;élève et son inscription.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: STUDENT */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex items-center space-x-2">
            <User className="w-5 h-5 text-teal-primary" />
            <h3 className="text-lg font-semibold text-charcoal-secondary">1. Informations de l&apos;Élève</h3>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="shrink-0 flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden relative group">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <UploadCloud className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-xs text-gray-500 text-center max-w-30">
                  Cliquez pour ajouter une photo (Max 5Mo)
                </span>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    name="last_name"
                    value={eleveData.last_name}
                    onChange={handleEleveChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    name="first_name"
                    value={eleveData.first_name}
                    onChange={handleEleveChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Date de naissance <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="date"
                    name="date_of_birth"
                    value={eleveData.date_of_birth}
                    onChange={handleEleveChange}
                    className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100 my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Autres noms (Optionnel)</label>
                <input
                  type="text"
                  name="other_names"
                  value={eleveData.other_names}
                  onChange={handleEleveChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nom usuel (Optionnel)</label>
                <input
                  type="text"
                  name="preferred_name"
                  value={eleveData.preferred_name}
                  onChange={handleEleveChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Genre <span className="text-red-500">*</span></label>
                <select
                  required
                  name="gender"
                  value={eleveData.gender}
                  onChange={handleEleveChange}
                  disabled={genders.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary bg-white transition-colors disabled:opacity-50"
                >
                  {genders.map((g: any) => (
                    <option key={g.id || g.code} value={g.id || g.code}>
                      {g.label || g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Téléphone (Optionnel)</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={eleveData.phone_number}
                  onChange={handleEleveChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Email (Optionnel)</label>
                <input
                  type="email"
                  name="email"
                  value={eleveData.email}
                  onChange={handleEleveChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                  placeholder="eleve@ecole.com"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Notes médicales ou générales (Optionnel)</label>
                <textarea
                  name="notes"
                  value={eleveData.notes}
                  onChange={handleEleveChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors resize-y"
                  placeholder="Allergies, remarques spécifiques..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: REGISTRATION */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex items-center space-x-2">
            <School className="w-5 h-5 text-teal-primary" />
            <h3 className="text-lg font-semibold text-charcoal-secondary">2. Détails de l&apos;Inscription</h3>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">École <span className="text-red-500">*</span></label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  required
                  name="ecoleId"
                  value={inscriptionData.ecoleId}
                  onChange={handleInscriptionChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary appearance-none bg-white transition-colors"
                >
                  <option value="" disabled>Sélectionner une école</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.short_name || school.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Classe <span className="text-red-500">*</span></label>
              <div className="relative">
                <Presentation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  required
                  name="salleclasseId"
                  disabled={!inscriptionData.ecoleId || loadingClasses}
                  value={inscriptionData.salleclasseId}
                  onChange={handleInscriptionChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                >
                  <option value="" disabled>
                    {loadingClasses ? 'Chargement...' : 'Sélectionner une classe'}
                  </option>
                  {classrooms.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.code}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Date d&apos;inscription <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  required
                  name="registrationDate"
                  value={inscriptionData.registrationDate}
                  onChange={handleInscriptionChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Notes d&apos;inscription (Optionnel)</label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  name="registrationNotes"
                  value={inscriptionData.registrationNotes}
                  onChange={handleInscriptionChange}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors resize-y"
                  placeholder="Informations supplémentaires liées à l'inscription..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visual Progress Checkpoints */}
        {isSubmitting && (
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-around items-center gap-4">
            <div className={`flex items-center space-x-2 transition-all duration-300 ${progress.studentCreated ? 'text-teal-600' : 'text-gray-400 opacity-60'}`}>
              {progress.studentCreated ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
              <span className="font-medium text-sm">Élève créé</span>
            </div>
            
            <div className="hidden sm:block h-px bg-gray-200 w-12" />

            <div className={`flex items-center space-x-2 transition-all duration-300 ${progress.inscriptionCreated ? 'text-teal-600' : 'text-gray-400 opacity-60'}`}>
              {progress.inscriptionCreated ? <CheckCircle2 className="w-5 h-5" /> : (progress.studentCreated ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />)}
              <span className="font-medium text-sm">Inscription liée</span>
            </div>

            <div className="hidden sm:block h-px bg-gray-200 w-12" />

            <div className={`flex items-center space-x-2 transition-all duration-300 ${progress.photoUploaded ? 'text-teal-600' : 'text-gray-400 opacity-60'}`}>
              {progress.photoUploaded ? <CheckCircle2 className="w-5 h-5" /> : (progress.inscriptionCreated ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />)}
              <span className="font-medium text-sm">Photo traitée</span>
            </div>
          </div>
        )}

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border border-gray-200 rounded-xl shadow-sm">
          <Link
            href={`/${clientCode}/admin_client/eleves`}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" 
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !inscriptionData.ecoleId || !inscriptionData.salleclasseId}
            className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-medium text-white bg-teal-primary rounded-lg hover:bg-[#005f73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" 
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Enregistrer et Inscrire l&apos;Élève</span>
          </button>
        </div>
      </form>
    </div>
  );
}