import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, FileText, Settings, CheckCircle2, Calendar } from 'lucide-react';
import { treatmentTypes } from '@/data/mockData';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { traitementApi, type BackendTraitement } from '@/services/api';
import { useDataSync } from '@/context/DataSyncContext';
import type { Treatment } from '@/types';
import {
  validatePrice,
  validateDate,
  validateRequiredSelect,
  validateDescription,
  sanitizeInput,
  PATTERNS,
} from '@/lib/validators';

export default function TreatmentsPage() {
  const { notifyDataChange } = useDataSync();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [treatmentsList, setTreatmentsList] = useState<Treatment[]>([]);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    patient_id: '',
    type: '',
    date: '',
    cost: '',
    teeth: '',
    status: 'Planifié',
    description: '',
  });

  // Map backend traitement to frontend Treatment type
  const mapBackendToFrontend = (backend: BackendTraitement): Treatment => ({
    id: String(backend.id),
    patientId: '',
    patientName: backend.nom_traitement,
    type: backend.nom_traitement,
    description: backend.description || '',
    cost: backend.prix || 0,
    date: backend.created_at ? backend.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    teeth: '',
    doctor: 'Dr. Youssef Benali',
    status: 'Planifié',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const backendTreatments = await traitementApi.list().catch(() => []);
      
      if (backendTreatments) {
        setTreatmentsList(backendTreatments.map(mapBackendToFrontend));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = {
    planned: treatmentsList.filter(t => t.status === 'Planifié').length,
    inProgress: treatmentsList.filter(t => t.status === 'En cours').length,
    completed: treatmentsList.filter(t => t.status === 'Terminé').length,
  };

  const filteredTreatments = treatmentsList.filter(treatment => 
    treatment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    treatment.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (treatment?: Treatment) => {
    if (treatment) {
      setEditingTreatment(treatment);
      setFormData({
        patient_id: treatment.patientId || '',
        type: treatment.type,
        date: treatment.date,
        cost: String(treatment.cost),
        teeth: treatment.teeth || '',
        status: treatment.status,
        description: treatment.description,
      });
    } else {
      setEditingTreatment(null);
      setFormData({
        patient_id: '',
        type: '',
        date: new Date().toISOString().split('T')[0],
        cost: '',
        teeth: '',
        status: 'Planifié',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setFormErrors({});

      // Validate required fields
      const errors: Record<string, string> = {};

      // Validate type
      const typeError = validateRequiredSelect(formData.type, 'Type de soin');
      if (typeError) errors.type = typeError.message;

      // Validate date
      const dateError = validateDate(formData.date, 'Date');
      if (dateError) errors.date = dateError.message;

      // Validate cost
      const costError = validatePrice(formData.cost, 'Coût');
      if (costError) errors.cost = costError.message;

      // Validate description if provided
      if (formData.description) {
        const descError = validateDescription(formData.description, 'Description', 0, 1000);
        if (descError) errors.description = descError.message;
      }

      // Validate teeth if provided
      if (formData.teeth) {
        if (!PATTERNS.ALPHANUMERIC.test(formData.teeth)) {
          errors.teeth = 'Dents: caractères invalides';
        }
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setErrorMessage('Veuillez corriger les erreurs dans le formulaire');
        return;
      }

      const payload = {
        nom_traitement: sanitizeInput(formData.type),
        description: sanitizeInput(formData.description),
        prix: Number(formData.cost),
        consultation_id: null,
        patient_id: formData.patient_id ? Number(formData.patient_id) : null,
      };

      console.log('Sending payload:', payload);

      let response;
      if (editingTreatment) {
        response = await traitementApi.update(editingTreatment.id, payload);
        setShowSuccessMessage('Soin modifié avec succès');
      } else {
        response = await traitementApi.create(payload);
        setShowSuccessMessage('Soin créé avec succès');
      }

      console.log('API Response:', response);
      setIsModalOpen(false);
      setFormErrors({});
      await loadData();
      notifyDataChange('treatment');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error details:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setErrorMessage("Erreur lors de l'enregistrement du soin. " + errorMsg);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await traitementApi.delete(id);
      setShowSuccessMessage('Soin supprimé');
      await loadData();
      notifyDataChange('treatment');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Erreur lors de la suppression du soin.");
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Planifié':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-medium">Planifié</Badge>;
      case 'En cours':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 font-medium">En cours</Badge>;
      case 'Terminé':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-medium">Terminé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Chargement des soins..." fullScreen={false} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in-10 slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0d3d3d]">Soins & Traitements</h1>
          <p className="text-gray-500">{treatmentsList.length} soins</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Soin
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
              <p className="text-sm text-gray-500">Planifiés</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
              <p className="text-sm text-gray-500">En cours</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-gray-500">Terminés</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Rechercher patient ou soin..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 rounded-lg border-gray-200"
        />
      </div>

      {/* Treatments List */}
      <div className="space-y-4">
        {filteredTreatments.map((treatment) => (
          <Card key={treatment.id} className="border-0 shadow-sm bg-white rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="w-10 h-10 bg-[#0d3d3d] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                        <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2.5-1 4-1 5.5 0 1.5.5 2.5 2 2.5s2-1 2-2.5c0-1.5 1-3 1-5.5 0-1.5-.5-2.5-1-3.5-.5-1-1-2-1-3.5 0-1.5 1-2.5 2-2.5s2 1 2 2.5c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2.5-1 4-1 5.5 0 1.5.5 2.5 2 2.5s2-1 2-2.5c0-1.5 1-3 1-5.5 0-1.5-.5-2.5-1-3.5-.5-1-1-2-1-3.5 0-2.5-2.5-5-6-5z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{treatment.patientName}</h3>
                        <span className="text-gray-400">—</span>
                        <span className="text-gray-600">{treatment.type}</span>
                        {getStatusBadge(treatment.status)}
                      </div>
                      <p className="text-sm text-gray-500">{treatment.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 ml-13 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {treatment.date}
                    </span>
                    {treatment.teeth && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2.5-1 4-1 5.5 0 1.5.5 2.5 2 2.5s2-1 2-2.5c0-1.5 1-3 1-5.5 0-1.5-.5-2.5-1-3.5-.5-1-1-2-1-3.5 0-1.5 1-2.5 2-2.5s2 1 2 2.5c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2.5-1 4-1 5.5 0 1.5.5 2.5 2 2.5s2-1 2-2.5c0-1.5 1-3 1-5.5 0-1.5-.5-2.5-1-3.5-.5-1-1-2-1-3.5 0-2.5-2.5-5-6-5z"/>
                        </svg>
                        {treatment.teeth}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {treatment.doctor}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <p className="text-xl font-bold text-[#0d3d3d]">{treatment.cost.toLocaleString()} MAD</p>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleOpenModal(treatment)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(treatment.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New/Edit Treatment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0d3d3d]">
              {editingTreatment ? 'Modifier soin' : 'Nouveau soin'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-sm">Type de soin <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => {
                  setFormData({ ...formData, type: value });
                  setFormErrors({ ...formErrors, type: '' });
                }}
              >
                <SelectTrigger className={`h-11 rounded-lg border-gray-200 ${formErrors.type ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {treatmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.type && <p className="text-red-500 text-xs">{formErrors.type}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    setFormErrors({ ...formErrors, date: '' });
                  }}
                  className={`bg-white rounded-lg ${formErrors.date ? 'border-red-500' : ''}`}
                  required
                />
                {formErrors.date && <p className="text-red-500 text-xs">{formErrors.date}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Coût (MAD) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => {
                    setFormData({ ...formData, cost: e.target.value });
                    setFormErrors({ ...formErrors, cost: '' });
                  }}
                  placeholder="0.00"
                  step="0.01"
                  className={`h-11 rounded-lg border-gray-200 ${formErrors.cost ? 'border-red-500' : ''}`}
                />
                {formErrors.cost && <p className="text-red-500 text-xs">{formErrors.cost}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Dents concernées</Label>
              <Input
                value={formData.teeth}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value || PATTERNS.ALPHANUMERIC.test(value)) {
                    setFormData({ ...formData, teeth: value });
                    setFormErrors({ ...formErrors, teeth: '' });
                  }
                }}
                placeholder="36, 37 ou Générale"
                className={`h-11 rounded-lg border-gray-200 ${formErrors.teeth ? 'border-red-500' : ''}`}
              />
              {formErrors.teeth && <p className="text-red-500 text-xs">{formErrors.teeth}</p>}
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
                  <SelectItem value="Planifié">Planifié</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Terminé">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setFormErrors({ ...formErrors, description: '' });
                }}
                placeholder="Détails du traitement..."
                maxLength={1000}
                className={`w-full min-h-[80px] px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d3d] focus:border-transparent resize-none ${formErrors.description ? 'border-red-500' : 'border-gray-200'}`}
              />
              <div className="flex justify-between items-center">
                <div>
                  {formErrors.description && <p className="text-red-500 text-xs">{formErrors.description}</p>}
                </div>
                <p className="text-xs text-gray-400">{formData.description.length}/1000</p>
              </div>
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
                onClick={() => {
                  setIsModalOpen(false);
                  setFormErrors({});
                }}
                className="flex-1 h-11 rounded-lg border-gray-200"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Toast */}
      {showSuccessMessage && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 ${showSuccessMessage.includes('supprimé') ? 'bg-red-500' : 'bg-[#0d3d3d]'} text-white`}>
          <div className={`w-5 h-5 ${showSuccessMessage.includes('supprimé') ? 'bg-red-700' : 'bg-green-500'} rounded-full flex items-center justify-center`}>
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showSuccessMessage.includes('supprimé') ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              )}
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
