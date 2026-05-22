import { AxiosError } from 'axios';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { apiClient } from '../../../services/api-client';
import {
  isDigits,
  isEmail,
  isLetters,
  isPhone,
  isTimeRangeSchedule,
  keepDigits,
  keepLetters,
  keepTimeRangeCharacters,
} from '../../../utils/form-validation';
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

type CatalogItem = {
  id: string;
  nombre: string;
};

const initialDoctorFormData = {
  fullName: '',
  ci: '',
  email: '',
  phone: '',
  specialty: '',
  licenseNumber: '',
  clinicId: '',
  schedule: '',
  password: '',
  confirmPassword: '',
};

type DoctorFormData = typeof initialDoctorFormData;
type DoctorFormField = keyof DoctorFormData;
type DoctorFormErrors = Partial<Record<DoctorFormField | 'form', string>>;

const getApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    return {
      message:
        error.response?.data?.message ||
        'No se pudo registrar el médico. Revisa los datos del formulario.',
      field: error.response?.data?.field as DoctorFormField | undefined,
    };
  }

  return {
    message:
      error instanceof Error
        ? error.message
        : 'No se pudo registrar el médico. Revisa los datos del formulario.',
    field: undefined,
  };
};

export default function RegisterDoctor() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<CatalogItem[]>([]);
  const [specialties, setSpecialties] = useState<CatalogItem[]>([]);
  const [formData, setFormData] = useState<DoctorFormData>(initialDoctorFormData);
  const [formErrors, setFormErrors] = useState<DoctorFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient.get('/catalogos/clinicas'),
      apiClient.get('/catalogos/especialidades'),
    ])
      .then(([clinicsResponse, specialtiesResponse]) => {
        setClinics((clinicsResponse.data.data || []) as CatalogItem[]);
        setSpecialties((specialtiesResponse.data.data || []) as CatalogItem[]);
      })
      .catch((error) => {
        console.error(error);
        toast.error('No se pudieron cargar clínicas o especialidades');
      });
  }, []);

  const handleChange = (field: DoctorFormField, value: string) => {
    const nextValue = ['fullName'].includes(field)
      ? keepLetters(value)
      : ['ci', 'phone'].includes(field)
        ? keepDigits(value)
        : field === 'schedule'
          ? keepTimeRangeCharacters(value)
          : value;

    setFormData((prev) => ({ ...prev, [field]: nextValue }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const nextErrors: DoctorFormErrors = {};
    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!isLetters(formData.fullName)) {
      nextErrors.fullName = 'El nombre del médico solo debe contener letras';
    }

    if (!isDigits(formData.ci, 5, 12)) {
      nextErrors.ci = 'El CI debe contener solo números, entre 5 y 12 dígitos';
    }

    if (!isEmail(normalizedEmail)) {
      nextErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!isPhone(formData.phone)) {
      nextErrors.phone = 'El teléfono debe contener solo números, entre 7 y 12 dígitos';
    }

    if (!formData.specialty) {
      nextErrors.specialty = 'Selecciona una especialidad';
    }

    if (!formData.clinicId) {
      nextErrors.clinicId = 'Selecciona una clínica asignada';
    }

    if (!/^[A-Za-z0-9-]{4,30}$/.test(formData.licenseNumber.trim())) {
      nextErrors.licenseNumber = 'La licencia médica solo debe usar letras, números y guiones';
    }

    if (!isTimeRangeSchedule(formData.schedule)) {
      nextErrors.schedule = 'El horario debe usar solo horas, por ejemplo 09:00-12:00';
    }

    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(formData.password)) {
      nextErrors.password = 'La contraseña debe tener mayúscula, minúscula, número y carácter especial';
    }

    const firstValidationError = Object.values(nextErrors)[0];

    if (firstValidationError) {
      setFormErrors(nextErrors);
      toast.error(firstValidationError);
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post('/admin/doctors', {
        nombre_completo: formData.fullName,
        email: normalizedEmail,
        password: formData.password,
        ci: formData.ci,
        telefono: formData.phone,
        especialidad: formData.specialty,
        licencia_medica: formData.licenseNumber,
        clinica_id: formData.clinicId,
        horario: formData.schedule,
        activo: true,
      });

      toast.success('Médico registrado exitosamente');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (error) {
      console.error(error);
      const apiError = getApiError(error);
      const errorField = apiError.field && apiError.field in formData ? apiError.field : 'form';
      setFormErrors({ [errorField]: apiError.message });
      toast.error(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldError = (field: DoctorFormField) =>
    formErrors[field] ? (
      <p className="text-xs font-medium text-red-600">{formErrors[field]}</p>
    ) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Médico</h2>
          <p className="text-gray-600">Completa la información del profesional de salud</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Datos del Médico</CardTitle>
            <CardDescription>Información personal y profesional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {formErrors.form && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {formErrors.form}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Juan Pérez García"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  required
                />
                {renderFieldError('fullName')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ci">Carnet de Identidad (CI) *</Label>
                <Input
                  id="ci"
                  placeholder="12345678"
                  value={formData.ci}
                  onChange={(e) => handleChange('ci', e.target.value)}
                  inputMode="numeric"
                  required
                />
                {renderFieldError('ci')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
                {renderFieldError('email')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="70123456"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  inputMode="numeric"
                  required
                />
                {renderFieldError('phone')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad *</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => handleChange('specialty', value)}
                >
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.nombre}>
                        {specialty.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderFieldError('specialty')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Número de Licencia Médica *</Label>
                <Input
                  id="licenseNumber"
                  placeholder="LM-12345"
                  value={formData.licenseNumber}
                  onChange={(e) => handleChange('licenseNumber', e.target.value)}
                  required
                />
                {renderFieldError('licenseNumber')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic">Clínica Asignada *</Label>
                <Select
                  value={formData.clinicId}
                  onValueChange={(value) => handleChange('clinicId', value)}
                >
                  <SelectTrigger id="clinic">
                    <SelectValue placeholder="Selecciona una clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderFieldError('clinicId')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Horario de Atención *</Label>
                <Input
                  id="schedule"
                  placeholder="09:00-12:00, 14:00-18:00"
                  value={formData.schedule}
                  onChange={(e) => handleChange('schedule', e.target.value)}
                  inputMode="numeric"
                  required
                />
                <p className="text-xs text-slate-500">
                  Solo horas y rangos. No escribas días ni letras.
                </p>
                {renderFieldError('schedule')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="pr-11"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-md px-2 text-slate-500 transition hover:text-slate-800"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {renderFieldError('password')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="pr-11"
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? 'Ocultar confirmación de contraseña'
                        : 'Mostrar confirmación de contraseña'
                    }
                    className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-md px-2 text-slate-500 transition hover:text-slate-800"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {renderFieldError('confirmPassword')}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrar Médico'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
