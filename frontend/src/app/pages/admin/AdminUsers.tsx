import {
  Clock,
  Mail,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
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
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

type AdminUserRole = 'admin' | 'medico' | 'recepcionista';

type AdminUser = {
  id: string;
  nombre_completo: string;
  email: string;
  rol: AdminUserRole;
  activo: boolean;
  ultimo_login?: string | null;
  created_at?: string | null;
};

type AdminUsersResponse = {
  users: AdminUser[];
  stats: {
    total: number;
    activos: number;
    inactivos: number;
    admins: number;
    medicos: number;
    recepcionistas: number;
  };
};

const roleLabels: Record<AdminUserRole, string> = {
  admin: 'Administrador',
  medico: 'Médico',
  recepcionista: 'Recepcionista',
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin registro';

  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminUsersResponse['stats'] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    apiClient
      .get('/admin/users')
      .then((response) => {
        const payload = response.data.data as AdminUsersResponse;
        setUsers(payload.users);
        setStats(payload.stats);
      })
      .catch((_error) => {
        setFeedback('No se pudieron cargar los usuarios registrados.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.nombre_completo.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);

      const matchesRole = roleFilter === 'all' || user.rol === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.activo) ||
        (statusFilter === 'inactive' && !user.activo);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchTerm, statusFilter, users]);

  const refreshUser = (updatedUser: AdminUser) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const updateUser = async (userId: string, payload: Partial<Pick<AdminUser, 'rol' | 'activo'>>) => {
    try {
      setFeedback('');
      const response = await apiClient.patch(`/admin/users/${userId}`, payload);
      refreshUser(response.data.data as AdminUser);
      setFeedback('Usuario actualizado correctamente.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el usuario seleccionado.';
      setFeedback(message);
    }
  };

  const cards = [
    {
      label: 'Usuarios',
      value: stats?.total ?? users.length,
      icon: Users,
      color: 'text-cyan-700',
    },
    {
      label: 'Activos',
      value: stats?.activos ?? users.filter((user) => user.activo).length,
      icon: UserCheck,
      color: 'text-emerald-700',
    },
    {
      label: 'Inactivos',
      value: stats?.inactivos ?? users.filter((user) => !user.activo).length,
      icon: UserX,
      color: 'text-red-700',
    },
    {
      label: 'Administradores',
      value: stats?.admins ?? users.filter((user) => user.rol === 'admin').length,
      icon: ShieldCheck,
      color: 'text-slate-800',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Usuarios Registrados</h2>
        <p className="text-slate-600">
          Consulta usuarios de Clinic Pro y administra su rol o estado de acceso.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="border-slate-200 bg-slate-50/80 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">{card.label}</p>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-950">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
        <CardHeader>
          <CardTitle>Directorio de usuarios</CardTitle>
          <CardDescription>
            Dato adicional visible para administración: último acceso registrado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="medico">Médicos</SelectItem>
                <SelectItem value="recepcionista">Recepcionistas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {feedback && (
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
              {feedback}
            </div>
          )}

          <div className="space-y-3">
            {isLoading && <p className="text-sm text-slate-500">Cargando usuarios...</p>}

            {!isLoading && filteredUsers.length === 0 && (
              <p className="text-sm text-slate-500">No se encontraron usuarios.</p>
            )}

            {filteredUsers.map((registeredUser) => {
              const isCurrentUser = registeredUser.id === currentUser?.id;

              return (
                <div
                  key={registeredUser.id}
                  className="rounded-lg border border-slate-200 bg-white/90 p-4"
                >
                  <div className="grid gap-4 xl:grid-cols-[1fr_220px_180px] xl:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-950">
                          {registeredUser.nombre_completo}
                        </h3>
                        <Badge
                          variant={registeredUser.activo ? 'default' : 'secondary'}
                          className={registeredUser.activo ? 'bg-emerald-600' : ''}
                        >
                          {registeredUser.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {isCurrentUser && <Badge variant="outline">Tu cuenta</Badge>}
                      </div>

                      <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="truncate">{registeredUser.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                          <span>Último acceso: {formatDate(registeredUser.ultimo_login)}</span>
                        </div>
                      </div>
                    </div>

                    <Select
                      value={registeredUser.rol}
                      disabled={isCurrentUser}
                      onValueChange={(value) =>
                        updateUser(registeredUser.id, { rol: value as AdminUserRole })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                        <SelectItem value="medico">{roleLabels.medico}</SelectItem>
                        <SelectItem value="recepcionista">
                          {roleLabels.recepcionista}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant={registeredUser.activo ? 'outline' : 'default'}
                      disabled={isCurrentUser}
                      onClick={() =>
                        updateUser(registeredUser.id, { activo: !registeredUser.activo })
                      }
                    >
                      {registeredUser.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
