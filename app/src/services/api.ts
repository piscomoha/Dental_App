const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `API error ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      
      // Handle Laravel validation errors (422)
      if (response.status === 422 && errorData.errors) {
        const validationErrors = Object.entries(errorData.errors)
          .map(([field, messages]) => {
            const msgs = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${msgs.join(', ')}`;
          })
          .join('; ');
        errorMessage = `Erreur de validation: ${validationErrors}`;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // If JSON parsing fails, try to get text
      const errorText = await response.text().catch(() => '');
      if (errorText) {
        errorMessage = `${errorMessage}: ${errorText}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  // Handle 204 No Content (e.g. DELETE responses) or empty bodies
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as unknown as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as unknown as T;
  }

  return JSON.parse(text) as T;
}

// Patients API (Laravel /api/patients)
export interface BackendPatient {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  date_naissance: string;
  adresse: string | null;
  sexe: string;
}

export const patientApi = {
  list: () => request<BackendPatient[]>('/patients'),
  create: (data: Partial<BackendPatient>) =>
    request<BackendPatient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Partial<BackendPatient>) =>
    request<BackendPatient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<void>(`/patients/${id}`, {
      method: 'DELETE',
    }),
};

// Dentistes API (Laravel /api/dentistes)
export interface BackendDentiste {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  specialite: string;
}

export const dentisteApi = {
  list: () => request<BackendDentiste[]>('/dentistes'),
  create: (data: Partial<BackendDentiste>) =>
    request<BackendDentiste>('/dentistes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Partial<BackendDentiste>) =>
    request<BackendDentiste>(`/dentistes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<void>(`/dentistes/${id}`, {
      method: 'DELETE',
    }),
};

// Secretaires API (Laravel /api/secretaires)
export interface BackendSecretaire {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
}

export const secretaireApi = {
  list: () => request<BackendSecretaire[]>('/secretaires'),
  create: (data: Partial<BackendSecretaire>) =>
    request<BackendSecretaire>('/secretaires', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Partial<BackendSecretaire>) =>
    request<BackendSecretaire>(`/secretaires/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<void>(`/secretaires/${id}`, {
      method: 'DELETE',
    }),
};

// Rendez-vous API (Laravel /api/rendez_vous)
export interface BackendRendezVousPatient {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
}

export interface BackendRendezVousDentiste {
  id: number;
  nom: string;
  prenom: string;
}

export interface BackendRendezVousTraitement {
  id: number;
  nom_traitement: string;
}

export interface BackendRendezVousConsultation {
  id: number;
  traitements?: BackendRendezVousTraitement[];
}

export interface BackendRendezVous {
  id: number;
  date_rdv: string;
  heure_rdv: string;
  statut: string;
  patient_id: number | null;
  dentiste_id: number | null;
  secretaire_id?: number | null;
  patient?: BackendRendezVousPatient | null;
  dentiste?: BackendRendezVousDentiste | null;
  consultation?: BackendRendezVousConsultation | null;
}

export const rendezVousApi = {
  list: () => request<BackendRendezVous[]>('/rendez_vous'),
  create: (data: Partial<BackendRendezVous>) =>
    request<BackendRendezVous>('/rendez_vous', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Partial<BackendRendezVous>) =>
    request<BackendRendezVous>(`/rendez_vous/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<void>(`/rendez_vous/${id}`, {
      method: 'DELETE',
    }),
};

export interface BackendNotification {
  id: number;
  target_role: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const notificationApi = {
  list: (role?: string) => request<BackendNotification[]>(`/notifications${role ? `?role=${role}` : ''}`),
  create: (data: { target_role: string; message: string }) =>
    request<BackendNotification>('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  markAsRead: (id: number) => request<BackendNotification>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: (role?: string) => request<void>(`/notifications/read-all${role ? `?role=${role}` : ''}`, { method: 'PUT' }),
};

// Traitements API (Laravel /api/traitements)
export interface BackendTraitement {
  id: number;
  nom_traitement: string;
  description: string;
  prix: number;
  consultation_id: number | null;
  consultation?: {
    id: number;
    rendez_vous_id?: number;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export const traitementApi = {
  list: () => request<BackendTraitement[]>('/traitements'),
  create: (data: Partial<BackendTraitement>) =>
    request<BackendTraitement>('/traitements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Partial<BackendTraitement>) =>
    request<BackendTraitement>(`/traitements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<void>(`/traitements/${id}`, {
      method: 'DELETE',
    }),
};

// Ordonnances API (Laravel /api/ordonnances)
export interface BackendOrdonnance {
  id: number;
  date_ordonnance: string;
  medicaments: string;
  instructions: string;
  consultation_id: number | null;
  consultation?: {
    id: number;
    rendez_vous?: {
      patient?: {
        nom: string;
        prenom: string;
      };
      dentiste?: {
        nom: string;
        prenom: string;
      };
    };
  } | null;
  created_at?: string;
  updated_at?: string;
}

export const ordonnanceApi = {
  list: () => request<BackendOrdonnance[]>('/ordonnances'),
  create: (data: Partial<BackendOrdonnance>) =>
    request<BackendOrdonnance>('/ordonnances', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Partial<BackendOrdonnance>) =>
    request<BackendOrdonnance>(`/ordonnances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<void>(`/ordonnances/${id}`, {
      method: 'DELETE',
    }),
};

// Factures API (Laravel /api/factures)
export interface BackendFacture {
  id: number;
  date_facture: string;
  montant_total: number;
  consultation_id: number | null;
  consultation?: {
    id: number;
    rendez_vous_id?: number;
  } | null;
  paiements?: { id: number; montant: number }[];
}

export const factureApi = {
  list: () => request<BackendFacture[]>('/factures'),
  create: (data: Partial<BackendFacture>) =>
    request<BackendFacture>('/factures', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Partial<BackendFacture>) =>
    request<BackendFacture>(`/factures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<void>(`/factures/${id}`, {
      method: 'DELETE',
    }),
};

// Certificats API (Laravel /api/certificats)
export interface BackendCertificat {
  id: number;
  date_certificat: string;
  contenu: string;
  patient_name?: string | null;
  consultation_id: number | null;
}

export const certificatApi = {
  list: () => request<BackendCertificat[]>('/certificats'),
  create: (data: Partial<BackendCertificat>) =>
    request<BackendCertificat>('/certificats', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Partial<BackendCertificat>) =>
    request<BackendCertificat>(`/certificats/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<void>(`/certificats/${id}`, {
      method: 'DELETE',
    }),
};

// Devis API (Laravel /api/devis)
export interface BackendDevis {
  id: number;
  date_devis: string;
  description?: string;
  montant_estime: number;
  consultation_id: number | null;
}

export const devisApi = {
  list: () => request<BackendDevis[]>('/devis'),
  create: (data: Partial<BackendDevis>) =>
    request<BackendDevis>('/devis', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Partial<BackendDevis>) =>
    request<BackendDevis>(`/devis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<void>(`/devis/${id}`, {
      method: 'DELETE',
    }),
};

// Password Reset API
export interface PasswordResetResponse {
  message: string;
  success?: boolean;
}

export const passwordResetApi = {
  sendResetLink: (email: string) =>
    request<PasswordResetResponse>('/password-reset/send-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  verifyToken: (email: string, token: string) =>
    request<PasswordResetResponse>('/password-reset/verify-token', {
      method: 'POST',
      body: JSON.stringify({ email, token }),
    }),
  resetPassword: (email: string, token: string, password: string, password_confirmation: string) =>
    request<PasswordResetResponse>('/password-reset/reset', {
      method: 'POST',
      body: JSON.stringify({ email, token, password, password_confirmation }),
    }),
};
