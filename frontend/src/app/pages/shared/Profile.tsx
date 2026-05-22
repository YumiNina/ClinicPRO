import {
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  Edit,
  FileText,
  HeartPulse,
  IdCard,
  KeyRound,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserPlus,
  UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../../hooks/useAuth';
import { apiClient } from '../../../services/api-client';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface ProfileProps {
  role: 'doctor' | 'admin' | 'reception';
}

type ProfileField = {
  label: string;
  value?: string;
  icon: typeof UserRound;
};

type DoctorDashboardRow = Record<string, string | number | boolean | null | undefined>;

export default function Profile({ role }: ProfileProps) {
  const { user } = useAuth();
  const currentUser = user || JSON.parse(localStorage.getItem('clinicpro_user') || '{}');
  const displayName = currentUser.nombre_completo || currentUser.name;
  const [doctorHistories, setDoctorHistories] = useState<DoctorDashboardRow[]>([]);
  const [doctorPatients, setDoctorPatients] = useState<DoctorDashboardRow[]>([]);

  useEffect(() => {
    if (role !== 'doctor') return;

    apiClient
      .get('/doctor/dashboard')
      .then((response) => {
        setDoctorHistories(response.data.data?.reports?.historiales || []);
        setDoctorPatients(response.data.data?.reports?.pacientes || []);
      })
      .catch((error) => console.error('No se pudo cargar resumen médico:', error));
  }, [role]);

  const profileData = {
    doctor: {
      name: displayName || 'Dr. Carlos Mendez',
      email: currentUser.email || 'doctor@hospital.com',
      ci: '87654321',
      phone: '71234567',
      specialty: 'Cardiologia',
      license: 'MED-12345',
      experience: '15 anos',
      education: 'Universidad Mayor de San Andres - 2010',
      schedule: 'Lunes a Viernes, 8:00 - 16:00',
      headline: 'Atencion medica',
      access: 'Agenda e historial clinico',
    },
    admin: {
      name: displayName || 'Admin Sistema',
      email: currentUser.email || 'admin@hospital.com',
      ci: '11223344',
      phone: '72345678',
      department: 'Administracion',
      position: 'Administrador del Sistema',
      accessLevel: 'Total',
      headline: 'Administracion general',
      access: 'Control completo del sistema',
    },
    reception: {
      name: displayName || 'Recepcion Clinica',
      email: currentUser.email || 'recepcion@hospital.com',
      ci: '55667788',
      phone: '73456789',
      department: 'Recepcion',
      position: 'Recepcionista',
      accessLevel: 'Citas y consulta operativa',
      headline: 'Gestion operativa',
      access: 'Citas y registro inicial',
    },
  };

  const data = profileData[role];

  const roleNames = {
    doctor: 'Medico',
    admin: 'Administrador',
    reception: 'Recepcionista',
  };

  const baseFields: ProfileField[] = [
    { label: 'Correo', value: data.email, icon: Mail },
    { label: 'Telefono', value: data.phone, icon: Phone },
    { label: 'CI', value: data.ci, icon: IdCard },
  ];

  const roleFields: Record<ProfileProps['role'], ProfileField[]> = {
    doctor: [
      { label: 'Especialidad', value: profileData.doctor.specialty, icon: HeartPulse },
      { label: 'Licencia medica', value: profileData.doctor.license, icon: ShieldCheck },
      { label: 'Experiencia', value: profileData.doctor.experience, icon: BriefcaseBusiness },
      { label: 'Formacion', value: profileData.doctor.education, icon: IdCard },
      { label: 'Horario', value: profileData.doctor.schedule, icon: CalendarDays },
    ],
    admin: [
      { label: 'Departamento', value: profileData.admin.department, icon: BriefcaseBusiness },
      { label: 'Cargo', value: profileData.admin.position, icon: ShieldCheck },
      { label: 'Nivel de acceso', value: profileData.admin.accessLevel, icon: KeyRound },
    ],
    reception: [
      { label: 'Departamento', value: profileData.reception.department, icon: BriefcaseBusiness },
      { label: 'Cargo', value: profileData.reception.position, icon: ShieldCheck },
      { label: 'Nivel de acceso', value: profileData.reception.accessLevel, icon: KeyRound },
    ],
  };

  const fields = [...baseFields, ...roleFields[role]];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/15">
              <UserRound className="h-8 w-8 text-cyan-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
                <Badge className="bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/20">
                  {roleNames[role]}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-300">{data.headline}</p>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">{data.access}</p>
            </div>
          </div>

          <Button className="w-full bg-cyan-600 text-white hover:bg-cyan-500 lg:w-auto">
            <Edit className="mr-2 h-4 w-4" />
            Editar Perfil
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
          <CardHeader className="border-b border-slate-200 pb-4">
            <CardTitle className="text-base text-slate-950">Datos del perfil</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid gap-3 md:grid-cols-2">
              {fields.map((field) => {
                const Icon = field.icon;

                return (
                  <div
                    key={field.label}
                    className="rounded-lg border border-slate-200 bg-white/80 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-md bg-cyan-50 p-2 text-cyan-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          {field.label}
                        </p>
                        <p className="mt-1 break-words text-sm font-medium text-slate-900">
                          {field.value || 'No registrado'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
          <CardHeader className="border-b border-slate-200 pb-4">
            <CardTitle className="text-base text-slate-950">Seguridad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="rounded-lg border border-slate-200 bg-white/80 p-4">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-5 w-5 text-cyan-700" />
                <div>
                  <p className="font-medium text-slate-950">Contrasena</p>
                  <p className="mt-1 text-sm text-slate-500">Ultima actualizacion: hace 2 meses</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                Cambiar contrasena
              </Button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white/80 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-700" />
                <div>
                  <p className="font-medium text-slate-950">Verificacion en dos pasos</p>
                  <p className="mt-1 text-sm text-slate-500">Aun no esta activa</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                Activar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {role === 'doctor' && (
        <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
          <CardHeader className="border-b border-slate-200 pb-4">
            <CardTitle className="text-base text-slate-950">
              Historial médico de pacientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="grid gap-3 md:grid-cols-3">
              <Link to="/doctor/register-patient">
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrar paciente
                </Button>
              </Link>
              <Link to="/doctor/appointments">
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Gestionar citas
                </Button>
              </Link>
              <Link to="/doctor/histories">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Historiales
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {doctorPatients.slice(0, 4).map((patient) => (
                <div
                  key={String(patient.id)}
                  className="rounded-lg border border-slate-200 bg-white/80 p-4"
                >
                  <p className="font-medium text-slate-950">
                    {patient.nombre_completo || patient.nombre_apellido}
                  </p>
                  <p className="text-sm text-slate-600">
                    CI: {patient.ci || patient.dni_nie || 'Sin CI'}
                  </p>
                  <Link to={`/doctor/patient-history/${patient.id}`}>
                    <Button variant="outline" size="sm" className="mt-3">
                      <FileText className="mr-2 h-4 w-4" />
                      Ver historial
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-cyan-100 bg-cyan-50/70 p-4">
              <p className="font-medium text-slate-950">Consultas registradas</p>
              <p className="text-sm text-slate-600">
                {doctorHistories.length} registros clínicos vinculados a tus pacientes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
