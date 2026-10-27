// Etiquetas destacadas que se muestran en el panel lateral de Descubrir.
import type { Receta } from '../types';

const tags = ['Italiana', 'Vegana', 'Rápida', 'Verano'];

// Propiedades requeridas por esta vista; permite solicitar al padre que abra el asistente de recetas.
interface Props {
  recetas: Receta[];
  onAddRecipe: () => void;
}

// Pantalla de exploración con navegación, búsqueda, filtros, estado vacío y acceso a crear receta.
export default function RecipeDiscover({ recetas, onAddRecipe }: Props) {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md overflow-x-hidden">
      {/* Cabecera del sitio: marca, navegación de escritorio y acceso para agregar una receta. */}
      <header className="bg-surface-bright shadow-sm sticky top-0 z-50">
        {/* Navegación superior con enlaces de sección y acción para abrir la creación. */}
        <nav className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="font-display-lg text-3xl text-primary">El Bodegón Digital</div>

          <div className="hidden md:flex items-center space-x-6">
            <a className="text-secondary font-medium pb-1 hover:text-primary-container transition-colors duration-200" href="#">
              Mis recetas
            </a>
            <a className="text-primary font-bold border-b-2 border-primary pb-1 hover:text-primary-container transition-colors duration-200" href="#">
              Descubrir
            </a>
            <a className="text-secondary font-medium pb-1 hover:text-primary-container transition-colors duration-200" href="#">
              Categorías
            </a>
            <a className="text-secondary font-medium pb-1 hover:text-primary-container transition-colors duration-200" href="#">
              Mi despensa
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <button className="hidden lg:flex items-center bg-primary text-on-primary px-3 py-2 rounded-lg font-label-md hover:opacity-90 active:scale-95 transition-all" onClick={onAddRecipe} type="button">
              <span className="material-symbols-outlined mr-2">add</span>
              Agregar receta
            </button>
            <img
              alt="Avatar del perfil de usuario"
              className="w-10 h-10 rounded-full border-2 border-primary-fixed"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoX8SbFpL87nYpd0FHrqlUf_9ncajNhyIpo_Mg8EZEl748nutxgr89UwzC_vkX-R7Ko77ihdIJCkrJnNSqEeR5ViybSCx9eX_gUWOH1S9o1RA9EEd_98d4omAR_EvjPJwPoYXi20unabilMaw3ycBPLovJaSje3PPKCMpolHK8hcI2AQ1LNtOpF_77aCpvoHfz-SuC-sfaFgRWztiDPn28wNOX9s_Ho8mRuD95Wv1JEKxsdu5gUnoo"
            />
          </div>
        </nav>
      </header>

      {/* Cuerpo de Descubrir: menú de escritorio a la izquierda y herramientas de exploración al centro. */}
      <div className="flex max-w-7xl mx-auto px-4 md:px-8 min-h-screen">
        {/* Navegación lateral y etiquetas de interés, visibles en pantallas grandes. */}
        <aside className="hidden lg:flex flex-col h-[calc(100vh-80px)] w-64 sticky top-20 py-8 px-4 space-y-4 bg-surface-container-low border-r border-outline-variant">
          <div className="pb-4">
            <h3 className="font-headline-md text-2xl text-primary">Mi cocina</h3>
            <p className="font-label-md text-sm text-on-surface-variant opacity-70">Chef de cocina</p>
          </div>

          <nav className="space-y-2 flex-1">
            <a className="flex items-center p-3 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors" href="#">
              <span className="material-symbols-outlined mr-3">book</span>
              <span className="font-label-md">Mis recetas</span>
            </a>
            <a className="flex items-center p-3 bg-primary-container text-on-primary-container rounded-lg font-bold translate-x-1 transition-transform" href="#">
              <span className="material-symbols-outlined mr-3">explore</span>
              <span className="font-label-md">Descubrir</span>
            </a>
            <a className="flex items-center p-3 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors" href="#">
              <span className="material-symbols-outlined mr-3">category</span>
              <span className="font-label-md">Categorías</span>
            </a>
            <a className="flex items-center p-3 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors" href="#">
              <span className="material-symbols-outlined mr-3">kitchen</span>
              <span className="font-label-md">Mi despensa</span>
            </a>
          </nav>

          {/* Lista de etiquetas populares usada como guía visual para explorar recetas. */}
          <div className="pt-6 border-t border-outline-variant">
            <p className="font-label-sm uppercase tracking-widest mb-3 text-on-surface-variant">Etiquetas populares</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="bg-tertiary/10 text-tertiary px-2 py-1 rounded-full text-xs font-semibold">
                  {tag}
                </span>
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
          {/* Herramientas de descubrimiento: campo de búsqueda y filtros de ejemplo. */}
          <section className="mb-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">search</span>
              </div>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all text-body-lg"
                placeholder="Buscar recetas, ingredientes o tipos de cocina..."
                type="text"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {['Categoría', 'Dificultad', 'Origen', 'Tiempo de preparación'].map((filter) => (
                <div key={filter} className="relative group/filter">
                  <button className="flex items-center bg-surface-container-lowest border border-outline-variant px-3 py-2 rounded-lg hover:bg-surface-container hover:shadow-sm transition-all">
                    <span className="font-label-md mr-2">{filter}</span>
                    <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                  </button>
                </div>
              ))}

              <div className="h-6 w-px bg-outline-variant mx-2" />
              <button type="button" className="text-primary font-label-md hover:underline">
                Borrar todo
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
                <article className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm" key={receta.id}>
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
        <button type="button" className="flex flex-col items-center justify-center text-secondary">
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
        <button type="button" className="flex flex-col items-center justify-center text-secondary">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-label-sm text-[10px]">Categorías</span>
        </button>
        <button type="button" className="flex flex-col items-center justify-center text-secondary">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="font-label-sm text-[10px]">Despensa</span>
        </button>
      </nav>
    </div>
  );
}
