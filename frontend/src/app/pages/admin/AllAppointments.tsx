import { Building2, Calendar, Clock, Filter, Plus, Search, Stethoscope, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { toast } from 'sonner';
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
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

interface Appointment {
  id: string;
  patientId: string;
  patient: string;
  patientCI: string;
  doctor: string;
  specialty: string;
  clinic: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'absent' | 'pending';
}

type CitaApi = {
  id: string;
  paciente_id: string;
  medico_id: string;
  clinica_id: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: Appointment['status'];
};

type Patient = {
  id: string;
  nombre_completo?: string;
  nombre_apellido?: string;
  ci?: string;
  dni_nie?: string;
};

type Doctor = {
  id: string;
  usuario_id?: string;
  nombre_completo?: string;
};

type Clinic = {
  id: string;
  nombre?: string;
};

type ApiListResponse<T> = {
  data: T[];
};

export default function AllAppointments() {
  const location = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const isDoctorView = location.pathname.startsWith('/doctor');
  const isReceptionView = location.pathname.startsWith('/reception');
  const bookAppointmentPath = isDoctorView
    ? '/doctor/book-appointment'
    : isReceptionView
      ? '/reception/book-appointment'
      : '/admin/book-appointment';

  const loadAppointments = useCallback(() => {
    Promise.all([
      apiClient.get<CitaApi[]>('/citas'),
      apiClient.get<ApiListResponse<Patient>>('/pacientes'),
      apiClient.get<ApiListResponse<Doctor>>('/catalogos/medicos'),
      apiClient.get<ApiListResponse<Clinic>>('/catalogos/clinicas'),
    ])
      .then(([appointmentsResponse, patientsResponse, doctorsResponse, clinicsResponse]) => {
        const patients = new Map(
          (patientsResponse.data.data || []).map((patient) => [patient.id, patient])
        );
        const doctors = new Map<string, Doctor>();
        (doctorsResponse.data.data || []).forEach((doctor) => {
          doctors.set(doctor.id, doctor);
          if (doctor.usuario_id) doctors.set(doctor.usuario_id, doctor);
        });
        const clinics = new Map(
          (clinicsResponse.data.data || []).map((clinic) => [clinic.id, clinic])
        );

        const mapped = ((appointmentsResponse.data || []) as CitaApi[]).map((cita) => ({
          id: cita.id,
          patientId: cita.paciente_id,
          patient:
            patients.get(cita.paciente_id)?.nombre_completo ||
            patients.get(cita.paciente_id)?.nombre_apellido ||
            cita.paciente_id,
          patientCI:
            patients.get(cita.paciente_id)?.ci ||
            patients.get(cita.paciente_id)?.dni_nie ||
            '',
          doctor: doctors.get(cita.medico_id)?.nombre_completo || cita.medico_id,
          specialty: cita.especialidad,
          clinic: clinics.get(cita.clinica_id)?.nombre || cita.clinica_id,
          date: cita.fecha,
          time: cita.hora,
          status: cita.estado,
        }));
        setAppointments(mapped);
      })
      .catch((error) => console.error('No se pudieron cargar citas:', error));
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-600">Confirmada</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'completed':
        return <Badge className="bg-cyan-600">Completada</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      case 'no-show':
      case 'absent':
        return <Badge className="bg-orange-600">No asistió</Badge>;
      default:
        return null;
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientCI.includes(searchTerm) ||
      apt.doctor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesDate = !filterDate || apt.date === filterDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    noShow: appointments.filter((a) => a.status === 'no-show' || a.status === 'absent').length,
  };

  const availableStatuses =
    user?.rol === 'recepcionista'
      ? ['pending', 'confirmed', 'cancelled']
      : ['pending', 'confirmed', 'completed', 'cancelled', 'absent'];

  const handleStatusChange = async (appointmentId: string, status: string) => {
    try {
      await apiClient.patch(`/citas/${appointmentId}/estado`, { estado: status });
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: status as Appointment['status'] }
            : appointment
        )
      );
      toast.success('Estado de la cita actualizado');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo actualizar la cita');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isDoctorView ? 'Gestión de Citas Médicas' : 'Todas las Citas'}
          </h2>
          <p className="text-gray-600">
            {isDoctorView
              ? 'Consulta y actualiza las citas vinculadas a tu agenda.'
              : 'Gestión completa de citas del sistema'}
          </p>
        </div>
        {bookAppointmentPath && (
          <Link to={bookAppointmentPath}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agendar cita
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Confirmadas</p>
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Completadas</p>
            <p className="text-2xl font-bold text-cyan-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Canceladas</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">No asistió</p>
            <p className="text-2xl font-bold text-orange-600">{stats.noShow}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Paciente, CI o Médico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                  <SelectItem value="absent">No asistió</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>

          {(searchTerm || filterStatus !== 'all' || filterDate) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterDate('');
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Citas</CardTitle>
          <CardDescription>
            Mostrando {filteredAppointments.length} de {appointments.length} citas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {new Date(apt.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <Clock className="w-4 h-4 text-gray-400 ml-2" />
                        <span className="text-gray-700">{apt.time} hrs</span>
                        {getStatusBadge(apt.status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            <strong>Paciente:</strong> {apt.patient}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">
                            <strong>CI:</strong> {apt.patientCI}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            {apt.doctor} - {apt.specialty}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{apt.clinic}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Select
                        value={apt.status}
                        onValueChange={(value) => handleStatusChange(apt.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Cambiar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status === 'pending'
                                ? 'Pendiente'
                                : status === 'confirmed'
                                  ? 'Confirmada'
                                  : status === 'completed'
                                    ? 'Completada'
                                    : status === 'cancelled'
                                      ? 'Cancelada'
                                      : 'No asistió'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isDoctorView && (
                        <Link to={`/doctor/patient-history/${apt.patientId}`}>
                          <Button variant="outline" size="sm">
                            Historial
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No se encontraron citas</h3>
                <p className="text-gray-600 text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
