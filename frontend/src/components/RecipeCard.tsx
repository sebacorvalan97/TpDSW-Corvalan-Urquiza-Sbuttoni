import type { Categoria, Dificultad, Origen, Receta } from '../types';

interface Props {
  receta: Receta;
  categorias: Categoria[];
  origenes: Origen[];
  dificultades: Dificultad[];
  onSelect: (recipe: Receta) => void;
  onToggleFavorite: (id: string) => void;
  onStartCooking: (recipe: Receta) => void;
}

export default function RecipeCard({
  receta,
  categorias,
  origenes,
  dificultades,
  onSelect,
  onToggleFavorite,
  onStartCooking,
}: Props) {
  const category = categorias.find((c) => c.id === receta.plato.categoriaId);
  const origin = origenes.find((o) => o.id === receta.plato.origenId);
  const difficulty = dificultades.find((d) => d.id === receta.plato.dificultadId);
  const totalTime = (receta.tiempoPreparacionMin || 0) + (receta.tiempoCoccionMin || 0);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#c2c9bb]/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Imagen de la receta o fondo ilustrativo */}
      <div className="relative h-48 w-full overflow-hidden bg-[#f0eded]">
        {receta.plato.imagenUrl ? (
          <img
            src={receta.plato.imagenUrl}
            alt={receta.plato.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#154212]/10 to-[#bcf0ae]/30 text-[#154212]">
            <span className="material-symbols-outlined text-5xl opacity-40">restaurant</span>
          </div>
        )}

        {/* Botón de favorito flotante */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(receta.id);
          }}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-90 ${
            receta.esFavorito
              ? 'bg-red-50 text-red-600 shadow-md'
              : 'bg-white/80 text-[#605e5b] hover:bg-white hover:text-red-600'
          }`}
          title={receta.esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          aria-label={receta.esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <span className={`material-symbols-outlined text-xl ${receta.esFavorito ? 'font-fill' : ''}`}>
            favorite
          </span>
        </button>

        {/* Badges de Categoría y Origen */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {category && (
            <span className="rounded-full bg-[#154212]/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">
              {category.nombre}
            </span>
          )}
          {origin && (
            <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-[#154212] shadow-sm backdrop-blur-sm">
              {origin.bandera ? `${origin.bandera} ` : '📍 '}{origin.pais}
            </span>
          )}
        </div>
      </div>

      {/* Contenido principal de la tarjeta */}
      <div className="flex flex-1 flex-col p-5">
        <h3
          onClick={() => onSelect(receta)}
          className="cursor-pointer font-serif text-lg font-bold text-[#154212] transition-colors hover:text-[#2d5a27] line-clamp-1"
          title={receta.plato.nombre}
        >
          {receta.plato.nombre}
        </h3>

        <p className="mt-1.5 flex-1 text-xs text-[#605e5b] line-clamp-2 leading-relaxed">
          {receta.plato.descripcion || 'Sin descripción disponible.'}
        </p>

        {/* Metadatos: tiempo, dificultad y calificación */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#f0eded] pt-3 text-xs text-[#42493e]">
          {totalTime > 0 && (
            <div className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-sm text-[#72796e]">schedule</span>
              <span>{totalTime} min</span>
            </div>
          )}

          {difficulty && (
            <div className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-sm text-[#72796e]">trending_up</span>
              <span>{difficulty.nivel}</span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1 font-bold text-amber-700">
            <span className="material-symbols-outlined text-sm text-amber-500 font-fill">star</span>
            <span>{receta.calificacionPromedio.toFixed(1)}</span>
            <span className="text-[10px] font-normal text-[#72796e]">({receta.totalCalificaciones})</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-4 flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => onSelect(receta)}
            className="flex-1 rounded-xl bg-[#f6f3f2] py-2 text-center text-xs font-bold text-[#154212] transition hover:bg-[#bcf0ae] active:scale-98"
          >
            Ver detalle
          </button>
          <button
            type="button"
            onClick={() => onStartCooking(receta)}
            className="flex items-center justify-center gap-1 rounded-xl bg-[#154212] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2d5a27] active:scale-98"
            title="Modo cocina paso a paso"
          >
            <span>Cocinar</span>
            <span className="material-symbols-outlined text-sm">play_arrow</span>
          </button>
        </div>
      </div>
    </article>
  );
}
