import { useMemo, useState, type FormEvent } from 'react';
import type { AuthSession } from './AuthPanel';

interface UserFormState {
  name: string;
  lastName: string;
  birth: string;
  mail: string;
  password: string;
  passwordConfirm: string;
  state: 'active' | 'inactive';
  bio: string;
}

const initialForm: UserFormState = {
  name: '',
  lastName: '',
  birth: '',
  mail: '',
  password: '',
  passwordConfirm: '',
  state: 'active',
  bio: '',
};

const API_URL = 'http://localhost:8080/api/users';

interface Props {
  onRegistered: (session: AuthSession) => void;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);

export default function UserCrud({ onRegistered }: Props) {
  const [form, setForm] = useState<UserFormState>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const passwordChecks = useMemo(() => {
    const hasLen = form.password.length >= 8;
    const hasNum = /\d/.test(form.password);
    const hasSpecialOrUpper = /[A-Z]/.test(form.password) || /[^A-Za-z0-9]/.test(form.password);
    const score = [hasLen, hasNum, hasSpecialOrUpper].filter(Boolean).length;

    let strengthLabel = 'Sin ingresar';
    let strengthClass = 'text-[#72796e]';
    let indicatorClass = 'bg-transparent';
    let width = '0%';

    if (score === 1) {
      strengthLabel = 'Débil';
      strengthClass = 'text-[#ba1a1a]';
      indicatorClass = 'bg-[#ba1a1a]';
      width = '33%';
    } else if (score === 2) {
      strengthLabel = 'Aceptable';
      strengthClass = 'text-[#52320b]';
      indicatorClass = 'bg-[#ecb987]';
      width = '66%';
    } else if (score === 3) {
      strengthLabel = 'Robusta y Segura';
      strengthClass = 'text-[#154212]';
      indicatorClass = 'bg-[#2d5a27]';
      width = '100%';
    }

    return {
      hasLen,
      hasNum,
      hasSpecialOrUpper,
      score,
      strengthLabel,
      strengthClass,
      indicatorClass,
      width,
    };
  }, [form.password]);

  const handleInputChange = (field: keyof UserFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrorMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.password !== form.passwordConfirm) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.name.trim()} ${form.lastName.trim()}`.trim(),
          birth: form.birth,
          password: form.password,
          state: form.state,
          mail: form.mail.trim(),
          bio: form.bio.trim(),
        }),
      });

      const result = await response.json() as {
        token?: string;
        user?: { idUser: number; name: string; mail: string };
        message?: string;
      };
      if (!response.ok) {
        throw new Error(result.message || `El servidor respondió con el estado ${response.status}.`);
      }
      if (!result.token || !result.user) throw new Error('El servidor devolvió una respuesta incompleta.');

      onRegistered({
        token: result.token,
        role: 'user',
        id: result.user.idUser,
        name: result.user.name,
        mail: result.user.mail,
      });
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof TypeError
          ? 'No se pudo conectar con el servidor. Asegúrate de que el backend esté iniciado en el puerto 8080 e intenta nuevamente.'
          : error instanceof Error
            ? error.message
            : 'No se pudo crear el usuario. Verifica que el servidor esté disponible e intenta nuevamente.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fullName = `${form.name} ${form.lastName}`.trim() || 'Nombre y Apellido';
  const previewMail = form.mail.trim() || 'chef@elbodegondigital.com';
  const previewBio = form.bio.trim() || 'Aún no se ha redactado la biografía culinaria. La historia del chef se mostrará aquí...';
  const currentDate = formatDate(new Date());

  return (
    <section className="w-full max-w-5xl mx-auto px-1 sm:px-2">
      <div className="flex flex-col w-full pb-16">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <nav aria-label="Ruta de navegación" className="flex items-center space-x-2 text-sm text-[#605e5b] mb-2">
              <a href="#" className="hover:text-[#154212] transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">home</span>
                <span>Inicio</span>
              </a>
              <span className="text-[#c2c9bb]">/</span>
              <a href="#" className="hover:text-[#154212] transition-colors">Administración de Usuarios</a>
              <span className="text-[#c2c9bb]">/</span>
              <span aria-current="page" className="text-[#154212] font-semibold">Nuevo Usuario</span>
            </nav>
            <h1 className="font-[Playfair_Display] text-[2.25rem] leading-tight text-[#154212] tracking-tight">Crear Nuevo Usuario</h1>
            <p className="text-[#42493e] mt-1 max-w-2xl">
              Registra una nueva cuenta de chef o miembro del equipo en El Bodegón Digital para documentar y compartir tu tradición gastronómica.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 self-start md:self-center px-4 py-2 bg-[#f6f3f2] rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#154212] animate-pulse" />
            <span className="text-sm text-[#42493e]">
              Fecha de Alta: <strong className="text-[#1b1c1c] font-semibold">{currentDate}</strong>
            </span>
          </div>
        </header>

        <form className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8" onSubmit={(event) => void handleSubmit(event)}>
          <div className="lg:col-span-8 flex flex-col gap-8">
            <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8 flex flex-col relative overflow-hidden border border-[#e4e2e1]">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#154212]" />
              <div className="flex items-center justify-between pb-5 mb-6 bg-[#f6f3f2] -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-[#f0eded] flex items-center justify-center text-[#154212]">
                    <span className="material-symbols-outlined">badge</span>
                  </span>
                  <div>
                    <h2 className="text-[1.75rem] leading-tight text-[#1b1c1c]">1. Datos de Acceso y Cuenta</h2>
                    <p className="text-sm text-[#42493e]">Credenciales y estado operacional de la entidad Cuenta</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#f0eded] text-[#605e5b] text-sm font-semibold">
                  Requerido
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="accountMail" className="block text-sm font-semibold text-[#1b1c1c] mb-2">
                    Correo Electrónico <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72796e]">alternate_email</span>
                    <input
                      id="accountMail"
                      type="email"
                      value={form.mail}
                      onChange={(event) => handleInputChange('mail', event.target.value)}
                      className="w-full bg-[#f6f3f2] text-[#1b1c1c] rounded-lg py-3 pl-11 pr-4 placeholder:text-[#72796e]"
                      placeholder="chef@elbodegondigital.com"
                      required
                    />
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-[#42493e]">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Se empleará para iniciar sesión y sincronizar recetas privadas.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="accountPassword" className="block text-sm font-semibold text-[#1b1c1c] mb-2">
                      Contraseña <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72796e]">key</span>
                      <input
                        id="accountPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(event) => handleInputChange('password', event.target.value)}
                        className="w-full bg-[#f6f3f2] text-[#1b1c1c] rounded-lg py-3 pl-11 pr-11 placeholder:text-[#72796e]"
                        placeholder="••••••••••••"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        aria-label="Alternar visibilidad de contraseña"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#72796e] hover:text-[#154212]"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        <span className="material-symbols-outlined text-base">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="accountPasswordConfirm" className="block text-sm font-semibold text-[#1b1c1c] mb-2">
                      Confirmar Contraseña <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72796e]">lock_reset</span>
                      <input
                        id="accountPasswordConfirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.passwordConfirm}
                        onChange={(event) => handleInputChange('passwordConfirm', event.target.value)}
                        className="w-full bg-[#f6f3f2] text-[#1b1c1c] rounded-lg py-3 pl-11 pr-11 placeholder:text-[#72796e]"
                        placeholder="••••••••••••"
                        required
                      />
                      <button
                        type="button"
                        aria-label="Alternar visibilidad de repetición de contraseña"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#72796e] hover:text-[#154212]"
                        onClick={() => setShowConfirmPassword((current) => !current)}
                      >
                        <span className="material-symbols-outlined text-base">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#f6f3f2] rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#42493e]">Fortaleza de contraseña:</span>
                    <span className={`text-sm font-semibold ${passwordChecks.strengthClass}`}>{passwordChecks.strengthLabel}</span>
                  </div>

                  <div className="w-full bg-[#e4e2e1] h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${passwordChecks.indicatorClass}`} style={{ width: passwordChecks.width }} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-sm text-[#42493e]">
                    <span className={`flex items-center gap-1 ${passwordChecks.hasLen ? 'text-[#154212]' : ''}`}>
                      <span className="material-symbols-outlined text-xs">{passwordChecks.hasLen ? 'check_circle' : 'radio_button_unchecked'}</span>
                      Mínimo 8 caracteres
                    </span>
                    <span className={`flex items-center gap-1 ${passwordChecks.hasNum ? 'text-[#154212]' : ''}`}>
                      <span className="material-symbols-outlined text-xs">{passwordChecks.hasNum ? 'check_circle' : 'radio_button_unchecked'}</span>
                      Al menos 1 número
                    </span>
                    <span className={`flex items-center gap-1 ${passwordChecks.hasSpecialOrUpper ? 'text-[#154212]' : ''}`}>
                      <span className="material-symbols-outlined text-xs">{passwordChecks.hasSpecialOrUpper ? 'check_circle' : 'radio_button_unchecked'}</span>
                      Símbolo o mayúscula
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#fbf9f8] rounded-lg gap-4">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-[#1b1c1c]">Estado inicial</span>
                    <p className="text-sm text-[#42493e]">La cuenta nueva se activa al completar el registro.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f1e3] px-4 py-2 text-sm font-semibold text-[#154212]">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Activa
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8 flex flex-col relative overflow-hidden border border-[#e4e2e1]">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2d5a27]" />
              <div className="flex items-center justify-between pb-5 mb-6 bg-[#f6f3f2] -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-[#f0eded] flex items-center justify-center text-[#2d5a27]">
                    <span className="material-symbols-outlined">person</span>
                  </span>
                  <div>
                    <h2 className="text-[1.75rem] leading-tight text-[#1b1c1c]">2. Datos Personales del Chef</h2>
                    <p className="text-sm text-[#42493e]">Identidad visible del responsable de la cuenta</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#e8f1e3] text-[#154212] text-sm font-semibold">
                  Opcional
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="userName" className="block text-sm font-semibold text-[#1b1c1c] mb-2">Nombre <span className="text-[#ba1a1a]">*</span></label>
                  <input
                    id="userName"
                    value={form.name}
                    onChange={(event) => handleInputChange('name', event.target.value)}
                    className="w-full bg-[#f6f3f2] text-[#1b1c1c] rounded-lg py-3 px-4 placeholder:text-[#72796e]"
                    placeholder="Ej: Mariana"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="userLastName" className="block text-sm font-semibold text-[#1b1c1c] mb-2">Apellido <span className="text-[#ba1a1a]">*</span></label>
                  <input
                    id="userLastName"
                    value={form.lastName}
                    onChange={(event) => handleInputChange('lastName', event.target.value)}
                    className="w-full bg-[#f6f3f2] text-[#1b1c1c] rounded-lg py-3 px-4 placeholder:text-[#72796e]"
                    placeholder="Ej: López"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="userBirth" className="block text-sm font-semibold text-[#1b1c1c] mb-2">Fecha de nacimiento</label>
                <input
                  id="userBirth"
                  type="date"
                  value={form.birth}
                  onChange={(event) => handleInputChange('birth', event.target.value)}
                  className="w-full md:max-w-sm bg-[#f6f3f2] text-[#1b1c1c] rounded-lg py-3 px-4"
                />
              </div>

              <div className="mt-6">
                <label htmlFor="userBio" className="block text-sm font-semibold text-[#1b1c1c] mb-2">Biografía culinaria</label>
                <textarea
                  id="userBio"
                  value={form.bio}
                  onChange={(event) => handleInputChange('bio', event.target.value.slice(0, 400))}
                  rows={5}
                  className="w-full bg-[#f6f3f2] text-[#1b1c1c] rounded-lg py-3 px-4 placeholder:text-[#72796e] resize-none"
                  placeholder="Contá tu herencia culinaria, especialidades y estilo..."
                />
                <div className="mt-2 flex items-center justify-between text-sm text-[#42493e]">
                  <span>{form.bio.length} / 400</span>
                  <span>Se guardará con el perfil del usuario</span>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="rounded-xl border border-[#e4e2e1] bg-white shadow-sm overflow-hidden">
              <div className="p-5 bg-[#f6f3f2] border-b border-[#e4e2e1]">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#605e5b]">Vista previa</p>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#154212] text-white flex items-center justify-center font-bold text-lg">
                    {fullName.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1b1c1c]">{fullName}</p>
                    <p className="text-sm text-[#42493e]">Chef / Equipo</p>
                  </div>
                </div>

                <div className="rounded-lg bg-[#f6f3f2] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#42493e]">
                    <span className="material-symbols-outlined text-base">mail</span>
                    <span>{previewMail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#42493e]">
                    <span className="material-symbols-outlined text-base">toggle_on</span>
                    <span>{form.state === 'active' ? 'Cuenta activa' : 'Cuenta inactiva'}</span>
                  </div>
                </div>

                <div className="bg-[#fbf9f8] rounded-lg p-4">
                  <p className="text-sm font-semibold text-[#1b1c1c] mb-2">Biografía</p>
                  <p className="text-sm leading-relaxed text-[#42493e] italic">“{previewBio}”</p>
                </div>

                <div className="pt-4 border-t border-[#e4e2e1] space-y-3">
                  <div className="flex items-center justify-between text-sm text-[#42493e]">
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">event</span> Alta Registro:</span>
                    <span className="font-medium text-[#1b1c1c]">{currentDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#42493e]">
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">toggle_on</span> Estado Entidad:</span>
                    <span className="font-medium text-[#154212]">{form.state === 'active' ? 'ACTIVO' : 'INACTIVO'}</span>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-[#f6f3f2] flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#52320b] text-2xl">verified_user</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1b1c1c]">Tradición Segura</span>
                    <span className="text-xs text-[#42493e]">Cifrado de credenciales de acuerdo con el estándar de despensa.</span>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#f6f3f2] to-[#fbf9f8] text-[#1b1c1c]">
                  <div className="flex items-center gap-2 text-[#154212] mb-1">
                    <span className="material-symbols-outlined text-sm">menu_book</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em]">Sabiduría del Fogón</span>
                  </div>
                  <p className="text-sm italic text-[#42493e]">
                    “Una receta no tiene alma; es el cocinero quien le infunde espíritu y memoria.”
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e4e2e1] bg-white shadow-sm p-5">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#154212] text-white font-semibold py-3 rounded-lg hover:bg-[#2d5a27] transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creando usuario...' : 'Registrar Usuario'}
              </button>
              {form.password !== form.passwordConfirm && form.passwordConfirm.length > 0 && (
                <p className="mt-3 text-sm text-[#ba1a1a]">Las contraseñas no coinciden.</p>
              )}
              {errorMessage && (
                <p role="alert" className="mt-3 rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#93000a]">{errorMessage}</p>
              )}
            </div>
          </aside>
        </form>

      </div>
    </section>
  );
}
