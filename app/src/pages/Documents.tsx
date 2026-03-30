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
import { ordonnanceApi, factureApi, certificatApi, devisApi, patientApi, rendezVousApi, type BackendPatient } from '@/services/api';
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
import { pharmacies, cities, documents as mockDocuments } from '@/data/mockData';
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
  const [patientSearch, setPatientSearch] = useState('');

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
    patientId: '',
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
      const mappedOrd = safeMap(ords).map((ord: any) => {
        const rdv = ord.consultation?.rendez_vous || ord.consultation?.rendezVous;
        return {
          id: String(ord.id),
          type: 'Ordonnance' as const,
          patientName: rdv?.patient?.nom 
            ? `${rdv.patient.nom} ${rdv.patient.prenom || ''}`.trim()
            : (ord.patient_name || 'Patient inconnu'),
          doctorName: rdv?.dentiste?.nom ? `Dr. ${rdv.dentiste.nom}` : 'Dr. Youssef Benali',
          date: ord.date_ordonnance,
          medications: ord.medicaments ? String(ord.medicaments).split('\n') : [],
        };
      });

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
      const mappedDev = safeMap(devs).map((d: any) => {
        const rdv = d.consultation?.rendez_vous || d.consultation?.rendezVous;
        return {
          id: String(d.id),
          type: 'Devis' as const,
          patientName: rdv?.patient?.nom 
            ? `${rdv.patient.nom} ${rdv.patient.prenom || ''}`.trim() 
            : (d.consultation_id ? `Consultation #${d.consultation_id}` : 'Patient'),
          doctorName: 'Dr. Youssef Benali',
          date: d.date_devis,
          content: `${(d.description || '').trim()} • Montant estimé: ${Number(d.montant_estime || 0).toFixed(2)} MAD`,
        };
      });

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
      
      const finalDocs = filteredForUser.length > 0 ? filteredForUser : mockDocuments;
      setDocumentsList(finalDocs);
    } catch (err) {
      console.error("API error, falling back to mock documents:", err);
      // Fallback to mock data on error
      setDocumentsList(mockDocuments);
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
    setPatientSearch('');
    setPrescriptionForm({
      patient: '',
      patientId: '',
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
      let consultationId: number | null = null;
      
      // Attempt to find the most recent consultation for this patient
      if (prescriptionForm.patientId) {
        try {
          const appointments = await rendezVousApi.list();
          // Find the most recent appointment for this patient that has a consultation
          const patientApps = appointments
            .filter((a: any) => String(a.patient_id) === String(prescriptionForm.patientId))
            .sort((a: any, b: any) => new Date(b.date_rdv).getTime() - new Date(a.date_rdv).getTime());
          
          const latestWithConsultation = patientApps.find((a: any) => a.consultation?.id);
          if (latestWithConsultation) {
            consultationId = latestWithConsultation.consultation!.id;
          }
        } catch (e) {
          console.error("Could not find latest consultation:", e);
        }
      }

      let createdDoc: Document | null = null;
      if (modalType === 'Ordonnance') {
        const meds = prescriptionForm.medications.trim() || "Amoxicilline 1g — 3x/jour pendant 7 jours\nIbuprofène 400mg — au besoin\nMétronidazole 500mg — 2x/jour 5 jours";
        const created = await ordonnanceApi.create({
          date_ordonnance: prescriptionForm.date,
          medicaments: meds,
          instructions: prescriptionForm.notes || '',
          consultation_id: consultationId,
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
          consultation_id: consultationId,
        });
        createdDoc = {
          id: String(created.id),
          type: 'Facture',
          patientName: prescriptionForm.patient || 'Patient',
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
          consultation_id: consultationId,
        });
        createdDoc = {
          id: String(created.id),
          type: 'Devis',
          patientName: prescriptionForm.patient || 'Patient',
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
          consultation_id: consultationId,
        });
        createdDoc = {
          id: String(created.id),
          type: 'Certificat',
          patientName: created.patient_name || prescriptionForm.patient || 'Patient',
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const logoUrl = `/assets/logo-cabinet.png`; // Relative to public folder

    printWindow.document.write(`
      <html>
        <head>
          <title>Impression - ${doc.type}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 50px; 
              color: #1a202c;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #0d3d3d;
              padding-bottom: 20px;
              margin-bottom: 40px;
            }
            .cabinet-info h1 { margin: 0; color: #0d3d3d; font-size: 24px; }
            .cabinet-info p { margin: 2px 0; color: #4a5568; font-size: 14px; }
            .logo { width: 80px; height: 80px; object-fit: contain; }
            
            .doc-title {
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 2px;
              font-size: 28px;
              margin-bottom: 40px;
              color: #2d3748;
              font-weight: 700;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .info-block h3 { 
              font-size: 12px; 
              text-transform: uppercase; 
              color: #718096; 
              margin-bottom: 8px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
            }
            .info-block p { margin: 4px 0; font-weight: 500; }
            
            .main-content {
              min-height: 300px;
              border: 1px solid #edf2f7;
              border-radius: 12px;
              padding: 30px;
              background-color: #f7fafc;
            }
            
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #4a5568; font-size: 13px; }
            td { padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; }
            
            .footer {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .signature {
              text-align: center;
              width: 200px;
            }
            .signature-line {
              border-top: 1px solid #cbd5e0;
              margin-top: 60px;
              padding-top: 8px;
              font-size: 12px;
              color: #718096;
            }
            
            @media print {
              body { padding: 20px; }
              .main-content { background-color: transparent; border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="cabinet-info">
              <h1>CABINET DENTAIRE PREMIUM</h1>
              <p>Dr. Youssef Benali • Dentiste Généraliste</p>
              <p>123 Avenue Mohamed V, Casablanca</p>
              <p>Tél: 05 22 12 34 56 | contact@dental-premium.ma</p>
            </div>
            <img src="${logoUrl}" class="logo" alt="Logo Cabinet" />
          </div>

          <div class="doc-title">${doc.type}</div>

          <div class="info-grid">
            <div class="info-block">
              <h3>Patient</h3>
              <p><strong>Nom:</strong> ${doc.patientName}</p>
              <p><strong>N° Dossier:</strong> #PAT-${doc.id.padStart(4, '0')}</p>
            </div>
            <div class="info-block">
              <h3>Détails</h3>
              <p><strong>Date:</strong> ${new Date(doc.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p><strong>Lieu:</strong> Casablanca, Maroc</p>
            </div>
          </div>

          <div class="main-content">
            ${doc.content ? `
              <div style="font-size: 16px; color: #2d3748; white-space: pre-wrap;">
                ${doc.content}
              </div>
            ` : ''}
            
            ${doc.medications && doc.medications.length > 0 ? `
              <h3>Prescriptions Médicales:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Médicament</th>
                    <th>Posologie & Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  ${doc.medications.map(m => {
                    const [name, dosage] = m.split(' — ');
                    return `
                      <tr>
                        <td><strong>${name}</strong></td>
                        <td>${dosage || 'Selon prescription médicale'}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : ''}
          </div>

          <div class="footer">
            <div style="font-size: 10px; color: #a0aec0; max-width: 300px;">
              Ce document est généré électroniquement et reste la propriété du Cabinet Dentaire Premium. Toute falsification est passible de poursuites.
            </div>
            <div class="signature">
              <p>Cachet et Signature</p>
              <div class="signature-line">Dr. Youssef Benali</div>
            </div>
          </div>

          <script>
            window.onload = () => { 
              setTimeout(() => {
                window.print(); 
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadDocument = (doc: Document) => {
    const logoUrl = `http://localhost:5173/assets/logo-cabinet.png`; // Absolute URL for the downloaded HTML to find the logo if opened locally
    
    const htmlContent = `
      <html>
        <head>
          <title>${doc.type} - ${doc.patientName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a202c; line-height: 1.5; background-color: #f7fafc; }
            .page { background: white; max-width: 800px; margin: 0 auto; padding: 50px; border-radius: 20px; shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0d3d3d; padding-bottom: 20px; margin-bottom: 30px; }
            .cabinet-info h1 { margin: 0; color: #0d3d3d; font-size: 22px; }
            .cabinet-info p { margin: 2px 0; color: #4a5568; font-size: 13px; }
            .logo { width: 70px; height: 70px; object-fit: contain; }
            .doc-title { text-align: center; text-transform: uppercase; letter-spacing: 2px; font-size: 24px; margin: 30px 0; color: #2d3748; font-weight: 700; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .info-block h3 { font-size: 11px; text-transform: uppercase; color: #718096; margin-bottom: 5px; border-bottom: 1px solid #e2e8f0; }
            .info-block p { margin: 3px 0; font-size: 14px; font-weight: 500; }
            .main-content { min-height: 200px; padding: 20px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #edf2f7; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; color: #4a5568; font-size: 12px; }
            td { padding: 10px; border-bottom: 1px solid #edf2f7; font-size: 13px; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; }
            .signature { text-align: center; width: 180px; }
            .signature-line { border-top: 1px solid #cbd5e0; margin-top: 50px; padding-top: 5px; font-size: 11px; color: #718096; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div class="cabinet-info">
                <h1>CABINET DENTAIRE PREMIUM</h1>
                <p>Dr. Youssef Benali • Dentiste Généraliste</p>
                <p>123 Avenue Mohamed V, Casablanca</p>
                <p>Tél: 05 22 12 34 56</p>
              </div>
              <img src="${logoUrl}" class="logo" />
            </div>
            <div class="doc-title">${doc.type}</div>
            <div class="info-grid">
              <div class="info-block">
                <h3>Patient</h3>
                <p><strong>Nom:</strong> ${doc.patientName}</p>
              </div>
              <div class="info-block">
                <h3>Date</h3>
                <p>${new Date(doc.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div class="main-content">
              ${doc.content ? `<div style="white-space: pre-wrap;">${doc.content}</div>` : ''}
              ${doc.medications && doc.medications.length > 0 ? `
                <table>
                  <thead><tr><th>Médicament</th><th>Instructions</th></tr></thead>
                  <tbody>${doc.medications.map(m => `<tr><td><strong>${m.split(' — ')[0]}</strong></td><td>${m.split(' — ')[1] || '-'}</td></tr>`).join('')}</tbody>
                </table>
              ` : ''}
            </div>
            <div class="footer">
              <div style="font-size: 9px; color: #a0aec0;">Document généré par DentalApp</div>
              <div class="signature"><div class="signature-line">Signature du Praticien</div></div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${doc.type}_${doc.patientName.replace(/\s+/g, '_')}.html`;
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
      {/* Header with Logo */}
      <div className="flex items-center justify-between bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0d3d3d] to-teal-600 bg-clip-text text-transparent">
            Documents & Pharmacies
          </h1>
          <p className="text-gray-500 font-medium">Ordonnances, certificats et localisation des pharmacies</p>
        </div>
        <div className="hidden md:block">
          <img src="/assets/logo-cabinet.png" alt="Cabinet Logo" className="h-16 w-auto object-contain opacity-90" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-xl p-1.5 shadow-sm">
          <TabsTrigger value="documents" className="data-[state=active]:bg-[#0d3d3d] data-[state=active]:text-white rounded-lg px-8 py-2.5 transition-all">
            <FileText className="w-4 h-4 mr-2" />
            Documents Professionnels
          </TabsTrigger>
          <TabsTrigger value="pharmacies" className="data-[state=active]:bg-[#0d3d3d] data-[state=active]:text-white rounded-lg px-8 py-2.5 transition-all">
            <MapPin className="w-4 h-4 mr-2" />
            Réseau Pharmacies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6 mt-6">
          {/* Create Document Buttons - Hidden for Patients */}
          {currentUser?.role !== 'Patient' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-[0.1em] ml-1">Creation Rapide</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {documentTypes.map((docType) => {
                  const Icon = docType.icon;
                  return (
                    <button
                      key={docType.type}
                      onClick={() => handleCreateDocument(docType.type)}
                      className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 bg-white hover:border-[#0d3d3d] hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 overflow-hidden`}
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-50 to-transparent -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-500" />
                      
                      <div className={`w-14 h-14 ${docType.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-black/5`}>
                        <Icon className={`w-7 h-7 ${docType.color}`} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0d3d3d] transition-colors">{docType.type}</span>
                      
                      <div className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4 text-[#0d3d3d]" />
                      </div>
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
                  <div key={`${doc.type}:${doc.id}`} className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-teal-100 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {getDocumentIcon(doc.type)}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border border-gray-100 flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        </div>
                      </div>
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
              <h4 className="font-bold text-[#0d3d3d]">Cabinet Dentaire</h4>
              <p className="text-sm text-gray-500">123 Av. Mohammed V, Casablanca • +212 522 XXX XXX</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Rechercher un Patient</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tapez le nom du patient..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-10 h-10 rounded-lg border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Sélection du Patient <span className="text-red-500">*</span></Label>
                <Select 
                  value={prescriptionForm.patient} 
                  onValueChange={(value) => {
                    const selectedPatient = patients.find(p => `${p.nom} ${p.prenom}` === value);
                    setPrescriptionForm({ 
                      ...prescriptionForm, 
                      patient: value,
                      patientId: selectedPatient ? String(selectedPatient.id) : '',
                      city: selectedPatient?.ville || prescriptionForm.city,
                    });
                  }}
                >
                  <SelectTrigger className="h-11 rounded-lg border-gray-200">
                    <SelectValue placeholder={patients.length > 0 ? "Sélectionnez un patient" : "Chargement..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients
                      .filter(p => 
                        !patientSearch || 
                        `${p.nom} ${p.prenom}`.toLowerCase().includes(patientSearch.toLowerCase())
                      )
                      .slice(0, 10) // Limit to 10 for performance
                      .map(patient => (
                        <SelectItem key={patient.id} value={`${patient.nom} ${patient.prenom}`}>
                          {patient.nom} {patient.prenom}
                        </SelectItem>
                      ))}
                    {patients.filter(p => `${p.nom} ${p.prenom}`.toLowerCase().includes(patientSearch.toLowerCase())).length === 0 && (
                      <div className="p-2 text-center text-sm text-gray-500">Aucun patient trouvé</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
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
