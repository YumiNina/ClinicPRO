import {
  Activity,
  Bell,
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  Home,
  Inbox,
  LogOut,
  Menu,
  Settings,
  Stethoscope,
  User,
  UserCircle,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { useCitas } from '../../hooks/useCitas';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface DashboardLayoutProps {
  role: 'doctor' | 'admin' | 'reception';
}

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { useCitasDoctor } = useCitas();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentUser = user || JSON.parse(localStorage.getItem('clinicpro_user') || '{}');
  const userName = currentUser.nombre_completo || 'Usuario Demo';
  const doctorId = role === 'doctor' ? currentUser.id || '' : '';

  const { data: doctorAppointments } = useCitasDoctor(doctorId);

  const appointments = role === 'doctor' ? doctorAppointments || [] : [];
  const showNotificationControls = role !== 'admin';

  const notifications = appointments
    .slice()
    .sort(
      (a, b) =>
        new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime(),
    )
    .slice(0, 4)
    .map((appointment, index) => {
      const isUnread = appointment.status === 'pending' || appointment.status === 'confirmed';
      const title =
        appointment.status === 'confirmed'
          ? 'Cita confirmada'
          : appointment.status === 'pending'
            ? 'Cita pendiente'
            : appointment.status === 'cancelled'
              ? 'Cita cancelada'
              : appointment.status === 'absent'
                ? 'Registro de ausencia'
                : 'Actualizacion de cita';

      return {
        id: `${appointment.id}-${index}`,
        title,
        message: `${appointment.specialty} - ${appointment.date} ${appointment.time}`,
        time: appointment.date,
        unread: isUnread,
      };
    });

  const unreadCount = showNotificationControls
    ? notifications.filter((notification) => notification.unread).length
    : 0;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const doctorMenuItems = [
    { path: '/doctor', icon: Home, label: 'Inicio' },
    { path: '/doctor/agenda', icon: Calendar, label: 'Mi Agenda' },
    { path: '/doctor/appointments', icon: ClipboardList, label: 'Gestionar Citas' },
    { path: '/doctor/book-appointment', icon: Calendar, label: 'Agendar Cita' },
    { path: '/doctor/register-patient', icon: UserPlus, label: 'Registrar Paciente' },
    { path: '/doctor/histories', icon: FileText, label: 'Historiales' },
    {
      path: '/doctor/inbox',
      icon: Inbox,
      label: 'Bandeja de Entrada',
      badge: unreadCount,
    },
  ];

  const adminMenuItems = [
    { path: '/admin', icon: Home, label: 'Inicio' },
    {
      path: '/admin/register-clinic',
      icon: Building2,
      label: 'Registrar Clínica',
    },
    {
      path: '/admin/register-doctor',
      icon: Stethoscope,
      label: 'Registrar Médico',
    },
    {
      path: '/admin/register-patient',
      icon: UserPlus,
      label: 'Registrar Paciente',
    },
    {
      path: '/admin/book-appointment',
      icon: Calendar,
      label: 'Agendar Cita',
    },
    {
      path: '/admin/users',
      icon: Users,
      label: 'Usuarios',
    },
  ];
  const receptionMenuItems = [
    { path: '/reception', icon: Home, label: 'Inicio' },
    { path: '/reception/book-appointment', icon: Calendar, label: 'Agendar Cita' },
    { path: '/reception/appointments', icon: ClipboardList, label: 'Gestionar Citas' },
    {
      path: '/reception/register-patient',
      icon: UserPlus,
      label: 'Registrar Paciente',
    },
    {
      path: '/reception/inbox',
      icon: Inbox,
      label: 'Bandeja de Entrada',
      badge: unreadCount,
    },
  ];

  const menuItems =
    role === 'doctor'
      ? doctorMenuItems
      : role === 'reception'
        ? receptionMenuItems
        : adminMenuItems;

  const roleNames = {
    doctor: 'Médico',
    admin: 'Administrador',
    reception: 'Recepcionista',
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-950/95 border-b border-slate-800 sticky top-0 z-50 backdrop-blur">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and mobile menu */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-100 hover:bg-slate-800 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/15 sm:h-10 sm:w-10">
                  <Activity className="h-5 w-5 text-cyan-300 sm:h-6 sm:w-6" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-bold text-white text-sm sm:text-base">
                    CLINIC PRO
                  </h1>
                  <p className="text-xs text-cyan-300">{roleNames[role]}</p>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {showNotificationControls && (
                <div className="relative" ref={notificationRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-slate-100 hover:bg-slate-800 hover:text-white"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-slate-200 py-2 max-h-[500px] overflow-y-auto">
                      <div className="px-4 py-3 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-950">Notificaciones</h3>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`px-4 py-3 hover:bg-slate-50 cursor-pointer ${notif.unread ? 'bg-cyan-50/70' : ''}`}
                            >
                              <div className="flex gap-3">
                                {notif.unread && (
                                  <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-950 truncate">
                                    {notif.title}
                                  </p>
                                  <p className="text-sm text-slate-600 mt-0.5">{notif.message}</p>
                                  <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-sm text-slate-500 text-center">
                            No hay notificaciones recientes.
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-2 border-t border-slate-200">
                        <button className="text-sm text-cyan-700 hover:text-cyan-800 font-medium w-full text-center">
                          Ver todas las notificaciones
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 hover:bg-slate-800 rounded-lg px-2 py-1.5 transition-colors"
                >
                  <div className="w-8 h-8 bg-cyan-400/15 rounded-full flex items-center justify-center border border-cyan-400/25">
                    <User className="w-5 h-5 text-cyan-300" />
                  </div>
                  <span className="text-sm font-medium text-slate-100 hidden sm:block max-w-[120px] truncate">
                    {userName}
                  </span>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <p className="text-sm font-medium text-slate-950">{userName}</p>
                      <p className="text-xs text-slate-500">
                        {currentUser.email || 'demo@hospital.com'}
                      </p>
                    </div>
                    <Link
                      to={`/${role}/profile`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserCircle className="w-4 h-4" />
                      Mi Perfil
                    </Link>
                    <Link
                      to={`/${role}/settings`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-cyan-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Configuración
                    </Link>
                    <div className="border-t border-slate-200 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-slate-950 border-r border-slate-800 z-40 transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 h-full overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-cyan-400/15 text-cyan-100 font-medium'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant={isActive ? 'default' : 'secondary'} className="h-5 px-2">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="lg:max-w-7xl lg:mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="bg-slate-950 rounded-lg border border-slate-800 p-4 sticky top-20 shadow-sm">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-cyan-400/15 text-cyan-100 font-medium'
                            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <Badge variant={isActive ? 'default' : 'secondary'} className="h-5 px-2">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
