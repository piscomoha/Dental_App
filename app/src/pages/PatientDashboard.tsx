import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Stethoscope, MapPin } from 'lucide-react';
import { rendezVousApi, ordonnanceApi, factureApi, certificatApi, devisApi, traitementApi } from '@/services/api';

export default function PatientDashboard() {
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  const [dbAppointments, setDbAppointments] = useState<any[]>([]);
  const [dbDocuments, setDbDocuments] = useState<any[]>([]);
  const [dbTreatments, setDbTreatments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.name) return;
      
      setIsLoading(true);
      try {
        // Fetch Appointments
        const aptData = await rendezVousApi.list();
        const aptList = Array.isArray(aptData) ? aptData : (aptData?.data && Array.isArray(aptData.data) ? aptData.data : []);
        setDbAppointments(aptList);

        // Fetch Documents
        const [ords, facts, certs, devs, treats] = await Promise.all([
          ordonnanceApi.list().catch(() => []),
          factureApi.list().catch(() => []),
          certificatApi.list().catch(() => []),
          devisApi.list().catch(() => []),
          traitementApi.list().catch(() => [])
        ]);

        const safeMap = (arr: any) => Array.isArray(arr) ? arr : (arr?.data && Array.isArray(arr.data) ? arr.data : []);

        const mappedOrd = safeMap(ords).map((ord: any) => ({
          type: 'Ordonnance',
          patientName: ord.consultation?.rendez_vous?.patient?.nom || '',
          date: ord.date_ordonnance,
        }));

        const mappedFact = safeMap(facts).map((f: any) => ({
          type: 'Facture',
          patientName: f.consultation?.rendez_vous?.patient?.nom || '',
          date: f.date_facture,
        }));

        const mappedCert = safeMap(certs).map((c: any) => ({
          type: 'Certificat',
          patientName: c.patient_name || '',
          date: c.date_certificat,
        }));

        const mappedDev = safeMap(devs).map((d: any) => ({
          type: 'Devis',
          patientName: d.consultation?.rendez_vous?.patient?.nom || '',
          date: d.date_devis,
        }));
        
        const mappedTreatments = safeMap(treats).map((t: any) => ({
          id: String(t.id),
          type: t.nom_traitement || 'Soin dentaire',
          patientName: t.patient?.nom ? `${t.patient.nom} ${t.patient.prenom}` : (t.consultation?.rendez_vous?.patient?.nom || ''),
          date: t.created_at ? t.created_at.split('T')[0] : '',
        }));

        setDbDocuments([...mappedOrd, ...mappedFact, ...mappedCert, ...mappedDev]);
        setDbTreatments(mappedTreatments);
      } catch (e) {
        console.error("Failed to fetch patient data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);

  // View data calculation
  const currentPatientName = currentUser?.name || '';
  
  const allAppointments = dbAppointments.map(apt => ({
    id: String(apt.id),
    patientName: apt.patient?.nom || '',
    date: apt.date_rendez_vous,
    time: apt.heure_rendez_vous ? apt.heure_rendez_vous.substring(0, 5) : '00:00',
    type: apt.type_consultation || 'Consultation',
    status: apt.statut === 'planifié' ? 'Confirmé' : apt.statut === 'annulé' ? 'Annulé' : 'Terminé',
    doctor: apt.dentiste?.nom ? `Dr. ${apt.dentiste.nom}` : 'Dr. Youssef Benali',
  }));

  const upcomingAppointments = allAppointments.filter(
    (apt) => apt.patientName.toLowerCase() === currentPatientName.toLowerCase() && apt.status !== 'Annulé'
  ).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  const patientTreatments = dbTreatments.filter(
    (t) => t.patientName.toLowerCase().includes(currentPatientName.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const patientDocuments = dbDocuments.filter(
    (d) => d.patientName.toLowerCase() === currentPatientName.toLowerCase()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c4a35a]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-10 slide-in-from-right-4 duration-300">
      <div>
        <h1 className="text-3xl font-bold text-[#0d3d3d]">Espace Patient</h1>
        <p className="text-gray-500">
          Visualisez vos rendez-vous, soins et documents du cabinet.
        </p>
      </div>

      <Card className="border-0 shadow-sm bg-white rounded-xl">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              Bienvenue
            </p>
            <p className="text-2xl font-bold text-gray-900">{currentPatientName}</p>
            <p className="text-xs text-gray-500 mt-1">
              Merci de votre confiance — Cabinet Dentaire
            </p>
          </div>
          <div className="w-12 h-12 bg-[#0d3d3d] rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold">
              {currentPatientName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Prochain rendez-vous
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {upcomingAppointments[0]?.date || '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {upcomingAppointments[0]?.time || 'Aucun rendez-vous planifié'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Dernier soin
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {patientTreatments.length > 0 ? patientTreatments[0].type : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {patientTreatments.length > 0 ? patientTreatments[0].date : 'Aucun soin enregistré'}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Documents
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {patientDocuments.length.toString().padStart(2, '0')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Ordonnances & certificats</p>
            </div>
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-rose-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Mes rendez-vous
              </h2>
            </div>
            <div className="space-y-4 mt-6">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-gray-100">
                        <span className="text-xs font-medium text-gray-500">
                          {new Date(apt.date).toLocaleDateString('fr-FR', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-[#0d3d3d]">
                          {new Date(apt.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{apt.type}</p>
                        <p className="text-sm text-gray-500">
                          {apt.time} • {apt.doctor || 'Dr. Youssef Benali'}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-50 text-blue-700 border-0">Confirmé</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucun rendez-vous à venir</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                Mes documents
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-gray-200 text-[#0d3d3d]"
              >
                Télécharger tous
              </Button>
            </div>
            <div className="space-y-3">
              {patientDocuments.length > 0 ? (
                patientDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{doc.type}</p>
                      <p className="text-sm text-gray-500">{doc.date}</p>
                    </div>
                    <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-0">
                      PDF
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Aucun document pour le moment.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm bg-white rounded-xl">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Coordonnées du cabinet</p>
              <p className="text-sm text-gray-500">
                123 Av. Mohammed V, Casablanca • +212 522 XXX XXX
              </p>
            </div>
          </div>
          <Button className="bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg">
            Voir les pharmacies proches
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

