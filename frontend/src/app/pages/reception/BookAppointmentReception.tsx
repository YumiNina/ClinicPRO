import { isAxiosError } from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { useCitas } from '../../../hooks/useCitas';
import { apiClient } from '../../../services/api-client';
import { Button } from '../../components/ui/button';
import { Calendar } from '../../components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

type Patient = {
  id: string;
  nombre_completo?: string;
  nombre_apellido?: string;
};

type Doctor = {
  id: string;
  usuario_id?: string;
  nombre_completo: string;
  email?: string;
  especialidad?: string;
};

type Clinic = {
  id: string;
  nombre: string;
};

type ApiListResponse<T> = {
  data: T[];
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

export default function BookAppointmentReception() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDoctor = user?.rol === 'medico';
  const isAdmin = user?.rol === 'admin';
  const homePath = isDoctor ? '/doctor' : isAdmin ? '/admin' : '/reception';
  const appointmentsPath = isDoctor
    ? '/doctor/appointments'
    : isAdmin
      ? '/admin/appointments'
      : '/reception/appointments';
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');

  const { agendarCitaMutation } = useCitas();
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const currentYearEnd = useMemo(() => new Date(today.getFullYear(), 11, 31), [today]);

  useEffect(() => {
    apiClient
      .get<ApiListResponse<Patient>>('/pacientes')
      .then((response) => setPatients(response.data.data || []))
      .catch((error) => toast.error(getErrorMessage(error, 'No se pudieron cargar los pacientes')));
    apiClient
      .get<ApiListResponse<Doctor>>('/catalogos/medicos')
      .then((response) => setDoctors(response.data.data || []))
      .catch((error) => toast.error(getErrorMessage(error, 'No se pudieron cargar los médicos')));
    apiClient
      .get<ApiListResponse<Clinic>>('/catalogos/clinicas')
      .then((response) => setClinics(response.data.data || []))
      .catch((error) => toast.error(getErrorMessage(error, 'No se pudieron cargar las clínicas')));
  }, []);

  const availableDoctors = useMemo(
    () => {
      if (!isDoctor) return doctors.filter((doctor) => Boolean(doctor.usuario_id));

      const linkedDoctors = doctors.filter(
        (doctor) =>
          doctor.usuario_id === user?.id ||
          doctor.email?.toLowerCase() === user?.email?.toLowerCase()
      );

      if (linkedDoctors.length > 0) return linkedDoctors;

      if (user?.id) {
        return [
          {
            id: user.id,
            usuario_id: user.id,
            nombre_completo: user.nombre_completo || user.email || 'Médico actual',
            email: user.email,
            especialidad: 'General',
          },
        ];
      }

      return [];
    },
    [doctors, isDoctor, user?.email, user?.id, user?.nombre_completo]
  );

  useEffect(() => {
    if (isDoctor && availableDoctors.length > 0 && !selectedDoctor) {
      setSelectedDoctor(availableDoctors[0].id);
    }
  }, [availableDoctors, isDoctor, selectedDoctor]);

  const selectedDateString = useMemo(() => {
    if (!selectedDate) return '';
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const doctorId = isDoctor ? availableDoctors[0]?.id : selectedDoctor;

    if (!selectedPatient || !doctorId || !selectedClinic || !selectedDateString || !selectedTime) {
      toast.error('Completa todos los campos');
      return;
    }

    if (selectedDate && (selectedDate < today || selectedDate > currentYearEnd)) {
      toast.error('La fecha debe estar dentro del año actual y no puede ser pasada');
      return;
    }

    const selectedDoctorRecord = availableDoctors.find((doctor) => doctor.id === doctorId);

    try {
      await agendarCitaMutation.mutateAsync({
        paciente_id: selectedPatient,
        medico_id: doctorId,
        clinica_id: selectedClinic,
        especialidad: selectedDoctorRecord?.especialidad || 'General',
        fecha: selectedDateString,
        hora: selectedTime,
      });

      toast.success('Cita creada correctamente');
      setTimeout(() => navigate(appointmentsPath), 800);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, 'No se pudo crear la cita'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(homePath)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isDoctor ? 'Agendar cita médica' : isAdmin ? 'Agendar cita' : 'Agendar cita (Recepción)'}
          </h2>
          <p className="text-gray-600">
            {isDoctor
              ? 'Reserva una cita para un paciente dentro de tu agenda médica'
              : 'Reserva una cita para un paciente con el médico correspondiente'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la cita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Paciente</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre_completo || p.nombre_apellido}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isDoctor ? (
                <div>
                  <Label>Médico</Label>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                    {availableDoctors[0]?.nombre_completo || 'Médico actual'}
                    <p className="mt-1 text-xs text-slate-500">
                      Las citas se agendan únicamente en tu propia agenda.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Label>Médico</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un médico" />
                    </SelectTrigger>
                  <SelectContent>
                    {availableDoctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.nombre_completo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableDoctors.length === 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    No hay médicos vinculados a usuarios activos para agendar.
                  </p>
                )}
              </div>
            )}

              <div>
                <Label>Clínica</Label>
                <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fecha</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < today || date > currentYearEnd}
                />
              </div>

              <div>
                <Label>Hora</Label>
                <Input value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} type="time" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(homePath)}>Cancelar</Button>
              <Button type="submit">Agendar Cita</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
