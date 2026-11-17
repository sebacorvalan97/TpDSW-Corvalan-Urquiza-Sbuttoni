import { useState, type FormEvent } from 'react';
import { API_BASE } from '../services/http';

export type AuthRole = 'user' | 'admin';

export interface AuthSession {
  token: string;
  role: AuthRole;
  id: number;
  name: string;
  mail: string;
}

interface Props {
  onSuccess: (session: AuthSession) => void;
  onCancel: () => void;
  onRegister?: () => void;
}

export default function AuthPanel({ onSuccess, onCancel, onRegister }: Props) {
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const credentials = JSON.stringify({ mail: mail.trim(), password });
    const headers = { 'Content-Type': 'application/json' };

    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers,
        body: credentials,
      });
      const result = await response.json() as {
        role?: AuthRole;
        token?: string;
        user?: { idUser: number; name: string; mail: string };
        admin?: { idAdmin: number; name: string; mail: string };
        message?: string;
      };

      if (response.ok && result.token && result.user) {
        onSuccess({
          token: result.token,
          role: 'user',
          id: result.user.idUser,
          name: result.user.name,
          mail: result.user.mail,
        });
        return;
      }

      if (response.ok && result.token && result.admin) {
        onSuccess({
          token: result.token,
          role: 'admin',
          id: result.admin.idAdmin,
          name: result.admin.name,
          mail: result.admin.mail,
        });
        return;
      }

      throw new Error(result.message || 'Correo o contraseña incorrectos.');
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-[#c2c9bb] bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 text-center">
        <span className="material-symbols-outlined text-4xl text-[#154212]">account_circle</span>
        <h1 className="mt-2 text-2xl font-bold text-[#154212]">
          Iniciar sesión
        </h1>
        <p className="mt-1 text-sm text-[#605e5b]">Ingresa con tu correo y contraseña.</p>
      </div>

      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <div>
          <label htmlFor="loginMail" className="mb-1 block text-sm font-semibold text-[#1b1c1c]">Correo electrónico</label>
          <input
            id="loginMail"
            type="email"
            autoComplete="username"
            required
            value={mail}
            onChange={(event) => setMail(event.target.value)}
            className="w-full rounded-lg border border-[#c2c9bb] bg-[#fbf9f8] px-3 py-2.5 text-[#1b1c1c] focus:border-[#154212] focus:outline-none focus:ring-2 focus:ring-[#154212]/20"
          />
        </div>
        <div>
          <label htmlFor="loginPassword" className="mb-1 block text-sm font-semibold text-[#1b1c1c]">Contraseña</label>
          <input
            id="loginPassword"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-[#c2c9bb] bg-[#fbf9f8] px-3 py-2.5 text-[#1b1c1c] focus:border-[#154212] focus:outline-none focus:ring-2 focus:ring-[#154212]/20"
          />
        </div>
        {error && <p role="alert" className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#93000a]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#154212] px-4 py-3 font-semibold text-white transition hover:bg-[#2d5a27] disabled:opacity-60"
        >
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between border-t border-[#e4e2e1] pt-4 text-sm">
        {onRegister ? (
          <button type="button" onClick={onRegister} className="font-medium text-[#154212] hover:underline">
            ¿No tienes cuenta? Crear usuario
          </button>
        ) : <span />}
        <button type="button" onClick={onCancel} className="text-[#605e5b] hover:text-[#154212]">Volver</button>
      </div>
    </section>
  );
}
