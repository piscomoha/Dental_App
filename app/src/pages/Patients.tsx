import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Phone, MapPin, Calendar, AlertTriangle, ClipboardList, FileText, Activity } from 'lucide-react';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { cities, patients as mockPatients } from '@/data/mockData';
import { useDataSync } from '@/context/DataSyncContext';
import type { Patient } from '@/types';
import { patientApi, type BackendPatient } from '@/services/api';
import {
  validateName,
  validatePhone,
  validateDate,
} from '@/lib/validators';

export default function PatientsPage() {
  const { notifyDataChange } = useDataSync();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Dossier Médical State
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      try {
        const parsed = JSON.parse(authUser);
        setUserRole(parsed.role);
      } catch { void 0; }
    }
  }, []);

  // Map backend patient to frontend Patient type used by the UI
  const mapBackendPatientToFrontend = (backend: BackendPatient): Patient => {
    const fullName = `${backend.nom} ${backend.prenom}`.trim();

    // Simple age calculation based on birth year
    let age = 0;
    if (backend.date_naissance) {
      const birthDate = new Date(backend.date_naissance);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
    }

    const rawSexe = (backend.sexe || 'M').toLowerCase();
    const gender =
      rawSexe.startsWith('f')
        ? 'Féminin'
        : 'Masculin';

    return {
      id: String(backend.id),
      name: fullName || `Patient ${backend.id}`,
      cin: '',
      age,
      phone: backend.telephone,
      email: undefined,
      city: backend.adresse || '',
      gender,
      insurance: undefined,
      allergies: undefined,
      medicalHistory: undefined,
      status: 'Actif',
      lastVisit: undefined,
      nextAppointment: undefined,
    };
  };

  const mapFormToBackendPayload = () => {
    const [nom, ...rest] = formData.name.split(' ');
    const prenom = rest.join(' ');

    return {
      nom: nom || formData.name || 'Patient',
      prenom: prenom || '',
      telephone: formData.phone,
      date_naissance: formData.birthDate || '2000-01-01',
      adresse: formData.city || null,
      sexe: formData.gender === 'Féminin' ? 'F' : 'M',
    };
  };

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const backendPatients = await patientApi.list();
      if (backendPatients && backendPatients.length > 0) {
        const mapped = backendPatients.map(mapBackendPatientToFrontend);
        setPatientsList(mapped);
      } else {
        // Fallback to mock data if backend is empty
        setPatientsList(mockPatients);
      }
    } catch (error) {
      console.error('Failed to load patients, falling back to mock data:', error);
      setPatientsList(mockPatients);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    cin: '',
    birthDate: '',
    phone: '',
    email: '',
    city: '',
    gender: 'Masculin',
    insurance: '',
    allergies: '',
    medicalHistory: '',
    status: 'Actif',
  });

  const filteredPatients = patientsList.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.cin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  );

  const handleOpenModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        name: patient.name,
        cin: patient.cin,
        birthDate: patient.lastVisit || '',
        phone: patient.phone,
        email: patient.email || '',
        city: patient.city,
        gender: patient.gender,
        insurance: patient.insurance || '',
        allergies: patient.allergies || '',
        medicalHistory: patient.medicalHistory || '',
        status: patient.status,
      });
    } else {
      setEditingPatient(null);
      setFormData({
        name: '',
        cin: '',
        birthDate: '',
        phone: '',
        email: '',
        city: '',
        gender: 'Masculin',
        insurance: '',
        allergies: '',
        medicalHistory: '',
        status: 'Actif',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const errors: Record<string, string> = {};

      // Validate name
      const nameError = validateName(formData.name, 'Nom');
      if (nameError) errors.name = nameError.message;

      // Validate phone
      const phoneError = validatePhone(formData.phone);
      if (phoneError) errors.phone = phoneError.message;

      // Validate birthDate if provided
      if (formData.birthDate) {
        const dateError = validateDate(formData.birthDate, 'Date de naissance');
        if (dateError) errors.birthDate = dateError.message;
      }

      if (Object.keys(errors).length > 0) {
        setErrorMessage('Veuillez corriger les erreurs dans le formulaire');
        return;
      }

      const payload = mapFormToBackendPayload();
      
      if (editingPatient) {
        await patientApi.update(editingPatient.id, payload);
        setShowSuccessMessage('Patient modifié avec succès');
      } else {
        await patientApi.create(payload);
        setShowSuccessMessage('Patient créé avec succès');
      }
      setIsModalOpen(false);
      await loadPatients();
      notifyDataChange('patient');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Erreur API lors de la sauvegarde", err);
      setErrorMessage("Erreur lors de l'enregistrement en base de données.");
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      try {
        await patientApi.delete(patientToDelete.id);
        setShowSuccessMessage('Patient supprimé');
        await loadPatients();
        notifyDataChange('patient');
        setTimeout(() => setShowSuccessMessage(''), 3000);
      } catch (err) {
        console.error(err);
        setErrorMessage("Erreur lors de la suppression en base de données.");
        setTimeout(() => setErrorMessage(''), 4000);
        setIsDeleteDialogOpen(false);
      }
    } else {
      setIsDeleteDialogOpen(false);
    }
    setPatientToDelete(null);
  };

  if (isLoading) {
    return <LoadingOverlay message="Chargement des patients..." fullScreen={false} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in-10 slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0d3d3d]">Patients</h1>
          <p className="text-gray-500">{patientsList.length} patients</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Patient
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Nom, CIN ou téléphone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 rounded-lg border-gray-200"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="border-0 shadow-sm bg-white rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 bg-[#0d3d3d]">
                    <AvatarFallback className="bg-[#0d3d3d] text-white font-medium">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <Badge className={patient.status === 'Actif' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'}>
                        {patient.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{patient.age} ans • CIN: {patient.cin}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-purple-500" />
                  {patient.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-red-500" />
                  {patient.city}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {patient.lastVisit || '—'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-green-500" />
                  {patient.nextAppointment || '—'}
                </div>
              </div>

              {patient.allergies && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg mb-4 text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="font-medium text-red-700">Allergie: {patient.allergies}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {userRole !== 'Receptionist' && (
                  <Button
                    onClick={() => {
                      setSelectedPatient(patient);
                      setIsDossierOpen(true);
                    }}
                    className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg"
                    variant="outline"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Dossier Médical
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenModal(patient)}
                    className="flex-1 bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteClick(patient)}
                    className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0d3d3d]">
              {editingPatient ? 'Modifier patient' : 'Nouveau patient'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-sm">Nom complet <span className="text-red-500">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 rounded-lg border-gray-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">CIN <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.cin}
                  onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                  className="h-11 rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Date de naissance</Label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="h-11 rounded-lg border-gray-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Téléphone <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11 rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 rounded-lg border-gray-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Ville</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger className="h-11 rounded-lg border-gray-200">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Sexe</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger className="h-11 rounded-lg border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculin">Masculin</SelectItem>
                    <SelectItem value="Féminin">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Mutuelle</Label>
              <Input
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                placeholder="CNSS, etc."
                className="h-11 rounded-lg border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Allergies</Label>
              <Input
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="h-11 rounded-lg border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Antécédents médicaux</Label>
              <Input
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                className="h-11 rounded-lg border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="h-11 rounded-lg border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                className="flex-1 h-11 bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg"
              >
                Enregistrer
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-11 rounded-lg border-gray-200"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Voulez-vous supprimer le dossier de <strong>{patientToDelete?.name}</strong> ?
              <p className="text-xs text-gray-400 mt-2">Action irréversible — Loi 09-08 CNDP.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="flex-1 bg-red-500 hover:bg-red-600 rounded-lg"
            >
              Confirmer
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1 rounded-lg"
            >
              Annuler
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dossier Medical Modal */}
      <Dialog open={isDossierOpen} onOpenChange={setIsDossierOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl p-0 bg-gray-50 border-0 shadow-2xl">
          <div className="bg-[#0d3d3d] p-6 text-white flex items-center gap-4 shrink-0">
            <Avatar className="w-16 h-16 bg-[#c4a35a] border-2 border-white/20">
              <AvatarFallback className="bg-[#c4a35a] text-white text-xl font-medium">
                {selectedPatient?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{selectedPatient?.name}</h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white font-medium border-0">
                  {selectedPatient?.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-gray-300 text-sm">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {selectedPatient?.age} ans</span>
                <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> CIN: {selectedPatient?.cin}</span>
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {selectedPatient?.phone}</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Infos */}
              <div className="space-y-6">
                <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                  <div className="bg-white p-4 border-b border-gray-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Infos Médicales</h3>
                  </div>
                  <CardContent className="p-4 bg-gray-50/50 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Mutuelle</p>
                      <p className="text-sm font-medium text-gray-900">{selectedPatient?.insurance || 'Aucune / Non renseignée'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Antécédents</p>
                      <p className="text-sm font-medium text-gray-900">{selectedPatient?.medicalHistory || 'Aucun antécédent particulier.'}</p>
                    </div>
                    {selectedPatient?.allergies && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs text-red-600 font-bold uppercase mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Allergies
                        </p>
                        <p className="text-sm font-medium text-red-900">{selectedPatient.allergies}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Historique / Traitements */}
              <div className="md:col-span-2 space-y-6">
                <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                  <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Plan de Traitement</h3>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg border-gray-200">
                      <Plus className="w-3 h-3 mr-1" /> Ajouter
                    </Button>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {/* Mocked History Item 1 */}
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">Consultation Initiale & Détartrage</h4>
                          <Badge className="bg-green-100 text-green-700">Terminé</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Dr. Youssef Benali • 15 Fév 2026</p>
                        <p className="text-sm text-gray-700">Détartrage complet sous-gingival et polissage. Sensibilité légère notée sur la 36.</p>
                      </div>
                      {/* Mocked History Item 2 */}
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">Soins Carie 36</h4>
                          <Badge className="bg-blue-100 text-blue-700">Planifié</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Dr. Youssef Benali • Prévisionnel</p>
                        <p className="text-sm text-gray-700">Composite prévu sur la 36 suite à la radio panoramique.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white border-t border-gray-100 flex justify-end shrink-0">
            <Button onClick={() => setIsDossierOpen(false)} className="bg-[#0d3d3d] hover:bg-[#1a4d4d] text-white rounded-lg px-6">
              Fermer le dossier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Toast */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-[#0d3d3d] z-50 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {showSuccessMessage}
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-600 z-50 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          {errorMessage}
        </div>
      )}
    </div>
  );
}
