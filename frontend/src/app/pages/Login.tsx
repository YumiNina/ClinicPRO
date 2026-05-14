import { Activity, Lock, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../services/api-client';
import { getDefaultPathForRole } from '../../utils/roles';

const GmailIcon = () => (
  <svg
    aria-hidden="true"
    className="h-5 w-5"
    viewBox="0 0 24 24"
    role="img"
  >
    <path
      fill="#4285F4"
      d="M21.6 12.23c0-.74-.07-1.45-.2-2.13H12v4.03h5.37a4.59 4.59 0 0 1-1.99 3.01v2.5h3.22c1.89-1.74 3-4.3 3-7.41Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.22-2.5c-.9.6-2.04.95-3.41.95a6 6 0 0 1-5.63-4.15H3.04v2.58A10 10 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.37 13.87A6 6 0 0 1 6.05 12c0-.65.11-1.28.32-1.87V7.55H3.04A10 10 0 0 0 2 12c0 1.61.38 3.13 1.04 4.45l3.33-2.58Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.98c1.47 0 2.78.5 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.55l3.33 2.58A6 6 0 0 1 12 5.98Z"
    />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { isAuthenticated, login, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDefaultPathForRole(user.rol), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data.data;

      login(accessToken, refreshToken, user);

      navigate(getDefaultPathForRole(user.rol), { replace: true });
    } catch (_error) {
      alert('Email o contraseña incorrectos');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await apiClient.get('/auth/google');
      window.location.assign(response.data.data.url);
    } catch (_error) {
      alert('No se pudo iniciar sesión con Google');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/20 p-4 rounded-3xl backdrop-blur-xl border border-cyan-400/20">
              <Activity className="w-10 h-10 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-5xl font-black text-white tracking-tight">
                CLINIC PRO
              </h1>

              <p className="text-cyan-300 mt-2 text-lg">
                Soluciones Médicas Inteligentes
              </p>
            </div>
          </div>

          <div className="mt-24 space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Portal de Gestión Clínica y Administrativa
            </h2>

            <p className="text-slate-400 text-lg max-w-xl">
              Plataforma segura para gestión clínica,
              expedientes clínicos, pacientes y citas médicas.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 flex-wrap">
          <div className="px-5 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-sm">
            Administrador
          </div>

          <div className="px-5 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-sm">
            Recepcionista
          </div>

          <div className="px-5 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-sm">
            Médico
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/70 border border-slate-700 backdrop-blur-2xl rounded-3xl shadow-2xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white">
                Iniciar Sesión
              </h2>

              <p className="text-slate-400 mt-2">
                Ingrese sus credenciales para acceder al sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Correo Electrónico
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />

                  <input
                    type="email"
                    placeholder="usuario@clinicpro.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Contraseña
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />

                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-cyan-400 text-sm hover:text-cyan-300 transition"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/20"
              >
                Iniciar Sesión
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-slate-700 flex-1" />
              <span className="text-slate-500 text-sm">o continuar con</span>
              <div className="h-px bg-slate-700 flex-1" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white py-4 font-medium text-slate-900 transition hover:bg-slate-100"
            >
              <GmailIcon />
              Continuar con Gmail
            </button>

            <p className="text-center text-slate-400 text-sm mt-6">
              © 2026 CLINIC PRO — Plataforma Médica Inteligente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
