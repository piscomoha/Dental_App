import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { ordonnanceApi, factureApi, certificatApi, devisApi, patientApi, type BackendPatient } from '@/services/api';
import { 
  FileText, 
  Pill, 
  FileCheck, 
  DollarSign, 
  ClipboardList,
  MapPin,
  Search,
  Eye,
  Download,
  Printer,
  Trash2,
  Navigation,
  Phone,
  X,
  Plus,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { pharmacies, cities } from '@/data/mockData';
import type { Document, Pharmacy } from '@/types';

const documentTypes = [
  { type: 'Ordonnance', icon: Pill, color: 'text-pink-500', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
  { type: 'Certificat', icon: FileCheck, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { type: 'Devis', icon: DollarSign, color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { type: 'Facture', icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { type: 'Compte-rendu', icon: ClipboardList, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('documents');
  const [documentsList, setDocumentsList] = useState<Document[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState<BackendPatient[]>([]);
  
  const [pharmacyCity, setPharmacyCity] = useState('Casablanca');
  const [pharmacyFilter, setPharmacyFilter] = useState('Toutes');
  const [medicationSearch, setMedicationSearch] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get current user from localStorage to check if it's a patient
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
    
    // Load patients list for doctor interface
    const loadPatients = async () => {
      try {
        const fetchedPatients = await patientApi.list();
        setPatients(fetchedPatients);
      } catch (e) {
        console.error('Could not load patients:', e);
      }
    };
    loadPatients();
  }, []);

  const [prescriptionForm, setPrescriptionForm] = useState({
    patient: '',
    date: new Date().toISOString().split('T')[0],
    city: 'Casablanca',
    medications: '',
    notes: '',
    amount: '',
    content: '',
  });

  const loadDocuments = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const ords = await ordonnanceApi.list().catch(e => { console.error('Ord error:', e); return []; });
      const facts = await factureApi.list().catch(e => { console.error('Fact error:', e); return []; });
      const certs = await certificatApi.list().catch(e => { console.error('Cert error:', e); return []; });
      const devs = await devisApi.list().catch(e => { console.error('Dev error:', e); return []; });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const safeMap = (arr: any) => Array.isArray(arr) ? arr : (arr?.data && Array.isArray(arr.data) ? arr.data : []);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedOrd = safeMap(ords).map((ord: any) => ({
        id: String(ord.id),
        type: 'Ordonnance' as const,
        patientName: ord.consultation?.rendez_vous?.patient?.nom || 'Patient inconnu',
        doctorName: ord.consultation?.rendez_vous?.dentiste?.nom ? `Dr. ${ord.consultation.rendez_vous.dentiste.nom}` : 'Dr. Youssef Benali',
        date: ord.date_ordonnance,
        medications: ord.medicaments ? String(ord.medicaments).split('\n') : [],
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedFact = safeMap(facts).map((f: any) => ({
        id: String(f.id),
        type: 'Facture' as const,
        patientName: f.consultation?.rendez_vous?.patient?.nom || (f.consultation?.rendez_vous_id ? `Consultation #${f.consultation?.rendez_vous_id}` : 'Patient inconnu'),
        doctorName: 'Dr. Youssef Benali',
        date: f.date_facture,
        content: `Montant: ${Number(f.montant_total || 0).toFixed(2)} MAD`,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedCert = safeMap(certs).map((c: any) => ({
        id: String(c.id),
        type: 'Certificat' as const,
        patientName: c.patient_name || 'Patient',
        doctorName: 'Dr. Youssef Benali',
        date: c.date_certificat,
        content: c.contenu,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedDev = safeMap(devs).map((d: any) => ({
        id: String(d.id),
        type: 'Devis' as const,
        patientName: d.consultation?.rendez_vous?.patient?.nom || (d.consultation_id ? `Consultation #${d.consultation_id}` : 'Patient'),
        doctorName: 'Dr. Youssef Benali',
        date: d.date_devis,
        content: `${(d.description || '').trim()} • Montant estimé: ${Number(d.montant_estime || 0).toFixed(2)} MAD`,
      }));

      const fetched = [...mappedOrd, ...mappedFact, ...mappedCert, ...mappedDev];
      fetched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // If current user is a Patient, strict filter documents by their name
      const filteredForUser = currentUser?.role === 'Patient' && currentUser?.name
        ? fetched.filter(doc => {
            const docPatientName = (doc.patientName || '').toLowerCase();
            const currentUserName = currentUser.name.toLowerCase();
            // Strict matching to avoid showing documents from other patients
            return docPatientName === currentUserName || docPatientName.includes(currentUserName);
          })
        : fetched;
      
      setDocumentsList(filteredForUser);
    } catch (err) {
      console.error(err);
      // Keep existing list if fetch fails to avoid flicker
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser !== undefined) { // Wait for currentUser to load before fetching
      loadDocuments(false);
      const interval = setInterval(() => loadDocuments(true), 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleCreateDocument = (type: string) => {
    setModalType(type);
    setSelectedDocument(null);
    setPrescriptionForm({
      patient: '',
      date: new Date().toISOString().split('T')[0],
      city: 'Casablanca',
      medications: '',
      notes: '',
      amount: '',
      content: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveDocument = async () => {
    try {
      let createdDoc: Document | null = null;
      if (modalType === 'Ordonnance') {
        const meds = prescriptionForm.medications.trim() || "Amoxicilline 1g — 3x/jour pendant 7 jours\nIbuprofène 400mg — au besoin\nMétronidazole 500mg — 2x/jour 5 jours";
        const created = await ordonnanceApi.create({
          date_ordonnance: prescriptionForm.date,
          medicaments: meds,
          instructions: prescriptionForm.notes || '',
          consultation_id: null,
        });
        createdDoc = {
          id: String(created.id),
          type: 'Ordonnance',
          patientName: prescriptionForm.patient || 'Patient',
          doctorName: 'Dr. Youssef Benali',
          date: created.date_ordonnance,
          medications: created.medicaments ? created.medicaments.split('\n') : [],
        };
      } else if (modalType === 'Facture') {
        const amount = Number(prescriptionForm.amount) || 0;
        const created = await factureApi.create({
          date_facture: prescriptionForm.date,
          montant_total: amount,
          consultation_id: null,
        });
        createdDoc = {
          id: String(created.id),
          type: 'Facture',
          patientName: 'Patient',
          doctorName: 'Dr. Youssef Benali',
          date: created.date_facture,
          content: `Montant: ${Number(created.montant_total).toFixed(2)} MAD`,
        };
      } else if (modalType === 'Devis') {
        const amount = Number(prescriptionForm.amount) || 0;
        const created = await devisApi.create({
          date_devis: prescriptionForm.date,
          description: prescriptionForm.content || '',
          montant_estime: amount,
          consultation_id: null,
        });
        createdDoc = {
          id: String(created.id),
          type: 'Devis',
          patientName: 'Patient',
          doctorName: 'Dr. Youssef Benali',
          date: created.date_devis,
          content: `${(created.description || '').trim()} • Montant estimé: ${Number(created.montant_estime).toFixed(2)} MAD`,
        };
      } else if (modalType === 'Certificat') {
        const content = prescriptionForm.content.trim() || "Certificat médical standard généré par le Dr. Youssef Benali.";
        const created = await certificatApi.create({
          date_certificat: prescriptionForm.date,
          contenu: content,
          patient_name: prescriptionForm.patient || null,
          consultation_id: null,
        });
        createdDoc = {
          id: String(created.id),
          type: 'Certificat',
          patientName: created.patient_name || 'Patient',
          doctorName: 'Dr. Youssef Benali',
          date: created.date_certificat,
          content: created.contenu,
        };
      }
      setIsModalOpen(false);
      if (createdDoc) {
        setDocumentsList(prev => {
          const next = [createdDoc!, ...prev];
          next.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          return next;
        });
      }
      await loadDocuments(true);
      setSuccessMessage('Document créé avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Erreur lors de la création du document");
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    try {
      if (doc.type === 'Ordonnance') {
        await ordonnanceApi.delete(doc.id);
      } else if (doc.type === 'Facture') {
        await factureApi.delete(doc.id);
      } else if (doc.type === 'Certificat') {
        await certificatApi.delete(doc.id);
      } else if (doc.type === 'Devis') {
        await devisApi.delete(doc.id);
      } else {
        // Unsupported type in backend yet (Compte-rendu), just return
        return;
      }
      await loadDocuments();
      setSuccessMessage('Document supprimé');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Erreur lors de la suppression");
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const handlePrintDocument = (doc: Document) => {
    // Generate a simple print view
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Impression - ${doc.type}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
            h1 { color: #0d3d3d; border-bottom: 2px solid #0d3d3d; padding-bottom: 10px; }
            .meta { margin-bottom: 30px; color: #555; }
            .content { border: 1px solid #eee; padding: 20px; border-radius: 8px; }
            .meds { margin-top: 20px; }
            .meds li { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>Cabinet Dentaire Dr. Benali & Associés</h1>
          <div class="meta">
            <p><strong>Document:</strong> ${doc.type}</p>
            <p><strong>Patient:</strong> ${doc.patientName}</p>
            <p><strong>Date:</strong> ${doc.date}</p>
            <p><strong>Docteur:</strong> ${doc.doctorName}</p>
          </div>
          <div class="content">
            ${doc.content ? `<p>${doc.content}</p>` : ''}
            ${doc.medications && doc.medications.length > 0 ? `
              <h3>Prescriptions:</h3>
              <ul class="meds">
                ${doc.medications.map(m => `<li>${m}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadDocument = (doc: Document) => {
    let content = `Cabinet Dentaire Dr. Benali & Associés\n\nDocument: ${doc.type}\nPatient: ${doc.patientName}\nDate: ${doc.date}\nDocteur: ${doc.doctorName}\n\n`;
    if (doc.content) {
      content += `Contenu:\n${doc.content}\n`;
    }
    if (doc.medications && doc.medications.length > 0) {
      content += `\nPrescriptions:\n${doc.medications.join('\n')}\n`;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${doc.type}_${doc.patientName.replace(/\s+/g, '_')}_${doc.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    if (doc.type === 'Ordonnance') {
      setActiveTab('pharmacies');
      if (doc.medications && doc.medications.length > 0) {
        setMedicationSearch(doc.medications[0]);
      }
    } else {
      setSuccessMessage(`Visualisation du ${doc.type} : ${doc.content || doc.medications?.join(', ')}`);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleShowPharmacies = (doc: Document) => {
    setSelectedDocument(doc);
    setActiveTab('pharmacies');
    if (doc.medications && doc.medications.length > 0) {
      setMedicationSearch(doc.medications[0]);
    }
  };

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesCity = pharmacy.city === pharmacyCity;
    const matchesFilter = pharmacyFilter === 'Toutes' ||
      (pharmacyFilter === 'Disponible' && pharmacy.availability === 'Disponible') ||
      (pharmacyFilter === 'Ouvertes' && pharmacy.status === 'Ouverte');
    const matchesMedication = !medicationSearch || 
      pharmacy.medications.some(med => med.toLowerCase().includes(medicationSearch.toLowerCase()));
    
    return matchesCity && matchesFilter && matchesMedication;
  });

  const getDocumentIcon = (type: string) => {
    const docType = documentTypes.find(dt => dt.type === type);
    if (docType) {
      const Icon = docType.icon;
      return (
        <div className={`w-10 h-10 ${docType.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${docType.color}`} />
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <LoadingOverlay message="Chargement des documents..." fullScreen={false} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in-10 slide-in-from-right-4 duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0d3d3d]">Documents & Pharmacies</h1>
        <p className="text-gray-500">Ordonnances, certificats et localisation des pharmacies</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
          <TabsTrigger value="documents" className="data-[state=active]:bg-gray-100 rounded-md px-4 py-2">
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="pharmacies" className="data-[state=active]:bg-gray-100 rounded-md px-4 py-2">
            <MapPin className="w-4 h-4 mr-2" />
            Pharmacies proches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6 mt-6">
          {/* Create Document Buttons - Hidden for Patients */}
          {currentUser?.role !== 'Patient' && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">Créer un document</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {documentTypes.map((docType) => {
                  const Icon = docType.icon;
                  return (
                    <button
                      key={docType.type}
                      onClick={() => handleCreateDocument(docType.type)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed ${docType.borderColor} hover:border-[#0d3d3d] hover:bg-gray-50 transition-all duration-200`}
                    >
                      <div className={`w-14 h-14 ${docType.bgColor} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-7 h-7 ${docType.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{docType.type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents List */}
          <Card className="border-0 shadow-sm bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentUser?.role === 'Patient' ? 'Mes documents' : `Documents (${documentsList.length})`}
                </h3>
              </div>

              {documentsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun document</h3>
                  <p className="text-gray-500 text-center max-w-sm">
                    {currentUser?.role === 'Patient' 
                      ? "Vous n'avez pas encore de documents médicaux associés à votre dossier." 
                      : "Aucun document n'a été créé pour le moment. Utilisez les boutons ci-dessus pour commencer."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                {documentsList.map((doc) => (
                  <div key={`${doc.type}:${doc.id}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      {getDocumentIcon(doc.type)}
                      <div>
                        <p className="font-medium text-gray-900">{doc.type}</p>
                        <p className="text-sm text-gray-500">{doc.patientName} • Dr. Youssef Benali</p>
                        {doc.medications && (
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {doc.medications.map((med, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-red-50 text-red-600 border-0">
                                {med}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {doc.content && (
                          <p className="text-xs text-gray-500 mt-1">{doc.content}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{doc.date}</span>
                      <div className="flex items-center gap-1">
                        {doc.type === 'Ordonnance' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleShowPharmacies(doc)}
                            className="bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg"
                          >
                            <MapPin className="w-4 h-4 mr-1" />
                            Pharmacies
                          </Button>
                        )}
                        <button 
                          onClick={() => handleViewDocument(doc)}
                          className="p-2 text-gray-400 hover:text-[#0d3d3d] hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handlePrintDocument(doc)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDocument(doc)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pharmacies" className="space-y-6 mt-6">
          {/* Selected Prescription Banner */}
          {selectedDocument && (
            <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Pill className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ordonnance — {selectedDocument.patientName}</p>
                  <p className="text-sm text-gray-500">Dr. Youssef Benali • {selectedDocument.date}</p>
                  {selectedDocument.medications && (
                    <div className="flex gap-2 mt-1">
                      {selectedDocument.medications.map((med, idx) => (
                        <Badge key={idx} className="bg-red-100 text-red-700 border-0">{med}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedDocument(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Pharmacy Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Rechercher une pharmacie..."
                className="pl-10 h-11 rounded-lg border-gray-200"
              />
            </div>
            <Select value={pharmacyCity} onValueChange={setPharmacyCity}>
              <SelectTrigger className="w-40 h-11 rounded-lg border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              {['Toutes', 'Disponible', 'Ouvertes'].map(filter => (
                <Button
                  key={filter}
                  variant={pharmacyFilter === filter ? 'default' : 'outline'}
                  onClick={() => setPharmacyFilter(filter)}
                  className={pharmacyFilter === filter ? 'bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg' : 'rounded-lg border-gray-200'}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          {/* Medication Search */}
          {selectedDocument && (
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <Pill className="w-4 h-4 text-red-500" />
                Médicament recherché :
              </span>
              <div className="flex-1 max-w-md">
                <Input
                  value={medicationSearch}
                  onChange={(e) => setMedicationSearch(e.target.value)}
                  placeholder="Ex: Amoxicilline, Ibuprofène..."
                  className="h-10 rounded-lg border-gray-200"
                />
              </div>
              {medicationSearch && (
                <Button variant="ghost" size="sm" onClick={() => setMedicationSearch('')} className="text-gray-500">
                  Effacer
                </Button>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-white rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xl font-bold">{filteredPharmacies.length}</p>
                  <p className="text-sm text-gray-500">Pharmacies</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-green-600">
                    {filteredPharmacies.filter(p => p.availability === 'Disponible').length}
                  </p>
                  <p className="text-sm text-gray-500">Disponible</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                </div>
                <div>
                  <p className="text-xl font-bold text-emerald-600">
                    {filteredPharmacies.filter(p => p.status === 'Ouverte').length}
                  </p>
                  <p className="text-sm text-gray-500">Ouvertes</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Visualization */}
          <Card className="border-0 shadow-sm bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Carte interactive — {pharmacyCity}
                </h3>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" /> Disponible & ouvert
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" /> Disponible, fermé
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" /> Non disponible
                  </span>
                </div>
              </div>
              
              {/* Simulated Map */}
              <div className="relative h-80 bg-gray-100 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-400 text-lg font-medium">{pharmacyCity}</div>
                </div>
                {/* Grid lines */}
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: '80px 80px'
                }} />
                {/* Center - Cabinet */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-16 bg-[#0d3d3d] rounded-full flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                      <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2.5-1 4-1 5.5 0 1.5.5 2.5 2 2.5s2-1 2-2.5c0-1.5 1-3 1-5.5 0-1.5-.5-2.5-1-3.5-.5-1-1-2-1-3.5 0-1.5 1-2.5 2-2.5s2 1 2 2.5c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2.5-1 4-1 5.5 0 1.5.5 2.5 2 2.5s2-1 2-2.5c0-1.5 1-3 1-5.5 0-1.5-.5-2.5-1-3.5-.5-1-1-2-1-3.5 0-2.5-2.5-5-6-5z"/>
                    </svg>
                  </div>
                  <p className="text-center text-xs font-medium mt-1">Cabinet</p>
                </div>
                {/* Pharmacy markers */}
                {filteredPharmacies.map((pharmacy) => (
                  <button
                    key={pharmacy.id}
                    onClick={() => setSelectedPharmacy(pharmacy)}
                    className="absolute w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110"
                    style={{
                      left: `${pharmacy.position.x}%`,
                      top: `${pharmacy.position.y}%`,
                      backgroundColor: pharmacy.status === 'Ouverte' ? '#10b981' : '#f59e0b',
                    }}
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                ))}
                {/* Distance circles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-dashed border-gray-300 rounded-full opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-gray-300 rounded-full opacity-30" />
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                Cliquez sur un <span className="text-emerald-500">+</span> pour voir les détails • <span className="text-[#0d3d3d]">🦷</span> = Cabinet dentaire
              </p>
            </CardContent>
          </Card>

          {/* Pharmacy List */}
          <div className="space-y-4">
            {filteredPharmacies.map((pharmacy, idx) => (
              <Card key={pharmacy.id} className={`border-0 shadow-sm bg-white rounded-xl ${selectedPharmacy?.id === pharmacy.id ? 'ring-2 ring-[#0d3d3d]' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900">{pharmacy.name}</h4>
                          {idx === 0 && (
                            <Badge className="bg-amber-100 text-amber-700 border-0">
                              La plus proche
                            </Badge>
                          )}
                          <Badge className={pharmacy.status === 'Ouverte' ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-700 border-0'}>
                            {pharmacy.status === 'Ouverte' ? 'Ouverte' : 'Fermée'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4 text-red-500" />
                          {pharmacy.address} • {pharmacy.distance} km
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-4 h-4 text-purple-500" />
                          {pharmacy.phone}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {pharmacy.medications.slice(0, 4).map((med, midx) => (
                            <span key={midx} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                              {med}
                            </span>
                          ))}
                          {pharmacy.medications.length > 4 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                              +{pharmacy.medications.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-[#0d3d3d] border-gray-200 rounded-lg">
                        <Navigation className="w-4 h-4 mr-1" />
                        Itinéraire
                      </Button>
                      <Button size="sm" variant="outline" className="text-[#0d3d3d] border-gray-200 rounded-lg">
                        <Phone className="w-4 h-4 mr-1" />
                        Appeler
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Document Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0d3d3d]">
              Nouvelle {modalType.toLowerCase()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Clinic Header */}
            <div className="p-4 border-2 border-dashed border-[#0d3d3d] rounded-xl text-center">
              <h4 className="font-bold text-[#0d3d3d]">Cabinet Dentaire Dr. Benali & Associés</h4>
              <p className="text-sm text-gray-500">123 Av. Mohammed V, Casablanca • +212 522 XXX XXX</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Patient <span className="text-red-500">*</span></Label>
              <Select 
                value={prescriptionForm.patient} 
                onValueChange={(value) => setPrescriptionForm({ ...prescriptionForm, patient: value })}
              >
                <SelectTrigger className="h-11 rounded-lg border-gray-200">
                  <SelectValue placeholder="Sélectionnez un patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={`${patient.nom} ${patient.prenom}`}>
                      {patient.nom} {patient.prenom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Date</Label>
              <Input
                type="date"
                value={prescriptionForm.date}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, date: e.target.value })}
                className="h-11 rounded-lg border-gray-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Ville du patient</Label>
              <Select 
                value={prescriptionForm.city} 
                onValueChange={(value) => setPrescriptionForm({ ...prescriptionForm, city: value })}
              >
                <SelectTrigger className="h-11 rounded-lg border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {modalType === 'Ordonnance' && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Médicaments & posologie</Label>
                  <textarea
                    value={prescriptionForm.medications}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medications: e.target.value })}
                    placeholder="Amoxicilline 1g — 3x/jour pendant 7 jours&#10;Ibuprofène 400mg — au besoin&#10;Métronidazole 500mg — 2x/jour 5 jours"
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d3d] focus:border-transparent resize-none"
                  />
                </div>
                <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    Après génération, le bouton "Pharmacies" apparaîtra sur l'ordonnance pour localiser les pharmacies qui disposent des médicaments prescrits.
                  </p>
                </div>
              </>
            )}
            
            {(modalType === 'Certificat' || modalType === 'Compte-rendu') && (
              <div className="space-y-2">
                <Label className="text-sm">Contenu du document</Label>
                <textarea
                  value={prescriptionForm.content}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, content: e.target.value })}
                  placeholder="Détails du document..."
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d3d] focus:border-transparent resize-none"
                />
              </div>
            )}
            
            {(modalType === 'Devis' || modalType === 'Facture') && (
              <div className="space-y-2">
                <Label className="text-sm">{modalType === 'Devis' ? 'Montant estimé (MAD)' : 'Montant total (MAD)'} <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  step="0.01"
                  value={prescriptionForm.amount}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="h-11 rounded-lg border-gray-200"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-sm">Notes complémentaires</Label>
              <Input placeholder="Remarques..." className="h-11 rounded-lg border-gray-200" />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveDocument}
                className="flex-1 h-11 bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg"
              >
                Générer {modalType === 'Ordonnance' ? "l'ordonnance" : `le ${modalType.toLowerCase()}`}
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
