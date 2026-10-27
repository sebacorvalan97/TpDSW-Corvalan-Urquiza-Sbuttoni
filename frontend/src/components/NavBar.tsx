import type { AuthSession } from './AuthPanel';

type Tab = 'recipes' | 'ranking' | 'create' | 'register' | 'auth' | 'admin' | 'substitutes' | 'favorites' | 'discover';

interface Props {
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
  favoritesCount: number;
  authSession: AuthSession | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  favoritesCount,
  authSession,
  onSignIn,
  onSignOut,
}: Props) {
  const navButtonClass = (isActive: boolean) =>
    `border-b-2 pb-1 text-sm transition-colors ${
      isActive
        ? 'border-[#154212] font-bold text-[#154212]'
        : 'border-transparent font-medium text-[#42493e] hover:text-[#154212]'
    }`;

  return (
    <header className="sticky top-0 z-50 h-[72px] border-b border-[#e4e2e1] bg-white">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-6 px-4 md:px-8">
        <strong className="shrink-0 font-serif text-2xl font-normal text-[#154212] sm:text-3xl">El Bodegón Digital</strong>

        <nav aria-label="Navegación principal" className="hidden items-center gap-6 md:flex">
          <button type="button" onClick={() => setCurrentTab('recipes')} className={navButtonClass(currentTab === 'recipes')}>
            Recetas
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentTab('recipes');
              setTimeout(() => {
                const el = document.getElementById('categorias-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className={navButtonClass(false)}
          >
            Categorías
          </button>
        </nav>

        <nav aria-label="Acciones de cuenta" className="flex shrink-0 items-center gap-2 sm:gap-3">
          {authSession && (
          <button
            type="button"
            onClick={() => setCurrentTab('create')}
            className="hidden items-center gap-2 rounded-full bg-[#154212] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d5a27] sm:inline-flex"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Agregar receta
          </button>
          )}
        {!authSession && (
          <button
            type="button"
            onClick={() => setCurrentTab('register')}
           className="flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95"
          >
            <span className="material-symbols-outlined mr-1.5 text-lg">person_add</span>
            Crear usuario
          </button>
        )}
        {authSession?.role === 'admin' && (
          <button
            type="button"
            onClick={() => setCurrentTab('admin')}
            className="rounded-full border border-[#c2c9bb] px-3 py-2 text-sm font-medium text-[#154212] hover:bg-[#f6f3f2]"
          >
            Panel administrador
          </button>
        )}
        {authSession ? (
          <>
            {favoritesCount > 0 && <span className="hidden text-sm text-[#605e5b] lg:inline">{favoritesCount} favoritas</span>}
            <div className="flex items-center gap-2 rounded-full border border-[#c2c9bb] bg-[#f6f3f2] px-2 py-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#154212] text-sm font-bold text-white">
                {authSession.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden max-w-32 truncate text-sm font-medium text-[#1b1c1c] sm:inline">{authSession.name}</span>
              <button type="button" onClick={onSignOut} className="px-2 text-sm text-[#605e5b] hover:text-[#154212]">Salir</button>
            </div>
          </>
        ) : (
          <button type="button" onClick={onSignIn} className="rounded-full border border-[#c2c9bb] px-3 py-2 text-sm font-medium text-[#154212] hover:bg-[#f6f3f2]">
            Iniciar sesión
          </button>
        )}
        </nav>
      </div>
    </header>
  );
}
