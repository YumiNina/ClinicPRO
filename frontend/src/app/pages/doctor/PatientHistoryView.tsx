import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Edit,
  FileText,
  Save,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { apiClient, historialClient } from '../../../services/api-client';
import { currentYearEndInputValue, todayInputValue } from '../../../utils/form-validation';
import { Alert, AlertDescription } from '../../components/ui/alert';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';

type PatientInfo = {
  id: string;
  nombre_completo?: string;
  nombre_apellido?: string;
  ci?: string;
  dni_nie?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
};

type MedicalRecord = {
  id: string;
  paciente_id: string;
  diagnostico?: string;
  severidad?: string;
  medico_encargado?: string;
  descripcion?: string;
  tratamiento?: string;
  proxima_cita?: string;
  created_at?: string;
  updated_at?: string;
};

const emptyForm = {
  motivo: '',
  diagnostico: '',
  tratamiento: '',
  severidad: 'MEDIA',
  proximaCita: '',
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Sin fecha';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const calculateAge = (birthDate?: string) => {
  if (!birthDate) return 'No registrada';

  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return `${age} años`;
};

export default function PatientHistoryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const [patientResponse, historyResponse] = await Promise.all([
        apiClient.get(`/pacientes/${id}`),
        historialClient.get<MedicalRecord[]>(`/historial/paciente/${id}`),
      ]);

      setPatientInfo(patientResponse.data.data);
      setMedicalRecords(historyResponse.data || []);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cargar el expediente del paciente');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleNewRecord = () => {
    setEditingRecordId(null);
    setFormData(emptyForm);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecordId(record.id);
    setFormData({
      motivo: record.descripcion || '',
      diagnostico: record.diagnostico || '',
      tratamiento: record.tratamiento || '',
      severidad: record.severidad || 'MEDIA',
      proximaCita: record.proxima_cita || '',
    });
  };

  const handleGuardarConsulta = async () => {
    if (!id) return;

    if (formData.diagnostico.trim().length < 3) {
      toast.error('El diagnóstico debe tener al menos 3 caracteres');
      return;
    }

    try {
      setIsSaving(true);
      const payloadHistorial = {
        paciente_id: String(id),
        diagnostico: formData.diagnostico.trim(),
        severidad: formData.severidad,
        medico_encargado: user?.nombre_completo || 'Médico Clinic Pro',
        descripcion: formData.motivo.trim(),
        tratamiento: formData.tratamiento.trim(),
        proxima_cita: formData.proximaCita || undefined,
      };

      if (editingRecordId) {
        await historialClient.put(`/historial/${editingRecordId}`, payloadHistorial);
        toast.success('Historial actualizado correctamente');
      } else {
        await historialClient.post('/historial', payloadHistorial);
        toast.success('Nuevo historial agregado al expediente');
      }

      handleNewRecord();
      await loadHistory();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo guardar el historial médico');
    } finally {
      setIsSaving(false);
    }
  };

  const patientName =
    patientInfo?.nombre_completo || patientInfo?.nombre_apellido || 'Paciente sin nombre';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/doctor/histories')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Historial del Paciente</h2>
            <p className="text-gray-600">
              Consulta, agrega y edita registros clínicos del expediente.
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={handleNewRecord}>
          <FileText className="mr-2 h-4 w-4" />
          Nuevo registro
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          El médico puede crear nuevos registros y corregir información clínica del historial. Los
          datos se guardan en la tabla de consultas médicas del backend.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Información del Paciente</CardTitle>
          <CardDescription>{isLoading ? 'Cargando datos...' : patientName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-gray-600">Nombre Completo</p>
              <p className="font-medium text-gray-900">{patientName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CI</p>
              <p className="font-medium text-gray-900">
                {patientInfo?.ci || patientInfo?.dni_nie || 'Sin CI'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Edad</p>
              <p className="font-medium text-gray-900">
                {calculateAge(patientInfo?.fecha_nacimiento)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono</p>
              <p className="font-medium text-gray-900">{patientInfo?.telefono || 'Sin teléfono'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{patientInfo?.email || 'Sin email'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-gray-600">Dirección</p>
              <p className="font-medium text-gray-900">
                {patientInfo?.direccion || 'Sin dirección registrada'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Historial Médico</TabsTrigger>
          <TabsTrigger value="current">
            {editingRecordId ? 'Editar Registro' : 'Agregar Registro'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registros clínicos</CardTitle>
              <CardDescription>
                {medicalRecords.length} registros guardados para este paciente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalRecords.map((record) => (
                <div key={record.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {record.diagnostico || 'Consulta médica'}
                        </h4>
                        <Badge variant="secondary">{record.severidad || 'Sin severidad'}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(record.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{record.medico_encargado || 'Médico no registrado'}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleEditRecord(record)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Motivo / descripción:</p>
                      <p className="text-gray-600">{record.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Tratamiento:</p>
                      <p className="text-gray-600">{record.tratamiento || 'Sin tratamiento'}</p>
                    </div>
                    {record.proxima_cita && (
                      <div>
                        <p className="font-medium text-gray-700">Próxima cita sugerida:</p>
                        <p className="text-gray-600">{formatDate(record.proxima_cita)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {medicalRecords.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                  <FileText className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                  <p className="font-medium text-slate-900">Sin historial registrado</p>
                  <p className="text-sm text-slate-500">
                    Agrega el primer diagnóstico desde la pestaña de registro.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingRecordId ? 'Editar registro clínico' : 'Agregar registro clínico'}
              </CardTitle>
              <CardDescription>
                Registra diagnóstico, tratamiento e indicaciones para el paciente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo de consulta</Label>
                <Textarea
                  id="motivo"
                  placeholder="Describe el motivo de la consulta..."
                  value={formData.motivo}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, motivo: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnostico">Diagnóstico *</Label>
                <Textarea
                  id="diagnostico"
                  placeholder="Ingresa el diagnóstico..."
                  value={formData.diagnostico}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, diagnostico: event.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="severidad">Severidad</Label>
                  <Select
                    value={formData.severidad}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, severidad: value }))
                    }
                  >
                    <SelectTrigger id="severidad">
                      <SelectValue placeholder="Selecciona severidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BAJA">Baja</SelectItem>
                      <SelectItem value="MEDIA">Media</SelectItem>
                      <SelectItem value="ALTA">Alta</SelectItem>
                      <SelectItem value="CRITICA">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proximaCita">Próxima cita sugerida</Label>
                  <Input
                    id="proximaCita"
                    type="date"
                    value={formData.proximaCita}
                    min={todayInputValue()}
                    max={currentYearEndInputValue()}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, proximaCita: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tratamiento">Tratamiento / indicaciones</Label>
                <Textarea
                  id="tratamiento"
                  placeholder="Tratamiento prescrito, recomendaciones o indicaciones..."
                  value={formData.tratamiento}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, tratamiento: event.target.value }))
                  }
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1" onClick={handleGuardarConsulta} disabled={isSaving}>
                  {isSaving ? (
                    'Guardando...'
                  ) : (
                    <>
                      {editingRecordId ? (
                        <Save className="mr-2 h-4 w-4" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      {editingRecordId ? 'Actualizar historial' : 'Guardar historial'}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={handleNewRecord}>
                  Limpiar formulario
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
