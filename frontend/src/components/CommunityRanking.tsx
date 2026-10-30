import { useMemo } from 'react';
import type { Categoria, Origen, Receta } from '../types';

interface Props {
  recetas: Receta[];
  categorias: Categoria[];
  origenes: Origen[];
  onSelectRecipe: (recipe: Receta) => void;
}

export default function CommunityRanking({ recetas, categorias, origenes, onSelectRecipe }: Props) {
  // Ordenar recetas por calificación promedio descendente y luego por total de calificaciones
  const rankedRecipes = useMemo(() => {
    return [...recetas].sort((a, b) => {
      if (b.calificacionPromedio !== a.calificacionPromedio) {
        return b.calificacionPromedio - a.calificacionPromedio;
      }
      return b.totalCalificaciones - a.totalCalificaciones;
    });
  }, [recetas]);

  const getCategoryName = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? 'General';
  const getOriginName = (id: string, origenesIds?: string[]) => {
    const list = origenes.filter((o) => o.id === id || origenesIds?.includes(o.id));
    return list.map((o) => o.pais || o.nombre).filter(Boolean).join(', ') || 'Tradicional';
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          icon: '🥇',
          label: '1° Lugar - Obra Maestra',
          cardStyle: 'border-amber-400/80 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 shadow-md',
          badgeStyle: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        };
      case 1:
        return {
          icon: '🥈',
          label: '2° Lugar - Destacada',
          cardStyle: 'border-slate-300 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/20 shadow-sm',
          badgeStyle: 'bg-slate-200 text-slate-800 border-slate-300 font-bold',
        };
      case 2:
        return {
          icon: '🥉',
          label: '3° Lugar - Favorita',
          cardStyle: 'border-amber-700/30 bg-gradient-to-br from-amber-900/5 via-white to-amber-900/5 shadow-sm',
          badgeStyle: 'bg-amber-100/70 text-amber-900 border-amber-600/30 font-bold',
        };
      default:
        return {
          icon: `#${index + 1}`,
          label: `${index + 1}° Puesto`,
          cardStyle: 'border-[#c2c9bb]/50 bg-white hover:border-[#154212]/40',
          badgeStyle: 'bg-[#f0eded] text-[#605e5b] border-transparent font-medium',
        };
    }
  };

  return (
    <section className="space-y-6">
      {/* Encabezado del Ranking */}
      <div className="rounded-2xl border border-[#c2c9bb]/60 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-amber-500">trophy</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#154212]">Ranking de la Comunidad</h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#605e5b]">
              Las creaciones culinarias mejor calificadas y más queridas por los comensales de El Bodegón Digital
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto rounded-xl bg-[#bcf0ae]/20 border border-[#bcf0ae] px-4 py-2 text-xs font-semibold text-[#154212]">
            <span className="material-symbols-outlined text-base">star</span>
            <span>{rankedRecipes.length} Recetas Evaluadas</span>
          </div>
        </div>
      </div>

      {/* Listado de recetas en orden de ranking */}
      {rankedRecipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#c2c9bb] p-8">
          <span className="material-symbols-outlined text-4xl text-[#72796e]">reviews</span>
          <h3 className="font-serif text-lg font-bold text-[#154212] mt-2">Aún no hay recetas en el ranking</h3>
          <p className="text-xs text-[#605e5b] mt-1">Sé el primero en calificar una receta para verla en el podio.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rankedRecipes.map((recipe, index) => {
            const rank = getRankBadge(index);
            const totalMinutos = recipe.tiempoPreparacionMin + recipe.tiempoCoccionMin;

            return (
              <article
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe)}
                className={`group flex flex-col sm:flex-row items-center gap-4 sm:gap-6 rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${rank.cardStyle}`}
              >
                {/* Posición / Medalla */}
                <div className="flex sm:flex-col items-center justify-center shrink-0 w-full sm:w-20 text-center gap-2 sm:gap-1 border-b sm:border-b-0 sm:border-r border-[#c2c9bb]/30 pb-3 sm:pb-0 sm:pr-3">
                  <span className="text-3xl" role="img" aria-label={rank.label}>
                    {rank.icon}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${rank.badgeStyle}`}>
                    {rank.label}
                  </span>
                </div>

                {/* Imagen del plato */}
                {recipe.plato.imagenUrl ? (
                  <img
                    src={recipe.plato.imagenUrl}
                    alt={recipe.plato.nombre}
                    className="h-28 w-28 sm:h-24 sm:w-24 rounded-xl object-cover shrink-0 border border-[#c2c9bb]/40 shadow-xs group-hover:scale-102 transition"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-xl bg-[#f0eded] flex items-center justify-center text-[#72796e] shrink-0 border border-[#c2c9bb]/40">
                    <span className="material-symbols-outlined text-3xl">restaurant</span>
                  </div>
                )}

                {/* Detalles de la receta */}
                <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="rounded-full bg-[#154212]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#154212]">
                      {getCategoryName(recipe.plato.categoriaId)}
                    </span>
                    <span className="text-xs text-[#72796e] font-medium">
                      {getOriginName(recipe.plato.origenId, recipe.plato.origenesIds)}
                    </span>
                    <span className="text-xs text-[#72796e]">·</span>
                    <span className="flex items-center gap-1 text-xs text-[#605e5b]">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {totalMinutos} min
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1b1c1c] group-hover:text-[#154212] transition-colors truncate">
                    {recipe.plato.nombre}
                  </h3>

                  <p className="mt-1 text-xs text-[#605e5b] line-clamp-2 leading-relaxed">
                    {recipe.plato.descripcion}
                  </p>

                  <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <span>★</span>
                      <span>{recipe.calificacionPromedio.toFixed(1)}</span>
                    </div>
                    <span className="text-[#605e5b]">
                      ({recipe.totalCalificaciones} {recipe.totalCalificaciones === 1 ? 'opinión' : 'opiniones'})
                    </span>
                    <span className="text-[#72796e]">·</span>
                    <span className="text-[#72796e] italic">
                      Por {recipe.creadorNombre}
                    </span>
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="shrink-0 self-stretch sm:self-center flex sm:flex-col justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRecipe(recipe);
                    }}
                    className="w-full sm:w-auto rounded-xl bg-[#154212] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2d5a27] transition flex items-center justify-center gap-1.5"
                  >
                    <span>Ver Receta</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
