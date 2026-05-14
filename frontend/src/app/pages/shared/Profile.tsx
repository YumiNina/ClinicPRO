import {
  BriefcaseBusiness,
  CalendarDays,
  Edit,
  HeartPulse,
  IdCard,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface ProfileProps {
  role: 'patient' | 'doctor' | 'admin' | 'reception';
}

type ProfileField = {
  label: string;
  value?: string;
  icon: typeof UserRound;
};

export default function Profile({ role }: ProfileProps) {
  const { user } = useAuth();
  const currentUser = user || JSON.parse(localStorage.getItem('clinicpro_user') || '{}');
  const displayName = currentUser.nombre_completo || currentUser.name;

  const profileData = {
    patient: {
      name: displayName || 'Ana Garcia Perez',
      email: currentUser.email || 'paciente@hospital.com',
      ci: '12345678',
      phone: '70123456',
      birthDate: '15/05/1990',
      gender: 'Femenino',
      bloodType: 'O+',
      address: 'Av. 6 de Agosto #1234, La Paz',
      emergencyContact: 'Juan Garcia - 71234567',
      headline: 'Paciente activo',
      access: 'Portal de paciente',
      medicalHistory: [
        {
          date: '15/03/2026',
          doctor: 'Dr. Carlos Mendez',
          specialty: 'Cardiologia',
          diagnosis: 'Hipertension arterial controlada',
          treatment: 'Enalapril 10mg',
        },
        {
          date: '10/02/2026',
          doctor: 'Dra. Maria Lopez',
          specialty: 'Medicina General',
          diagnosis: 'Gripe comun',
          treatment: 'Paracetamol, reposo',
        },
        {
          date: '20/01/2026',
          doctor: 'Dr. Pedro Ramirez',
          specialty: 'Traumatologia',
          diagnosis: 'Esguince leve tobillo derecho',
          treatment: 'Antiinflamatorios, fisioterapia',
        },
      ],
    },
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
    patient: 'Paciente',
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
    patient: [
      { label: 'Fecha de nacimiento', value: profileData.patient.birthDate, icon: CalendarDays },
      { label: 'Genero', value: profileData.patient.gender, icon: UserRound },
      { label: 'Tipo de sangre', value: profileData.patient.bloodType, icon: HeartPulse },
      { label: 'Contacto de emergencia', value: profileData.patient.emergencyContact, icon: Phone },
      { label: 'Direccion', value: profileData.patient.address, icon: MapPin },
    ],
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

      {role === 'patient' && (
        <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
          <CardHeader className="border-b border-slate-200 pb-4">
            <CardTitle className="text-base text-slate-950">Historial medico reciente</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid gap-3">
              {profileData.patient.medicalHistory.map((record) => (
                <div key={`${record.date}-${record.diagnosis}`} className="rounded-lg border border-slate-200 bg-white/80 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {record.date} · {record.specialty}
                      </p>
                      <p className="mt-1 font-medium text-slate-950">{record.diagnosis}</p>
                      <p className="mt-1 text-sm text-slate-600">{record.doctor}</p>
                      <p className="mt-2 text-sm text-slate-500">Tratamiento: {record.treatment}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver detalle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
