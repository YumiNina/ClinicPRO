import { Activity, AlertTriangle, Building2, Calendar, Stethoscope, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
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

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<{
    stats: {
      pacientes: number;
      medicos: number;
      clinicas: number;
      citasHoy: number;
    };
    recentActivity: Array<{
      id: string;
      accion?: string;
      entidad?: string;
      created_at?: string;
    }>;
  } | null>(null);

  useEffect(() => {
    apiClient
      .get('/admin/dashboard')
      .then((response) => setDashboard(response.data.data))
      .catch((error) => console.error('No se pudo cargar dashboard admin:', error));
  }, []);

  const stats = [
    {
      label: 'Total Pacientes',
      value: String(dashboard?.stats.pacientes ?? 0),
      icon: Users,
      color: 'text-cyan-600',
      change: '+12%',
    },
    {
      label: 'Médicos Activos',
      value: String(dashboard?.stats.medicos ?? 0),
      icon: Stethoscope,
      color: 'text-green-600',
      change: '+3',
    },
    {
      label: 'Clínicas',
      value: String(dashboard?.stats.clinicas ?? 0),
      icon: Building2,
      color: 'text-teal-600',
      change: '',
    },
    {
      label: 'Citas Hoy',
      value: String(dashboard?.stats.citasHoy ?? 0),
      icon: Calendar,
      color: 'text-orange-600',
      change: '',
    },
  ];

  const recentActivity =
    dashboard?.recentActivity.map((activity) => ({
      type: activity.entidad || 'activity',
      message: activity.accion || 'Actividad registrada',
      time: activity.created_at
        ? new Date(activity.created_at).toLocaleString('es-ES')
        : 'Fecha no disponible',
      status: 'info',
    })) || [];

  const penalties = [
    {
      patient: 'Carlos Rodríguez',
      ci: '12345678',
      reason: '1 cancelación',
      blockUntil: '12 Abr 2026',
      type: '1mes',
    },
    {
      patient: 'Ana López',
      ci: '23456789',
      reason: '3 ausencias consecutivas',
      blockUntil: '10 Feb 2027',
      type: '1año',
    },
    {
      patient: 'Luis Torres',
      ci: '34567890',
      reason: '1 cancelación',
      blockUntil: '20 Mar 2026',
      type: '1mes',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="w-5 h-5 text-cyan-600" />;
      case 'doctor':
        return <Stethoscope className="w-5 h-5 text-green-600" />;
      case 'clinic':
        return <Building2 className="w-5 h-5 text-teal-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'block':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
        <p className="text-gray-600">Vista general de Clinic Pro</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  <Badge variant="secondary">{stat.change}</Badge>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Operaciones frecuentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin/register-patient">
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Registrar Paciente
              </Button>
            </Link>
            <Link to="/admin/register-doctor">
              <Button className="w-full justify-start" variant="outline">
                <Stethoscope className="w-4 h-4 mr-2" />
                Registrar Médico
              </Button>
            </Link>
            <Link to="/admin/register-clinic">
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="w-4 h-4 mr-2" />
                Registrar Clínica
              </Button>
            </Link>
            <Link to="/admin/appointments">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Ver Todas las Citas
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Gestionar Usuarios
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 && (
                  <p className="text-sm text-gray-500">Aún no hay actividad registrada.</p>
                )}
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                  >
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Penalties/Blocks */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Penalizaciones</CardTitle>
          <CardDescription>Pacientes con bloqueos activos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {penalties.map((penalty, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{penalty.patient}</h4>
                    <Badge variant={penalty.type === '1año' ? 'destructive' : 'secondary'}>
                      Bloqueado {penalty.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">CI: {penalty.ci}</p>
                  <p className="text-sm text-gray-600">Motivo: {penalty.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Bloqueado hasta: {penalty.blockUntil}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Ver Detalles
                  </Button>
                  <Button size="sm" variant="default">
                    Desbloquear
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
