import { Calendar as CalendarIcon, Clock, Edit, MapPin, User, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { useCitas } from '../../../hooks/useCitas';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Calendar } from '../../components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

export default function DoctorAgenda() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { user } = useAuth();
  const doctorId = String(user?.id || '');
  const selectedDateString = useMemo(() => {
    if (!selectedDate) return '';
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const {
    useCitasDoctor,
    cambiarEstadoMutation,
    editarNotasMutation,
    actualizarCitaMutation,
  } = useCitas();

  const { data: citasDoctor = [] } = useCitasDoctor(doctorId, selectedDateString);

  const [editForm, setEditForm] = useState({
    patient: '',
    date: '',
    time: '',
    clinic: '',
    specialty: '',
    notes: '',
  });

  const handleCancelAppointment = async (id: string) => {
    try {
      await cambiarEstadoMutation.mutateAsync({ id, estado: 'cancelled' });
      toast.success('Cita cancelada correctamente', { description: 'El paciente ha sido notificado y el horario quedó disponible' });
    } catch (err) {
      console.error(err);
      toast.error('No se pudo cancelar la cita');
    }
  };

  const handleMarkAbsent = async (id: string) => {
    try {
      await cambiarEstadoMutation.mutateAsync({ id, estado: 'absent' });
      toast.warning('Paciente marcado como ausente', { description: 'Se ha registrado la inasistencia en la agenda médica.' });
    } catch (err) {
      console.error(err);
      toast.error('No se pudo marcar ausencia');
    }
  };

  const handleSaveAndComplete = async (id: string) => {
    try {
      if (editForm.notes) {
        await editarNotasMutation.mutateAsync({ id, notas_doctor: editForm.notes });
      }

      const payload: Record<string, unknown> = {};
      if (editForm.date) payload.fecha = editForm.date;
      if (editForm.time) payload.hora = editForm.time;
      if (editForm.clinic) payload.clinica_id = editForm.clinic;
      if (editForm.specialty) payload.especialidad = editForm.specialty;

      if (Object.keys(payload).length > 0) {
        await actualizarCitaMutation.mutateAsync({ id, payload });
      }

      await cambiarEstadoMutation.mutateAsync({ id, estado: 'completed' });
      toast.success('Consulta guardada y completada');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo guardar la consulta');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge variant="default" className="bg-green-600">
            Confirmada
          </Badge>
        );
      case 'completed':
        return <Badge variant="outline">Completada</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      case 'absent':
        return (
          <Badge variant="secondary" className="bg-orange-500 text-white hover:bg-orange-600">
            Ausente
          </Badge>
        );
      default:
        return null;
    }
  };

  // Filter appointments by selected date
  const mappedAppointments = (citasDoctor || []).map((c) => ({
    id: c.id,
    patient: c.patientId || 'Paciente',
    ci: '',
    date: c.date,
    time: c.time,
    specialty: c.specialty,
    clinic: c.clinic,
    status: c.status,
  }));

  const filteredAppointments = mappedAppointments;
  const upcomingAppointments = filteredAppointments.filter((a) => a.status === 'confirmed');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mi Agenda</h2>
        <p className="text-gray-600">Gestiona tus citas y consultas programadas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Fecha</CardTitle>
            <CardDescription>Elige un día para ver tus citas</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
            />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-gray-700">Citas del día</span>
                <Badge variant="default" className="bg-green-600">
                  {filteredAppointments.filter((a) => a.status === 'confirmed').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Citas del{' '}
                {selectedDate?.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </CardTitle>
              <CardDescription>{upcomingAppointments.length} citas programadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">
                            {appointment.time} hrs
                          </span>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{appointment.patient}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>CI: {appointment.ci}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{appointment.clinic}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {appointment.status === 'confirmed' && (
                      <div className="flex gap-2 pt-3 border-t">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancelar Cita
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar Cita Médica</AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <p>¿Estás seguro de cancelar la cita con {appointment.patient}?</p>
                                <div className="p-3 bg-cyan-50 rounded-md border border-cyan-200">
                                  <p className="text-sm text-cyan-800">
                                    <strong>Nota:</strong> El paciente será notificado y el horario
                                    quedará disponible para otra reserva.
                                  </p>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No, mantener</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sí, cancelar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                              <User className="w-4 h-4 mr-2" />
                              Marcar Ausencia
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Marcar Ausencia del Paciente</AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <p>
                                  ¿Confirmas que el paciente {appointment.patient} no se presentó a
                                  su cita?
                                </p>
                                <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                                  <p className="text-sm text-orange-800">
                                    <strong>Atención:</strong> Al confirmar esta acción, el sistema
                                    registrará la inasistencia en la agenda médica.
                                  </p>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleMarkAbsent(appointment.id)}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                Sí, marcar ausente
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditForm({
                                  patient: appointment.patient,
                                  date: appointment.date,
                                  time: appointment.time,
                                  clinic: appointment.clinic,
                                  specialty: appointment.specialty,
                                  notes: '',
                                });
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar Consulta
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Consulta</DialogTitle>
                              <DialogDescription>
                                Actualiza los detalles de la consulta con {appointment.patient}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="patient">Paciente</Label>
                                <Input
                                  id="patient"
                                  defaultValue={appointment.patient}
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="ci">CI</Label>
                                <Input id="ci" defaultValue={appointment.ci} className="w-full" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="date">Fecha</Label>
                                <Input
                                  id="date"
                                  type="date"
                                  value={editForm.date}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, date: e.target.value })
                                  }
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="time">Hora</Label>
                                <Input
                                  id="time"
                                  type="time"
                                  value={editForm.time}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, time: e.target.value })
                                  }
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="specialty">Especialidad</Label>
                                <Input
                                  id="specialty"
                                  value={editForm.specialty}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, specialty: e.target.value })
                                  }
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="clinic">Clínica</Label>
                                <Input
                                  id="clinic"
                                  value={editForm.clinic}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, clinic: e.target.value })
                                  }
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Añade notas sobre la consulta"
                                  className="w-full"
                                  value={editForm.notes}
                                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" className="bg-gray-500 hover:bg-gray-600">
                                  Cancelar
                                </Button>
                              </DialogClose>
                              <Button
                                type="button"
                                onClick={() => handleSaveAndComplete(appointment.id)}
                                className="bg-cyan-500 hover:bg-cyan-600"
                              >
                                Guardar y Completar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Sin citas programadas</h3>
                  <p className="text-gray-600 text-sm">No hay citas para esta fecha</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
