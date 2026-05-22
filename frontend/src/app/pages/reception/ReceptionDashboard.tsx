import { Activity, Calendar, ClipboardList, Clock, UserPlus, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { apiClient } from '../../../services/api-client';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

type ReportKey = 'pacientes' | 'citas' | 'citasHoy' | 'citasPendientes';
type DashboardRow = Record<string, string | number | boolean | null | undefined>;
type DashboardActivity = {
  id: string;
  type: 'patient' | 'appointment';
  title: string;
  message: string;
  created_at?: string;
};

type ReceptionDashboardData = {
  stats: Record<ReportKey, number> & { citasRegistradas: number };
  reports: Record<ReportKey, DashboardRow[]>;
  recentActivity: DashboardActivity[];
};

const reportLabels: Record<ReportKey, string> = {
  pacientes: 'Pacientes registrados',
  citas: 'Citas registradas',
  citasHoy: 'Citas de hoy',
  citasPendientes: 'Citas pendientes',
};

const formatDate = (value?: string | number | boolean | null) => {
  if (!value) return 'Sin fecha';
  return new Date(String(value)).toLocaleString('es-ES');
};

export default function ReceptionDashboard() {
  const [dashboard, setDashboard] = useState<ReceptionDashboardData | null>(null);
  const [activeReport, setActiveReport] = useState<ReportKey>('pacientes');

  useEffect(() => {
    apiClient
      .get('/reception/dashboard')
      .then((response) => setDashboard(response.data.data))
      .catch((error) => console.error('No se pudo cargar dashboard recepción:', error));
  }, []);

  const stats = [
    {
      key: 'pacientes' as const,
      label: 'Pacientes',
      value: dashboard?.stats.pacientes ?? 0,
      icon: Users,
      color: 'text-cyan-600',
    },
    {
      key: 'citas' as const,
      label: 'Citas registradas',
      value: dashboard?.stats.citasRegistradas ?? 0,
      icon: ClipboardList,
      color: 'text-emerald-600',
    },
    {
      key: 'citasHoy' as const,
      label: 'Citas hoy',
      value: dashboard?.stats.citasHoy ?? 0,
      icon: Calendar,
      color: 'text-amber-600',
    },
    {
      key: 'citasPendientes' as const,
      label: 'Pendientes',
      value: dashboard?.stats.citasPendientes ?? 0,
      icon: Clock,
      color: 'text-indigo-600',
    },
  ];

  const selectedRows = useMemo(
    () => dashboard?.reports[activeReport] || [],
    [activeReport, dashboard]
  );

  const renderRow = (row: DashboardRow) => {
    if (activeReport === 'pacientes') {
      return (
        <>
          <p className="font-medium text-slate-900">{row.nombre_completo || row.nombre_apellido}</p>
          <p className="text-sm text-slate-600">CI: {row.ci || row.dni_nie || 'Sin CI'}</p>
          <p className="text-xs text-slate-500">{row.email || row.telefono || 'Sin contacto'}</p>
        </>
      );
    }

    return (
      <>
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900">{row.especialidad || 'Cita médica'}</p>
          <Badge variant="secondary">{row.estado}</Badge>
        </div>
        <p className="text-sm text-slate-600">
          Paciente {row.paciente_id} · Médico {row.medico_id}
        </p>
        <p className="text-xs text-slate-500">
          {row.fecha} · {row.hora} hrs
        </p>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Panel de Recepción</h2>
        <p className="text-gray-600">Seguimiento de pacientes y movimientos recientes</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = activeReport === stat.key;

          return (
            <button
              type="button"
              key={stat.key}
              onClick={() => setActiveReport(stat.key)}
              className={`rounded-lg border bg-white p-5 text-left shadow-sm transition hover:border-cyan-300 hover:shadow-md ${
                isActive ? 'border-cyan-500 ring-2 ring-cyan-100' : 'border-slate-200'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <Icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-xs font-medium text-slate-500">Ver detalle</span>
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>Operación diaria de recepción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/reception/register-patient">
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Registrar paciente
              </Button>
            </Link>
            <Link to="/reception/book-appointment">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar cita
              </Button>
            </Link>
            <Link to="/reception/appointments">
              <Button className="w-full justify-start" variant="outline">
                <ClipboardList className="mr-2 h-4 w-4" />
                Consultar citas
              </Button>
            </Link>
            <Link to="/reception/inbox">
              <Button className="w-full justify-start" variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                Bandeja de entrada
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{reportLabels[activeReport]}</CardTitle>
            <CardDescription>
              Último movimiento y registros disponibles para recepción.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {selectedRows.map((row, index) => (
                <div key={String(row.id || index)} className="rounded-lg border border-slate-200 p-4">
                  {renderRow(row)}
                  <p className="mt-2 text-xs text-slate-400">
                    Movimiento: {formatDate(row.created_at)}
                  </p>
                </div>
              ))}
              {selectedRows.length === 0 && (
                <p className="text-sm text-slate-500">No hay registros para mostrar.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription>
            {dashboard?.recentActivity.length || 0} movimientos recientes de pacientes y citas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {(dashboard?.recentActivity || []).map((activity) => {
              const Icon = activity.type === 'patient' ? Users : Calendar;

              return (
                <div
                  key={activity.id}
                  className="rounded-lg border border-cyan-100 bg-cyan-50/60 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 text-cyan-700" />
                    <div>
                      <p className="font-medium text-slate-900">{activity.title}</p>
                      <p className="text-sm text-slate-700">{activity.message}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!dashboard?.recentActivity || dashboard.recentActivity.length === 0) && (
              <p className="text-sm text-slate-500">Aún no hay actividad registrada.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
