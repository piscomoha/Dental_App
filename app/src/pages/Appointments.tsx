import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Eye, Edit, Check, Trash2, Calendar } from 'lucide-react';
import { treatmentTypes } from '@/data/mockData';
import { useDataSync } from '@/context/DataSyncContext';
import type { Appointment } from '@/types';
import { rendezVousApi, patientApi, notificationApi, type BackendRendezVous, type BackendPatient } from '@/services/api';
import { LoadingOverlay } from '@/components/ui/loading-overlay';


const statusFilters = ['Tous', 'Confirmés', 'En attente', 'Annulés', 'Terminés'];

export default function AppointmentsPage() {
  const { notifyDataChange } = useDataSync();
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [patients, setPatients] = useState<BackendPatient[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    patientId: '',
    phone: '',
    date: '',
    time: '',
    treatment: '',
    status: 'En attente',
    notes: '',
  });

  const mapBackendRendezVousToAppointment = (backend: BackendRendezVous): Appointment => {
    const patientName = backend.patient
      ? `${backend.patient.nom} ${backend.patient.prenom}`.trim()
      : `Patient ${backend.patient_id ?? ''}`.trim();

    const treatmentName =
      backend.consultation?.traitements && backend.consultation.traitements.length > 0
        ? backend.consultation.traitements[0].nom_traitement
        : 'Consultation';

    const doctorName = backend.dentiste
      ? `Dr. ${backend.dentiste.nom} ${backend.dentiste.prenom}`.trim()
      : 'Dr. Youssef Benali';

    let status: Appointment['status'];
    const rawStatus = backend.statut.toLowerCase();
    if (rawStatus.includes('confirm')) {
      status = 'Confirmé';
    } else if (rawStatus.includes('annul')) {
      status = 'Annulé';
    } else if (rawStatus.includes('termin')) {
      status = 'Terminé';
    } else {
      status = 'En attente';
    }

    return {
      id: String(backend.id),
      patientId: String(backend.patient_id ?? ''),
      patientName,
      patientPhone: backend.patient?.telephone ?? '',
      date: backend.date_rdv,
      time: backend.heure_rdv,
      treatment: treatmentName,
      doctor: doctorName,
      status,
      notes: undefined,
    };
  };

  const loadAppointments = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const backend = await rendezVousApi.list();
      if (backend) {
        const mapped = backend.map(mapBackendRendezVousToAppointment);
        setAppointmentsList(mapped);
      } else {
        setAppointmentsList([]);
      }
    } catch (err) {
      console.error(err);
      setAppointmentsList([]);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(false);
    
    // Fetch patients for the select dropdown
    const loadPatients = async () => {
      try {
        const fetchedPatients = await patientApi.list();
        setPatients(fetchedPatients);
      } catch (err) {
        console.error("Could not load patients:", err);
      }
    };
    loadPatients();
    const interval = setInterval(() => loadAppointments(true), 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <LoadingOverlay message="Chargement des rendez-vous..." fullScreen={false} />;
  }

  const filteredAppointments = appointmentsList.filter(apt => {
    const matchesFilter = activeFilter === 'Tous' ||
      (activeFilter === 'Confirmés' && apt.status === 'Confirmé') ||
      (activeFilter === 'En attente' && apt.status === 'En attente') ||
      (activeFilter === 'Annulés' && apt.status === 'Annulé') ||
      (activeFilter === 'Terminés' && apt.status === 'Terminé');

    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.treatment.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmé':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-medium">Confirmé</Badge>;
      case 'En attente':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-medium">En attente</Badge>;
      case 'Annulé':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 font-medium">Annulé</Badge>;
      case 'Terminé':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-medium">Terminé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleOpenModal = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        patientId: appointment.patientId || '',
        phone: appointment.patientPhone,
        date: appointment.date,
        time: appointment.time,
        treatment: appointment.treatment,
        status: appointment.status,
        notes: appointment.notes || '',
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        patientId: '',
        phone: '',
        date: '',
        time: '',
        treatment: '',
        status: 'En attente',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.date || !formData.time || !formData.patientId) {
        setErrorMessage('Veuillez remplir tous les champs requis');
        return;
      }

      const payload = {
        date_rdv: formData.date,
        heure_rdv: formData.time,
        statut: formData.status || 'En attente',
        patient_id: Number(formData.patientId),
        dentiste_id: null, // Make optional
        secretaire_id: null, // Make optional
      };

      console.log('Sending rendez-vous payload:', payload);

      const pName = patients.find(p => String(p.id) === formData.patientId)?.nom || 'un patient';

      if (editingAppointment) {
        await rendezVousApi.update(editingAppointment.id, payload);
        await notificationApi.create({ target_role: 'Doctor', message: `Le rendez-vous de ${pName} a été modifié.` });
      } else {
        await rendezVousApi.create(payload);
        await notificationApi.create({ target_role: 'Doctor', message: `Nouveau rendez-vous créé pour ${pName}.` });
      }
      setIsModalOpen(false);
      await loadAppointments();
      notifyDataChange('appointment');
      setSuccessMessage("Rendez-vous enregistré avec succès.");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Rendez-vous save error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setErrorMessage("Erreur lors de l'enregistrement du rendez-vous: " + errorMsg);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await rendezVousApi.delete(id);
      await loadAppointments();
      notifyDataChange('appointment');
      setSuccessMessage("Rendez-vous supprimé.");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Erreur lors de la suppression.");
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await rendezVousApi.update(id, { statut: 'Confirmé' });
      await loadAppointments();
      setSuccessMessage("Rendez-vous confirmé avec succès.");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Erreur lors de la confirmation.");
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-10 slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0d3d3d]">Rendez-vous</h1>
          <p className="text-gray-500">{appointmentsList.length} au total</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau RDV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher patient ou soin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-lg border-gray-200"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? 'bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg' : 'rounded-lg border-gray-200'}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Appointments Table */}
      <Card className="border-0 shadow-sm bg-white rounded-xl">
        <CardContent className="p-0">
          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Heure</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Soin</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Médecin</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 bg-[#0d3d3d]">
                            <AvatarFallback className="bg-[#0d3d3d] text-white text-sm font-medium">
                              {appointment.patientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{appointment.patientName}</p>
                            <p className="text-sm text-gray-500">{appointment.patientPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-900 font-medium">{appointment.date}</p>
                        <p className="text-sm text-gray-500">{appointment.time}</p>
                      </td>
                      <td className="py-4 px-6 text-gray-900">{appointment.treatment}</td>
                      <td className="py-4 px-6 text-gray-900">{appointment.doctor}</td>
                      <td className="py-4 px-6">{getStatusBadge(appointment.status)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenModal(appointment)}
                            className="p-2 text-gray-400 hover:text-[#0d3d3d] hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(appointment)}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {appointment.status === 'En attente' && (
                            <button
                              onClick={() => handleConfirm(appointment.id)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Aucun rendez-vous trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New/Edit Appointment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0d3d3d]">
              {editingAppointment ? 'Modifier rendez-vous' : 'Nouveau rendez-vous'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-sm">Patient <span className="text-red-500">*</span></Label>
              <Select
                value={formData.patientId}
                onValueChange={(val) => {
                  const patient = patients.find(p => String(p.id) === val);
                  setFormData({ ...formData, patientId: val, phone: patient?.telephone || '' });
                }}
              >
                <SelectTrigger className="h-11 rounded-lg border-gray-200">
                  <SelectValue placeholder="Sélectionner un patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{`${p.nom} ${p.prenom}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+212 6XX XXX XXX"
                className="h-11 rounded-lg border-gray-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-11 rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Heure <span className="text-red-500">*</span></Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="h-11 rounded-lg border-gray-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Type de soin <span className="text-red-500">*</span></Label>
              <Select
                value={formData.treatment}
                onValueChange={(value) => setFormData({ ...formData, treatment: value })}
              >
                <SelectTrigger className="h-11 rounded-lg border-gray-200">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {treatmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Confirmé">Confirmé</SelectItem>
                  <SelectItem value="Terminé">Terminé</SelectItem>
                  <SelectItem value="Annulé">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Notes</Label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Remarques, symptômes..."
                className="w-full min-h-[80px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d3d] focus:border-transparent resize-none"
              />
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

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-[#0d3d3d] z-50 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {successMessage}
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
