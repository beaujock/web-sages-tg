/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, use, type ChangeEvent, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Image as ImageIcon, Loader2, Save, UploadCloud, User, X } from 'lucide-react';
import { API_BASE_URL, getCookie } from '@/lib/auth';

type CreateEleveDO = {
    //matricule       : string;
    last_name       : string;
    first_name      : string;
    other_names     : string | null;
    preferred_name  : string | null;
    date_of_birth   : Date;
    gender          : string;
    phone_number    : string | null;
    email           : string | null;
    notes           : string | null;
};

type GenderDO = {
    code  : string;
    label : string;
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const INPUT_CLASS = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:border-teal-primary transition-colors';

// Optional text fields are sent as null when left empty
const toNullable = (value: string) => (value.trim() === '' ? null : value.trim());

export default function AddEcoleElevePage({
  params,
}: {
  params: Promise<{ clientCode: string; ecoleId: string }>;
}) {
  const { clientCode, ecoleId } = use(params);
  const router = useRouter();

  const elevesRoute = `/${clientCode}/admin_client/ecoles/${ecoleId}/eleves`;

  // Form fields are kept as strings for the inputs, then mapped to CreateEleveDO on submit
  const [formData, setFormData] = useState({
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

  const [genders, setGenders] = useState<GenderDO[]>([]);
  const [ecoleCode, setEcoleCode] = useState('');

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState({ eleveCreated: false, photoUploaded: false });
  const [error, setError] = useState('');

  // Load gender options and the school code (used for the photo storage path)
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const token = getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string);
        if (!token) return;

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };

        const [gendersRes, ecoleRes] = await Promise.all([
          fetch(`${API_BASE_URL}/${clientCode}/lookups/genders`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/detail`, { method: 'GET', headers }),
        ]);

        if (gendersRes.ok) {
          const data = await gendersRes.json();
          const list: GenderDO[] = Array.isArray(data) ? data : data.genders || [];
          setGenders(list);
          if (list.length > 0) {
            setFormData((prev) => (prev.gender ? prev : { ...prev, gender: list[0].code }));
          }
        }

        if (ecoleRes.ok) {
          const data = await ecoleRes.json();
          setEcoleCode(data.ecole?.code || data.ecole?.short_name || '');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données de référence:', err);
      }
    };

    fetchLookups();
  }, [clientCode, ecoleId]);

  // Release the preview object URL when it is replaced or the page unmounts
  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file after removing it
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Le fichier sélectionné doit être une image.');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setProgress({ eleveCreated: false, photoUploaded: false });

    try {
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME as string;
      const token = getCookie(cookieName);

      if (!token) {
        router.push(`/${clientCode}/login`);
        return;
      }

      const eleveData: CreateEleveDO = {
        last_name: formData.last_name.trim(),
        first_name: formData.first_name.trim(),
        other_names: toNullable(formData.other_names),
        preferred_name: toNullable(formData.preferred_name),
        date_of_birth: new Date(formData.date_of_birth),
        gender: formData.gender,
        phone_number: toNullable(formData.phone_number),
        email: toNullable(formData.email),
        notes: toNullable(formData.notes),
      };

      // Step 1: Create the student for this school
      const res = await fetch(`${API_BASE_URL}/${clientCode}/admin_client/ecoles/${ecoleId}/eleves/addeleve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ eleveData }),
      });

      if (res.status === 401) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        router.push(`/${clientCode}/login`);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Erreur lors de la création de l'élève");
      }

      const responseData = await res.json();
      const eleveMatricule: string | undefined = responseData.eleve?.matricule;
      setProgress((prev) => ({ ...prev, eleveCreated: true }));

      // Step 2: Upload the photo, stored under the matricule generated by the API
      if (photo && eleveMatricule) {
        const schoolFolder = ecoleCode ? `${ecoleCode.toLowerCase()}/` : '';

        const photoData = new FormData();
        photoData.append('file', photo);
        photoData.append('folder', clientCode.toLowerCase());
        photoData.append('filename', `${schoolFolder}eleves/${eleveMatricule.toUpperCase()}.jpg`);
        if (ecoleCode) photoData.append('schoolCode', ecoleCode);

        const uploadRes = await fetch(`${API_BASE_URL}/${clientCode}/storage/uploadeleve`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: photoData,
        });

        if (!uploadRes.ok) {
          console.warn("L'élève a été créé, mais le téléchargement de la photo a échoué.");
        }
      }
      setProgress((prev) => ({ ...prev, photoUploaded: true }));

      setTimeout(() => router.push(elevesRoute), 800);
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
          href={elevesRoute}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          title="Retour à la liste"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-charcoal-secondary">Ajouter un Élève</h2>
          <p className="text-sm text-gray-500 mt-1">Créez un nouveau dossier d&apos;élève pour cette école.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex items-center space-x-2">
            <User className="w-5 h-5 text-teal-primary" />
            <h3 className="text-lg font-semibold text-charcoal-secondary">Informations de l&apos;Élève</h3>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Photo */}
              <div className="shrink-0 flex flex-col items-center gap-2 mx-auto sm:mx-0">
                <div className="relative">
                  <label
                    className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-teal-primary transition-colors"
                    title="Ajouter une photo"
                  >
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="Aperçu de la photo" className="w-full h-full object-cover" />
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
                      disabled={isSubmitting}
                      className="sr-only"
                    />
                  </label>
                  {photoPreview && !isSubmitting && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-2 -right-2 p-1 bg-white border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-coral-accent transition-colors"
                      title="Retirer la photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-500 text-center max-w-32">
                  {photo ? photo.name : 'Cliquez pour ajouter une photo (Max 5 Mo)'}
                </span>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="space-y-1.5">
                  <label htmlFor="last_name" className="text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                  <input id="last_name" required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={INPUT_CLASS} />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="first_name" className="text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                  <input id="first_name" required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={INPUT_CLASS} />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700">Date de naissance <span className="text-red-500">*</span></label>
                  <input
                    id="date_of_birth"
                    required
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={handleChange}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gender" className="text-sm font-medium text-gray-700">Genre <span className="text-red-500">*</span></label>
                  <select
                    id="gender"
                    required
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={genders.length === 0}
                    className={`${INPUT_CLASS} bg-white disabled:opacity-50`}
                  >
                    {genders.length === 0 && <option value="">Chargement...</option>}
                    {genders.map((g) => (
                      <option key={g.code} value={g.code}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="other_names" className="text-sm font-medium text-gray-700">Autres noms (Optionnel)</label>
                <input id="other_names" type="text" name="other_names" value={formData.other_names} onChange={handleChange} className={INPUT_CLASS} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="preferred_name" className="text-sm font-medium text-gray-700">Nom usuel (Optionnel)</label>
                <input id="preferred_name" type="text" name="preferred_name" value={formData.preferred_name} onChange={handleChange} className={INPUT_CLASS} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone_number" className="text-sm font-medium text-gray-700">Téléphone (Optionnel)</label>
                <input
                  id="phone_number"
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                  placeholder="+228 90 00 00 00"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email (Optionnel)</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                  placeholder="eleve@ecole.com"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes médicales ou générales (Optionnel)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className={`${INPUT_CLASS} resize-y`}
                  placeholder="Allergies, remarques spécifiques..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visual Progress Checkpoints */}
        {isSubmitting && (
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-around items-center gap-4">
            <div className={`flex items-center space-x-2 transition-all duration-300 ${progress.eleveCreated ? 'text-teal-600' : 'text-gray-400 opacity-60'}`}>
              {progress.eleveCreated ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
              <span className="font-medium text-sm">Élève créé</span>
            </div>

            <div className="hidden sm:block h-px bg-gray-200 w-12" />

            <div className={`flex items-center space-x-2 transition-all duration-300 ${progress.photoUploaded ? 'text-teal-600' : 'text-gray-400 opacity-60'}`}>
              {progress.photoUploaded ? <CheckCircle2 className="w-5 h-5" /> : (progress.eleveCreated ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />)}
              <span className="font-medium text-sm">{photo ? 'Photo téléchargée' : 'Finalisation'}</span>
            </div>
          </div>
        )}

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border border-gray-200 rounded-xl shadow-sm">
          <Link
            href={elevesRoute}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.gender}
            className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-medium text-white bg-teal-primary rounded-lg hover:bg-[#005f73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Enregistrer l&apos;Élève</span>
          </button>
        </div>
      </form>
    </div>
  );
}
