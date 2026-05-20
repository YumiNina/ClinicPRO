import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { apiClient } from '../../../services/api-client';
import {
  isDigits,
  isEmail,
  isLetters,
  isPhone,
  keepDigits,
  keepLetters,
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

export default function RegisterDoctor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    ci: '',
    email: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    clinic: '',
    schedule: '',
    password: '',
    confirmPassword: '',
  });

  const specialties = [
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Medicina General',
    'Neurología',
    'Oftalmología',
    'Pediatría',
    'Traumatología',
  ];

  const clinics = [
    'Hospital Central',
    'Clínica del Sur',
    'Centro Médico Norte',
    'Hospital San Juan',
  ];

  const handleChange = (field: string, value: string) => {
    const nextValue = ['fullName'].includes(field)
      ? keepLetters(value)
      : ['ci', 'phone'].includes(field)
        ? keepDigits(value)
        : value;

    setFormData((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLetters(formData.fullName)) {
      toast.error('El nombre del médico solo debe contener letras');
      return;
    }

    if (!isDigits(formData.ci, 5, 12)) {
      toast.error('El CI debe contener solo números, mínimo 5 dígitos');
      return;
    }

    if (!isEmail(formData.email)) {
      toast.error('Ingresa un correo electrónico válido');
      return;
    }

    if (!isPhone(formData.phone)) {
      toast.error('El teléfono debe contener solo números, entre 7 y 12 dígitos');
      return;
    }

    if (!formData.specialty || !formData.clinic) {
      toast.error('Selecciona especialidad y clínica asignada');
      return;
    }

    if (!/^[A-Za-z0-9-]{4,30}$/.test(formData.licenseNumber.trim())) {
      toast.error('La licencia médica solo debe usar letras, números y guiones');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await apiClient.post('/medicos', {
        nombre_completo: formData.fullName,
        ci: formData.ci,
        email: formData.email,
        telefono: formData.phone,
        especialidad: formData.specialty,
        licencia_medica: formData.licenseNumber,
        horario: formData.schedule,
        activo: true,
      });

      toast.success('Médico registrado exitosamente');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo registrar el médico');
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Dr. Juan Pérez García"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  required
                />
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
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic">Clínica Asignada *</Label>
                <Select
                  value={formData.clinic}
                  onValueChange={(value) => handleChange('clinic', value)}
                >
                  <SelectTrigger id="clinic">
                    <SelectValue placeholder="Selecciona una clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic} value={clinic}>
                        {clinic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Horario de Atención *</Label>
                <Input
                  id="schedule"
                  placeholder="Lunes a Viernes 9:00-17:00"
                  value={formData.schedule}
                  onChange={(e) => handleChange('schedule', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                />
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
              <Button type="submit" className="flex-1">
                Registrar Médico
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
