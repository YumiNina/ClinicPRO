import { FileText, Search, UserPlus, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { apiClient } from '../../../services/api-client';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';

type Patient = {
  id: string;
  nombre_completo?: string;
  nombre_apellido?: string;
  ci?: string;
  dni_nie?: string;
  telefono?: string;
  email?: string;
  created_at?: string;
};

type History = {
  id: string;
  paciente_id: string;
  diagnostico?: string;
  severidad?: string;
  medico_encargado?: string;
  descripcion?: string;
  tratamiento?: string;
  created_at?: string;
};

type ApiListResponse<T> = {
  data: T[];
};

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function DoctorHistories() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [histories, setHistories] = useState<History[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiClient
      .get<ApiListResponse<Patient>>('/pacientes')
      .then((response) => setPatients(response.data.data || []))
      .catch(() => toast.error('No se pudieron cargar los pacientes'));

    apiClient
      .get('/doctor/dashboard')
      .then((response) => setHistories(response.data.data?.reports?.historiales || []))
      .catch(() => toast.error('No se pudieron cargar los historiales recientes'));
  }, []);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return patients;

    return patients.filter((patient) => {
      const name = String(patient.nombre_completo || patient.nombre_apellido || '').toLowerCase();
      const ci = String(patient.ci || patient.dni_nie || '');
      const email = String(patient.email || '').toLowerCase();

      return name.includes(normalizedSearch) || ci.includes(normalizedSearch) || email.includes(normalizedSearch);
    });
  }, [patients, searchTerm]);

  const patientLookup = useMemo(
    () => new Map(patients.map((patient) => [patient.id, patient])),
    [patients]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historiales Médicos</h2>
          <p className="text-gray-600">
            Consulta, crea y edita registros clínicos de los pacientes.
          </p>
        </div>
        <Link to="/doctor/register-patient">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Registrar paciente
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Pacientes disponibles</p>
            <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Historiales recientes</p>
            <p className="text-2xl font-bold text-cyan-700">{histories.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Registros filtrados</p>
            <p className="text-2xl font-bold text-emerald-700">{filteredPatients.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar paciente
          </CardTitle>
          <CardDescription>Filtra por nombre, CI o correo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Ej. María, 12345678 o correo@clinicpro.com"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pacientes</CardTitle>
            <CardDescription>Abre el expediente para agregar o editar historial.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-cyan-50 p-2 text-cyan-700">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-950">
                        {patient.nombre_completo || patient.nombre_apellido || 'Paciente sin nombre'}
                      </p>
                      <p className="text-sm text-slate-600">
                        CI: {patient.ci || patient.dni_nie || 'Sin CI'}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {patient.email || patient.telefono || 'Sin contacto'}
                      </p>
                      <Link to={`/doctor/patient-history/${patient.id}`}>
                        <Button size="sm" variant="outline" className="mt-3">
                          <FileText className="mr-2 h-4 w-4" />
                          Gestionar historial
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <p className="text-sm text-slate-500">No se encontraron pacientes.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial reciente</CardTitle>
            <CardDescription>Últimos diagnósticos vinculados a tus citas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {histories.map((history) => {
              const patient = patientLookup.get(history.paciente_id);

              return (
                <div key={history.id} className="rounded-lg border border-cyan-100 bg-cyan-50/60 p-4">
                  <p className="font-medium text-slate-950">
                    {history.diagnostico || 'Registro clínico'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {patient?.nombre_completo || patient?.nombre_apellido || history.paciente_id}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(history.created_at)}</p>
                  <Link to={`/doctor/patient-history/${history.paciente_id}`}>
                    <Button size="sm" variant="outline" className="mt-3">
                      Editar expediente
                    </Button>
                  </Link>
                </div>
              );
            })}
            {histories.length === 0 && (
              <p className="text-sm text-slate-500">Aún no hay historiales recientes.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
