import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Calendar,
  DollarSign,
  Stethoscope,
  CalendarPlus,
  UserPlus,
  FilePlus,
  Receipt
} from 'lucide-react';
import { patientApi, rendezVousApi, traitementApi } from '@/services/api';
import { useDataSync } from '@/context/DataSyncContext';
import type { Appointment } from '@/types';

type Stat = {
  label: string;
  value: string;
  change: string;
  icon: typeof Users;
  iconBg: string;
  iconColor: string;
};


const quickActions = [
  { label: 'Nouveau RDV', icon: CalendarPlus, color: 'text-blue-600', bgColor: 'bg-blue-50', path: '/rendez-vous' },
  { label: 'Nouveau Patient', icon: UserPlus, color: 'text-purple-600', bgColor: 'bg-purple-50', path: '/patients' },
  { label: 'Nouveau Soin', icon: FilePlus, color: 'text-teal-600', bgColor: 'bg-teal-50', path: '/soins' },
  { label: 'Nouvelle Facture', icon: Receipt, color: 'text-amber-600', bgColor: 'bg-amber-50', path: '/documents' },
];

export default function Dashboard() {
  const { subscribeToChanges } = useDataSync();
  const [isLoading, setIsLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState('');
  const [dashboardStats, setDashboardStats] = useState<Stat[]>([]);
  const [treatmentCount, setTreatmentCount] = useState(0);

  useEffect(() => {
    const loadDashboard = async (silent = false) => {
      if (!silent) setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];

      let patientCount = 0;
      try {
        const patients = await patientApi.list();
        patientCount = patients ? patients.length : 0;
      } catch { void 0; }

      let allAppointments: Appointment[] = [];
      try {
        const backendRdvs = await rendezVousApi.list();
        if (backendRdvs) {
          allAppointments = backendRdvs.map(rdv => ({
            id: String(rdv.id),
            patientId: String(rdv.patient_id || ''),
            patientName: rdv.patient ? `${rdv.patient.nom} ${rdv.patient.prenom}`.trim() : 'Patient inconnu',
            patientPhone: rdv.patient?.telephone || '',
            date: rdv.date_rdv,
            time: rdv.heure_rdv,
            treatment: rdv.consultation?.traitements?.[0]?.nom_traitement || 'Consultation',
            status: (rdv.statut || 'En attente') as Appointment['status'],
            doctor: rdv.dentiste ? `Dr. ${rdv.dentiste.nom}` : 'Dr. Non assigné',
          }));
        }
      } catch { void 0; }

      let treatments = 0;
      try {
        const backendTreatments = await traitementApi.list();
        treatments = backendTreatments ? backendTreatments.length : 0;
      } catch { void 0; }

      const todaysAppts = allAppointments.filter(apt => apt.date === today);
      setTodayAppointments(todaysAppts);
      setTreatmentCount(treatments);

      const date = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      setCurrentDate(date.toLocaleDateString('fr-FR', options));

      setDashboardStats([
        {
          label: 'PATIENTS',
          value: patientCount.toString(),
          change: '',
          icon: Users,
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600'
        },
        {
          label: "RDV AUJOURD'HUI",
          value: todaysAppts.length.toString(),
          change: `${todaysAppts.filter(a => a.status === 'Confirmé').length} confirmés`,
          icon: Calendar,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        },
        {
          label: 'TOTAL RDV',
          value: allAppointments.length.toString(),
          change: '',
          icon: DollarSign,
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600'
        },
        {
          label: 'SOINS EN COURS',
          value: treatments.toString(),
          change: '',
          icon: Stethoscope,
          iconBg: 'bg-teal-100',
          iconColor: 'text-teal-600'
        },
      ]);

      if (!silent) setIsLoading(false);
    };

    loadDashboard(false);
    
    // Subscribe to real-time data changes
    const unsubscribe = subscribeToChanges((changeType) => {
      if (changeType === 'all' || changeType === 'patient' || changeType === 'treatment' || changeType === 'appointment') {
        loadDashboard(true);
      }
    });

    // Fallback: Still check every 30 seconds for any changes
    const intervalId = setInterval(() => loadDashboard(true), 30000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [subscribeToChanges]);

  if (isLoading) {
    return <LoadingOverlay message="Chargement du tableau de bord..." fullScreen={false} />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmé':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-medium">Confirmé</Badge>;
      case 'En attente':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-medium">En attente</Badge>;
      case 'Annulé':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 font-medium">Annulé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-10 slide-in-from-right-4 duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0d3d3d]">Tableau de bord</h1>
        <p className="text-gray-500 capitalize">{currentDate}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border border-white/40 shadow-xl shadow-[#0d3d3d]/5 bg-white/70 backdrop-blur-md rounded-2xl hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.change && (
                      <p className="text-xs text-green-600 mt-1 font-medium">{stat.change}</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Appointments */}
      <Card className="border border-white/40 shadow-xl shadow-[#0d3d3d]/5 bg-white/70 backdrop-blur-md rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Rendez-vous du jour</h2>
            <Link to="/rendez-vous">
              <Button variant="ghost" className="text-[#0d3d3d] hover:text-[#1a4d4d] hover:bg-[#0d3d3d]/5 font-medium">
                Voir tous →
              </Button>
            </Link>
          </div>

          {todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[50px]">
                      <p className="text-sm font-semibold text-gray-900">{appointment.time}</p>
                    </div>
                    <Avatar className="w-10 h-10 bg-[#0d3d3d]">
                      <AvatarFallback className="bg-[#0d3d3d] text-white text-sm font-medium">
                        {appointment.patientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500">{appointment.treatment}</p>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun rendez-vous aujourd'hui</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Access */}
      <Card className="border border-white/40 shadow-xl shadow-[#0d3d3d]/5 bg-white/70 backdrop-blur-md rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Accès rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link to={action.path} key={index}>
                  <button
                    className="w-full h-full flex flex-col items-center gap-3 p-6 rounded-2xl border border-transparent shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-white to-gray-50 hover:border-[#0d3d3d]/20 hover:shadow-[#0d3d3d]/10 transition-all duration-300 group"
                  >
                    <div className={`w-14 h-14 ${action.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-7 h-7 ${action.color}`} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0d3d3d] transition-colors">{action.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
