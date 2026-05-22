import {
  Activity,
  Building2,
  Calendar,
  ClipboardList,
  Stethoscope,
  UserCog,
  Users,
} from 'lucide-react';
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

type ReportKey = 'pacientes' | 'medicos' | 'clinicas' | 'citasHoy' | 'usuarios';

type DashboardActivity = {
  id: string;
  type: 'patient' | 'doctor' | 'clinic' | 'user' | 'appointment' | 'history';
  title: string;
  message: string;
  created_at?: string;
};

type DashboardRow = Record<string, string | number | boolean | null | undefined>;

type AdminDashboardData = {
  stats: Record<ReportKey, number>;
  reports: Record<ReportKey | 'citas', DashboardRow[]>;
  recentActivity: DashboardActivity[];
};

const reportLabels: Record<ReportKey, string> = {
  pacientes: 'Pacientes',
  medicos: 'Médicos activos',
  clinicas: 'Clínicas',
  citasHoy: 'Citas de hoy',
  usuarios: 'Usuarios',
};

const formatDate = (value?: string | number | boolean | null) => {
  if (!value) return 'Sin fecha';
  return new Date(String(value)).toLocaleString('es-ES');
};

const activityIcon = {
  patient: Users,
  doctor: Stethoscope,
  clinic: Building2,
  user: UserCog,
  appointment: Calendar,
  history: ClipboardList,
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [activeReport, setActiveReport] = useState<ReportKey>('pacientes');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  useEffect(() => {
    apiClient
      .get('/admin/dashboard')
      .then((response) => setDashboard(response.data.data))
      .catch((error) => console.error('No se pudo cargar dashboard admin:', error));
  }, []);

  const stats = [
    {
      key: 'pacientes' as const,
      label: 'Total Pacientes',
      value: dashboard?.stats.pacientes ?? 0,
      icon: Users,
      color: 'text-cyan-600',
    },
    {
      key: 'medicos' as const,
      label: 'Médicos Activos',
      value: dashboard?.stats.medicos ?? 0,
      icon: Stethoscope,
      color: 'text-emerald-600',
    },
    {
      key: 'clinicas' as const,
      label: 'Clínicas',
      value: dashboard?.stats.clinicas ?? 0,
      icon: Building2,
      color: 'text-teal-600',
    },
    {
      key: 'citasHoy' as const,
      label: 'Citas Hoy',
      value: dashboard?.stats.citasHoy ?? 0,
      icon: Calendar,
      color: 'text-amber-600',
    },
    {
      key: 'usuarios' as const,
      label: 'Usuarios',
      value: dashboard?.stats.usuarios ?? 0,
      icon: UserCog,
      color: 'text-indigo-600',
    },
  ];

  const selectedRows = useMemo(() => {
    const rows = dashboard?.reports[activeReport] || [];

    if (activeReport !== 'usuarios' || userRoleFilter === 'all') return rows;

    return rows.filter((row) => row.rol === userRoleFilter);
  }, [activeReport, dashboard, userRoleFilter]);

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

    if (activeReport === 'medicos') {
      return (
        <>
          <p className="font-medium text-slate-900">{row.nombre_completo}</p>
          <p className="text-sm text-slate-600">{row.especialidad || 'Sin especialidad'}</p>
          <p className="text-xs text-slate-500">Licencia: {row.licencia_medica || 'No registrada'}</p>
        </>
      );
    }

    if (activeReport === 'clinicas') {
      return (
        <>
          <p className="font-medium text-slate-900">{row.nombre}</p>
          <p className="text-sm text-slate-600">{row.ciudad || 'Ciudad no registrada'}</p>
          <p className="text-xs text-slate-500">{row.email || row.telefono || 'Sin contacto'}</p>
        </>
      );
    }

    if (activeReport === 'usuarios') {
      return (
        <>
          <p className="font-medium text-slate-900">{row.nombre_completo}</p>
          <p className="text-sm text-slate-600">{row.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary">{row.rol}</Badge>
            <Badge className={row.activo ? 'bg-emerald-600' : ''} variant={row.activo ? 'default' : 'secondary'}>
              {row.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </>
      );
    }

    return (
      <>
        <p className="font-medium text-slate-900">{row.especialidad}</p>
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
        <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
        <p className="text-gray-600">Vista general de Clinic Pro</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
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
                <span className="text-xs font-medium text-slate-500">Ver reporte</span>
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
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Operaciones frecuentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin/register-patient">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Registrar Paciente
              </Button>
            </Link>
            <Link to="/admin/register-doctor">
              <Button className="w-full justify-start" variant="outline">
                <Stethoscope className="mr-2 h-4 w-4" />
                Registrar Médico
              </Button>
            </Link>
            <Link to="/admin/register-clinic">
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Registrar Clínica
              </Button>
            </Link>
            <Link to="/admin/appointments">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Todas las Citas
              </Button>
            </Link>
            <Link to="/admin/book-appointment">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Cita
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button className="w-full justify-start" variant="outline">
                <UserCog className="mr-2 h-4 w-4" />
                Gestionar Usuarios
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Reporte de {reportLabels[activeReport]}</CardTitle>
            <CardDescription>
              Mostrando {selectedRows.length} registros recientes de {reportLabels[activeReport].toLowerCase()}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeReport === 'usuarios' && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Filtrar usuarios:</span>
                <select
                  value={userRoleFilter}
                  onChange={(event) => setUserRoleFilter(event.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="admin">Administradores</option>
                  <option value="medico">Médicos</option>
                  <option value="recepcionista">Recepcionistas</option>
                </select>
              </div>
            )}

            {selectedRows.length === 0 ? (
              <p className="text-sm text-slate-500">No hay registros para mostrar.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {selectedRows.map((row, index) => (
                  <div key={String(row.id || index)} className="rounded-lg border border-slate-200 p-4">
                    {renderRow(row)}
                    <p className="mt-2 text-xs text-slate-400">
                      Registrado: {formatDate(row.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Actividad Reciente</CardTitle>
          <CardDescription>
            {dashboard?.recentActivity.length || 0} movimientos recientes entre usuarios, pacientes,
            médicos, clínicas y citas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {(dashboard?.recentActivity || []).map((activity) => {
              const Icon = activityIcon[activity.type] || Activity;

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
