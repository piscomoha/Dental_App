import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, PhoneCall, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { rendezVousApi } from '@/services/api';
import { appointments as mockAppointments } from '@/data/mockData';

export default function SecretaryDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    appointmentsTotal: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const backendRdvs = await rendezVousApi.list();
        const data = (backendRdvs && backendRdvs.length > 0) ? backendRdvs : mockAppointments;
        const today = new Date().toISOString().split('T')[0];
        const todaysAppts = data.filter((rdv: any) => (rdv.date_rdv || rdv.date) === today);

        setStats({
          appointmentsToday: todaysAppts.length,
          appointmentsTotal: data.length,
        });
      } catch (e) {
        console.error("API error, using mock data for stats:", e);
        const today = new Date().toISOString().split('T')[0];
        const todaysAppts = mockAppointments.filter(a => a.date === today);
        setStats({
          appointmentsToday: todaysAppts.length,
          appointmentsTotal: mockAppointments.length,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return <LoadingOverlay message="Connexion à la base de données..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in-10 slide-in-from-right-4 duration-300">
      <div>
        <h1 className="text-3xl font-bold text-[#0d3d3d]">Espace Secrétariat</h1>
        <p className="text-gray-500">
          Gestion quotidienne des rendez-vous, patients et documents du cabinet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-white/40 shadow-xl shadow-[#0d3d3d]/5 bg-white/70 backdrop-blur-md rounded-2xl hover:-translate-y-1 transition-transform duration-300">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                File d&apos;appels
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.appointmentsToday} aujourd&apos;hui</p>
              <p className="text-xs text-green-600 mt-1 font-medium">
                Gardez le planning à jour
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <PhoneCall className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/40 shadow-xl shadow-[#0d3d3d]/5 bg-white/70 backdrop-blur-md rounded-2xl hover:-translate-y-1 transition-transform duration-300">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Rendez-vous
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.appointmentsTotal} RDV</p>
              <p className="text-xs text-amber-600 mt-1 font-medium">
                Confirmations & rappels patients
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-white/40 shadow-xl shadow-[#0d3d3d]/5 bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
            <Badge className="bg-[#0d3d3d] text-white border-0">Secrétaire</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/rendez-vous">
              <button className="w-full h-full flex items-start gap-4 p-5 rounded-2xl border border-transparent shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-white to-gray-50 hover:border-blue-200 hover:shadow-blue-500/10 transition-all duration-300 group">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left mt-1">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Gérer les rendez-vous</p>
                  <p className="text-xs text-gray-500">Planifier, confirmer, annuler</p>
                </div>
              </button>
            </Link>

            <Link to="/patients">
              <button className="w-full h-full flex items-start gap-4 p-5 rounded-2xl border border-transparent shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-white to-gray-50 hover:border-emerald-200 hover:shadow-emerald-500/10 transition-all duration-300 group">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-left mt-1">
                  <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">Gérer les patients</p>
                  <p className="text-xs text-gray-500">Créer, modifier, mettre à jour</p>
                </div>
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-white/40 shadow-xl shadow-[#0d3d3d]/5 bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#0d3d3d]"></div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#0d3d3d]" />
              Rappels importants
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Confirmer les rendez-vous du lendemain par téléphone.</li>
            <li>• Mettre à jour les coordonnées des nouveaux patients.</li>
            <li>• Vérifier les documents à remettre aux patients sortants.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
