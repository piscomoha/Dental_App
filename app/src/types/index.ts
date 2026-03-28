export interface Patient {
  id: string;
  name: string;
  cin: string;
  age: number;
  phone: string;
  email?: string;
  city: string;
  gender: 'Masculin' | 'Féminin';
  insurance?: string;
  allergies?: string;
  medicalHistory?: string;
  status: 'Actif' | 'Inactif';
  lastVisit?: string;
  nextAppointment?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  treatment: string;
  doctor: string;
  status: 'Confirmé' | 'En attente' | 'Annulé' | 'Terminé';
  notes?: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  description: string;
  cost: number;
  date: string;
  teeth?: string;
  doctor: string;
  status: 'Planifié' | 'En cours' | 'Terminé';
}

export interface Document {
  id: string;
  type: 'Ordonnance' | 'Certificat' | 'Devis' | 'Facture' | 'Compte-rendu';
  patientName: string;
  doctorName: string;
  date: string;
  medications?: string[];
  content?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  status: 'Ouverte' | 'Fermée';
  availability: 'Disponible' | 'Non disponible';
  medications: string[];
  distance: number;
  position: { x: number; y: number };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Doctor' | 'Admin' | 'Receptionist' | 'Patient';
  avatar: string;
}
