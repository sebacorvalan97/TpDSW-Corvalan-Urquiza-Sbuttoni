// Etiquetas destacadas que se muestran en el panel lateral de Descubrir.
import type { Receta } from '../types';
import type { AuthSession } from './AuthPanel';

const tags = ['Italiana', 'Vegana', 'Rápida', 'Verano'];

// Propiedades requeridas por esta vista; permite solicitar al padre que abra el asistente de recetas.
interface Props {
  recetas: Receta[];
  onAddRecipe: () => void;
  onShowRecipes: () => void;
  onCreateUser: () => void;
  onAdmin: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onSelectRecipe?: (receta: Receta) => void;
  onSearch?: (query: string) => void;
  onNavigateCategories?: () => void;
  onNavigatePantry?: () => void;
  authSession: AuthSession | null;
  errorMessage?: string;
}

// Pantalla de exploración con navegación, búsqueda, filtros, estado vacío y acceso a crear receta.
export default function RecipeDiscover({
  recetas,
  onAddRecipe,
  onShowRecipes,
  onCreateUser,
  onAdmin,
  onSignIn,
  onSignOut,
  onSelectRecipe,
  onSearch,
  onNavigateCategories,
  onNavigatePantry,
  authSession,
  errorMessage,
}: Props) {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md overflow-x-hidden">
      {/* Cabecera del sitio: marca, navegación de escritorio y acceso para agregar una receta. */}
      <header className="bg-surface-bright shadow-sm sticky top-0 z-50">
        {/* Navegación superior con enlaces de sección y acción para abrir la creación. */}
        <nav className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="font-display-lg text-3xl text-primary">El Bodegón Digital</div>

          <div className="hidden md:flex items-center space-x-6">
            
            <button className="text-secondary font-medium pb-1 hover:text-primary-container transition-colors duration-200" onClick={onShowRecipes} type="button">
              Recetas
            </button>
            <button className="text-primary font-bold border-b-2 border-primary pb-1 hover:text-primary-container transition-colors duration-200" type="button">
              Descubrir
            </button>
            <button className="text-secondary font-medium pb-1 hover:text-primary-container transition-colors duration-200" onClick={onNavigateCategories ?? onShowRecipes} type="button">
              Categorías
            </button>
          
          </div>
           
          <div className="flex items-center space-x-3">
            {authSession && (
            <button className="hidden lg:flex items-center bg-primary text-on-primary px-3 py-2 rounded-lg font-label-md hover:opacity-90 active:scale-95 transition-all" onClick={onAddRecipe} type="button">
              <span className="material-symbols-outlined mr-2">add</span>
              Agregar receta
            </button>
            )}
            
            {!authSession && (
              <button
                type="button"
                onClick={onCreateUser}
                className="flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95"
              >
                <span className="material-symbols-outlined mr-1.5 text-lg">person_add</span>
                Crear usuario
              </button>
            )}
            {authSession?.role === 'admin' && (
              <button
                type="button"
                onClick={onAdmin}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-medium text-primary hover:bg-surface-container-low"
              >
                Panel administrador
              </button>
            )}
            {authSession ? (
              <div className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-2 py-1">
                <span
                  aria-label={`Perfil de ${authSession.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-fixed bg-primary font-semibold text-on-primary"
                >
                  {authSession.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-32 truncate text-sm font-medium text-on-surface sm:inline">
                  {authSession.name}
                </span>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="rounded-full px-2 py-1 text-sm font-medium text-secondary hover:bg-surface-container-high"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button type="button" onClick={onSignIn} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-medium text-primary">
                Iniciar sesión
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Cuerpo de Descubrir: menú de escritorio a la izquierda y herramientas de exploración al centro. */}
      <div className="flex max-w-7xl mx-auto px-4 md:px-8 min-h-screen">
        {/* Navegación lateral y etiquetas de interés, visibles en pantallas grandes. */}
        <aside className="hidden lg:flex flex-col h-[calc(100vh-80px)] w-64 sticky top-20 py-8 px-4 space-y-4 bg-surface-container-low border-r border-outline-variant">
          <div className="pb-4">
            <h3 className="font-headline-md text-2xl text-primary">Mi cocina</h3>
            <p className="font-label-md text-sm text-on-surface-variant opacity-70">Descubre recetas</p>
          </div>

          <nav className="space-y-2 flex-1">
            <button className="flex w-full items-center p-3 text-left text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors" onClick={onShowRecipes} type="button">
              <span className="material-symbols-outlined mr-3">book</span>
              <span className="font-label-md">Recetas</span>
            </button>
            <button className="flex w-full items-center p-3 bg-primary-container text-on-primary-container rounded-lg font-bold translate-x-1 transition-transform text-left" type="button">
              <span className="material-symbols-outlined mr-3">explore</span>
              <span className="font-label-md">Descubrir</span>
            </button>
            <button className="flex w-full items-center p-3 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors text-left" onClick={onNavigateCategories ?? onShowRecipes} type="button">
              <span className="material-symbols-outlined mr-3">category</span>
              <span className="font-label-md">Categorías</span>
            </button>
            {authSession && (
              <button className="flex w-full items-center p-3 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors text-left" onClick={onNavigatePantry} type="button">
                <span className="material-symbols-outlined mr-3">kitchen</span>
                <span className="font-label-md">Mi despensa</span>
              </button>
            )}
          </nav>

          {/* Lista de etiquetas populares usada como guía visual para explorar recetas. */}
          <div className="pt-6 border-t border-outline-variant">
            <p className="font-label-sm uppercase tracking-widest mb-3 text-on-surface-variant">Etiquetas populares</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSearch?.(tag)}
                  className="bg-tertiary/10 text-tertiary hover:bg-tertiary/20 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4">
            <a className="flex items-center p-3 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors" href="#">
              <span className="material-symbols-outlined mr-3">settings</span>
              <span className="font-label-md">Configuración</span>
            </a>
            <a className="flex items-center p-3 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors" href="#">
              <span className="material-symbols-outlined mr-3">help</span>
              <span className="font-label-md">Ayuda</span>
            </a>
          </div>
        </aside>

        {/* Área principal con búsqueda, filtros disponibles y mensaje cuando no hay recetas. */}
        <main className="flex-1 py-4 lg:pl-8">
          {errorMessage && <p className="mb-4 rounded-lg bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]" role="alert">{errorMessage}</p>}
          {/* Herramientas de descubrimiento: campo de búsqueda y filtros de ejemplo. */}
          <section className="mb-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">search</span>
              </div>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all text-body-lg"
                placeholder="Buscar recetas, ingredientes o tipos de cocina (presiona Enter)..."
                type="text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearch?.((e.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onShowRecipes}
                className="flex items-center bg-surface-container-lowest border border-outline-variant px-3 py-2 rounded-lg hover:bg-surface-container hover:shadow-sm transition-all text-xs font-semibold text-primary"
              >
                <span className="material-symbols-outlined mr-1.5 text-base">tune</span>
                <span>Filtrar por Categoría, Origen o Dificultad</span>
              </button>
            </div>
          </section>

          {/* Muestra las recetas que App mantiene en estado o una invitación a crear la primera. */}
          {recetas.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <span className="material-symbols-outlined mb-3 text-4xl text-secondary">menu_book</span>
              <h2 className="font-headline-md text-xl text-primary">Todavía no hay recetas</h2>
              <p className="mt-2 max-w-md text-sm text-on-surface-variant">
                Las recetas aparecerán aquí cuando se agreguen.
              </p>
            </div>
          ) : (
            <section aria-label="Recetas disponibles" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {recetas.map((receta) => (
                <article
                  className="cursor-pointer overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  key={receta.id}
                  onClick={() => onSelectRecipe?.(receta)}
                >
                  {receta.plato.imagenUrl && (
                    <img
                      alt={`Imagen de ${receta.plato.nombre}`}
                      className="h-48 w-full object-cover"
                      src={receta.plato.imagenUrl}
                    />
                  )}
                  <div className="p-5">
                    <h2 className="font-headline-md text-xl text-primary">{receta.plato.nombre}</h2>
                    <p className="mt-2 line-clamp-3 text-sm text-on-surface-variant">{receta.plato.descripcion}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-secondary">
                      <span>{receta.ingredientes.length} ingredientes</span>
                      <span aria-hidden="true">·</span>
                      <span>{receta.pasos.length} pasos</span>
                      <span aria-hidden="true">·</span>
                      <span>{receta.calificacionPromedio.toFixed(1)} ★</span>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </main>
      </div>

      {/* Navegación inferior móvil; el botón Crear invoca la acción recibida desde App. */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-container-lowest shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-xl">
        <button type="button" className="flex flex-col items-center justify-center text-secondary" onClick={onShowRecipes}>
          <span className="material-symbols-outlined">menu_book</span>
          <span className="font-label-sm text-[10px]">Recetas</span>
        </button>
        <button type="button" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 active:scale-90 duration-150">
          <span className="material-symbols-outlined">search</span>
          <span className="font-label-sm text-[10px]">Descubrir</span>
        </button>
        <button type="button" className="flex flex-col items-center justify-center text-secondary" onClick={onAddRecipe}>
          <span className="material-symbols-outlined">add_circle</span>
          <span className="font-label-sm text-[10px]">Crear</span>
        </button>
        <button type="button" className="flex flex-col items-center justify-center text-secondary" onClick={onNavigateCategories ?? onShowRecipes}>
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-label-sm text-[10px]">Categorías</span>
        </button>
        {authSession && (
          <button type="button" className="flex flex-col items-center justify-center text-secondary" onClick={onNavigatePantry}>
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-sm text-[10px]">Despensa</span>
          </button>
        )}
      </nav>
    </div>
  );
}
