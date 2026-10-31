import { useState, useEffect, type FormEvent } from 'react';
import type { Categoria, Comentario, Dificultad, Ingrediente, Origen, Receta, Usuario } from '../types';

interface Props {
  receta: Receta;
  categorias: Categoria[];
  origenes: Origen[];
  dificultades: Dificultad[];
  todosIngredientes?: Ingrediente[];
  comentarios: Comentario[];
  currentUser: Usuario;
  onClose: () => void;
  onToggleFavorite: (id: string) => Promise<void>;
  onAddComment: (id: string, rating: number, text: string) => Promise<void>;
  onLikeComment: (id: string) => Promise<void>;
  onEditRecipe: (recipe: Receta) => void;
  onDeleteRecipe: (id: string) => void;
  initialCookingMode?: boolean;
  isFavorite: boolean;
  errorMessage: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function RecipeDetailModal({
  receta,
  categorias,
  origenes,
  dificultades,
  comentarios,
  currentUser,
  onClose,
  onToggleFavorite,
  onAddComment,
  onLikeComment,
  onEditRecipe,
  onDeleteRecipe,
  initialCookingMode = false,
  isFavorite,
  errorMessage,
  canEdit = false,
  canDelete = false,
}: Props) {
  // Estado para el modo de cocina interactivo
  const [isCookingMode, setIsCookingMode] = useState<boolean>(initialCookingMode);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [isCookingFinished, setIsCookingFinished] = useState<boolean>(false);

  // Estado para calificación y comentarios
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [text, setText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Atajos de teclado para el Modo Cocina
  useEffect(() => {
    if (!isCookingMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        const total = receta.pasos.length;
        setCurrentStepIndex((prev) => {
          if (prev < total - 1) return prev + 1;
          setIsCookingFinished(true);
          return prev;
        });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : 0));
        setIsCookingFinished(false);
      } else if (e.key === 'Escape') {
        setIsCookingMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCookingMode, receta.pasos.length]);

  const toggleIngredientCheck = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const commentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddComment(receta.id, rating, text);
      setText('');
      setRating(5);
    } catch {
      // El componente padre muestra el error y preserva el borrador.
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryName = categorias.find((category) => category.id === receta.plato.categoriaId)?.nombre;
  const primaryOrigin = origenes.find((origin) => origin.id === receta.plato.origenId);
  const difficultyName = dificultades.find((difficulty) => difficulty.id === receta.plato.dificultadId)?.nivel;

  const allOriginNames = origenes
    .filter((o) => o.id === receta.plato.origenId || (receta.plato.origenesIds && receta.plato.origenesIds.includes(o.id)))
    .map((o) => `${o.bandera ? `${o.bandera} ` : ''}${o.pais}${o.nombre ? ` (${o.nombre})` : ''}`)
    .join(', ');

  const steps = receta.pasos;
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 100;

  return (
    <div
      aria-labelledby="recipe-detail-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      onClick={onClose}
    >
      <section
        className="w-full max-w-3xl rounded-3xl border border-[#c2c9bb]/60 bg-white p-5 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto my-auto"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-start justify-between gap-4 border-b border-[#f0eded] pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {categoryName && (
                <span className="rounded-full bg-[#154212] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                  {categoryName}
                </span>
              )}
              {(allOriginNames || primaryOrigin) && (
                <span className="rounded-full bg-[#bcf0ae]/50 px-2.5 py-0.5 text-[11px] font-bold text-[#154212]">
                  {allOriginNames || `${primaryOrigin?.bandera ? `${primaryOrigin.bandera} ` : ''}${primaryOrigin?.pais}`}
                </span>
              )}
              {difficultyName && (
                <span className="rounded-full bg-[#f0eded] px-2.5 py-0.5 text-[11px] font-semibold text-[#42493e]">
                  {difficultyName}
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#154212]" id="recipe-detail-title">
              {receta.plato.nombre}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#605e5b] pt-0.5">
              {receta.creadorNombre && (
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-xs">person</span>
                  Por {receta.creadorNombre}
                </span>
              )}
              <span className="flex items-center gap-1 font-bold text-amber-700">
                <span className="material-symbols-outlined text-xs text-amber-500 font-fill">star</span>
                {receta.calificacionPromedio.toFixed(1)} ({receta.totalCalificaciones} opiniones)
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">schedule</span>
                {receta.tiempoPreparacionMin + receta.tiempoCoccionMin} minutos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botón para alternar Modo Cocina */}
            <button
              type="button"
              onClick={() => {
                setIsCookingMode((prev) => !prev);
                setIsCookingFinished(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-xs ${
                isCookingMode
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-[#154212] text-white hover:bg-[#2d5a27]'
              }`}
              title={isCookingMode ? 'Salir del modo cocina' : 'Iniciar modo cocina paso a paso'}
            >
              <span className="material-symbols-outlined text-base">
                {isCookingMode ? 'menu_book' : 'soup_kitchen'}
              </span>
              <span className="hidden sm:inline">
                {isCookingMode ? 'Vista Normal' : 'Modo Cocina'}
              </span>
            </button>

            <button
              aria-label="Cerrar detalle"
              className="rounded-full p-1.5 text-gray-500 hover:bg-[#f6f3f2] hover:text-gray-800 transition"
              onClick={onClose}
              type="button"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO CONDICIONAL: MODO COCINA vs VISTA NORMAL */}
        {isCookingMode ? (
          /* ----------------- MODO COCINA PASO A PASO ----------------- */
          <div className="mt-5 space-y-6 animate-in fade-in duration-300">
            {/* Barra de Progreso */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-[#154212]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-amber-600">timer</span>
                  Modo Cocina en Curso
                </span>
                <span>Paso {currentStepIndex + 1} de {totalSteps} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-[#f0eded] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#154212] to-[#427a3c] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Tarjeta del Paso Activo */}
            <div className="rounded-2xl border-2 border-[#154212]/30 bg-gradient-to-br from-[#fbf9f8] to-[#f4f7f2] p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#154212] text-white text-xs font-bold tracking-wider uppercase">
                  Paso {currentStepIndex + 1}
                </span>
                <span className="text-xs text-[#72796e]">
                  Usa las flechas ◀ ▶ o Espacio
                </span>
              </div>

              <p className="text-base sm:text-lg text-[#1b1c1c] font-medium leading-relaxed min-h-[90px] flex items-center">
                {steps[currentStepIndex] || 'No hay instrucciones para este paso.'}
              </p>

              {/* Botones de Navegación del Paso */}
              <div className="flex items-center justify-between pt-4 border-t border-[#c2c9bb]/40">
                <button
                  type="button"
                  disabled={currentStepIndex === 0}
                  onClick={() => {
                    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
                    setIsCookingFinished(false);
                  }}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-[#154212] border border-[#c2c9bb] bg-white hover:bg-[#f6f3f2] disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  <span>Anterior</span>
                </button>

                {currentStepIndex < totalSteps - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1))}
                    className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#154212] hover:bg-[#2d5a27] shadow-sm transition active:scale-95"
                  >
                    <span>Siguiente Paso</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCookingFinished(true)}
                    className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>¡Plato Completado!</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mensaje de finalización si se completó */}
            {isCookingFinished && (
              <div className="rounded-2xl bg-[#bcf0ae]/40 border border-[#154212]/30 p-5 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <span className="text-3xl">🎉 👨‍🍳 🍽️</span>
                <h4 className="font-serif text-lg font-bold text-[#154212]">¡Felicitaciones! Receta terminada</h4>
                <p className="text-xs text-[#42493e]">
                  Completaste todos los pasos de <strong>{receta.plato.nombre}</strong>. ¡Que disfrutes tu comida!
                </p>
              </div>
            )}

            {/* Checklist rápido de ingredientes durante la cocción */}
            <div className="rounded-2xl border border-[#c2c9bb]/60 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#154212] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#154212]">checklist</span>
                  <span>Ingredientes Preparados ({Object.values(checkedIngredients).filter(Boolean).length}/{receta.ingredientes.length})</span>
                </h4>
                <span className="text-[11px] text-[#72796e]">Toca para marcar como listo</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {receta.ingredientes.map((item) => {
                  const isChecked = !!checkedIngredients[item.id];
                  return (
                    <label
                      key={item.id}
                      onClick={() => toggleIngredientCheck(item.id)}
                      className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs transition cursor-pointer select-none ${
                        isChecked
                          ? 'border-[#bcf0ae] bg-[#bcf0ae]/20 text-[#72796e] line-through'
                          : 'border-[#c2c9bb]/40 bg-[#fbf9f8] text-[#1b1c1c] hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-[#c2c9bb] text-[#154212] focus:ring-[#154212]"
                      />
                      <span>
                        <strong>{item.cantidad ?? ''} {item.unidad ?? item.unidadMedidaDefecto}</strong> {item.nombre}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ----------------- VISTA DETALLADA NORMAL ----------------- */
          <>
            {receta.plato.imagenUrl && (
              <img
                alt={receta.plato.nombre}
                className="mt-4 max-h-72 w-full rounded-2xl object-cover shadow-xs border border-[#c2c9bb]/40"
                src={receta.plato.imagenUrl}
              />
            )}

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {/* Sección Ingredientes */}
              <section className="rounded-2xl border border-[#c2c9bb]/40 bg-[#fbf9f8] p-5">
                <div className="flex items-center justify-between mb-3 border-b border-[#f0eded] pb-2">
                  <h3 className="font-serif text-base font-bold text-[#154212] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">grocery</span>
                    <span>Ingredientes</span>
                  </h3>
                  <span className="text-[11px] text-[#72796e]">{receta.ingredientes.length} elementos</span>
                </div>
                <ul className="space-y-2 text-xs">
                  {receta.ingredientes.map((item) => {
                    const isChecked = !!checkedIngredients[item.id];
                    return (
                      <li
                        key={item.id}
                        onClick={() => toggleIngredientCheck(item.id)}
                        className={`flex items-center gap-2 p-1.5 rounded-lg transition cursor-pointer ${
                          isChecked ? 'line-through text-[#72796e] bg-[#f0eded]' : 'text-[#1b1c1c] hover:bg-white'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-sm ${isChecked ? 'text-[#154212]' : 'text-[#c2c9bb]'}`}>
                          {isChecked ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        <span>
                          <strong>{item.cantidad ?? ''} {item.unidad ?? item.unidadMedidaDefecto}</strong> {item.nombre}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Sección Pasos de Preparación */}
              <section className="rounded-2xl border border-[#c2c9bb]/40 bg-[#fbf9f8] p-5">
                <div className="flex items-center justify-between mb-3 border-b border-[#f0eded] pb-2">
                  <h3 className="font-serif text-base font-bold text-[#154212] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">format_list_numbered</span>
                    <span>Preparación</span>
                  </h3>
                  <span className="text-[11px] text-[#72796e]">{steps.length} pasos</span>
                </div>
                <ol className="space-y-2.5 text-xs">
                  {steps.map((step, index) => (
                    <li className="flex items-start gap-2.5" key={`${index}-${step}`}>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#154212] text-[10px] font-bold text-white mt-0.5">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed text-[#42493e]">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            {/* Acciones del Modal: Favorito, Imprimir, Editar, Eliminar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0eded] pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                    isFavorite
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-[#c2c9bb] bg-white text-[#154212] hover:bg-[#f6f3f2]'
                  }`}
                  onClick={() => void onToggleFavorite(receta.id)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">{isFavorite ? 'favorite' : 'favorite_border'}</span>
                  <span>{isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl border border-[#c2c9bb] bg-white px-3.5 py-2 text-xs font-semibold text-[#154212] hover:bg-[#f6f3f2] transition"
                  title="Imprimir receta o guardar como PDF"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  <span>Imprimir / PDF</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {canEdit && (
                  <button
                    className="rounded-xl border border-[#c2c9bb] px-3.5 py-2 text-xs font-semibold text-[#42493e] hover:bg-[#f6f3f2] transition"
                    onClick={() => onEditRecipe(receta)}
                    type="button"
                  >
                    Editar
                  </button>
                )}
                {canDelete && (
                  <button
                    className="rounded-xl border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
                    onClick={() => {
                      if (window.confirm(`¿Estás seguro de que deseas eliminar la receta "${receta.plato.nombre}"? Esta acción no se puede deshacer.`)) {
                        onDeleteRecipe(receta.id);
                      }
                    }}
                    type="button"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            {/* Sección de Comentarios y Calificaciones con selector de estrellas interactivo */}
            <section className="mt-8 border-t border-[#f0eded] pt-6">
              <h3 className="font-serif text-lg font-bold text-[#154212] flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">reviews</span>
                <span>Comentarios y Calificaciones</span>
              </h3>

              {errorMessage && (
                <p className="my-3 rounded-xl bg-[#ffdad6] p-3 text-xs text-[#93000a] font-medium" role="alert">
                  {errorMessage}
                </p>
              )}

              <form className="mt-4 rounded-2xl border border-[#c2c9bb]/50 bg-[#fbf9f8] p-4 sm:p-5 space-y-3" onSubmit={(event) => void commentSubmit(event)}>
                <div>
                  <label className="block text-xs font-bold text-[#154212] mb-1">
                    Tu Calificación para este Plato
                  </label>
                  {/* Selector visual de estrellas */}
                  <div className="flex items-center gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-2xl transition-transform hover:scale-125 focus:outline-hidden"
                        title={`${star} de 5 estrellas`}
                      >
                        <span className={`material-symbols-outlined ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-500 font-fill'
                            : 'text-[#c2c9bb]'
                        }`}>
                          star
                        </span>
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-semibold text-[#42493e]">
                      {rating} {rating === 1 ? 'estrella' : 'estrellas'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#154212] mb-1" htmlFor="commentText">
                    Tu Opinión o Consejo Culinario
                  </label>
                  <textarea
                    id="commentText"
                    className="w-full rounded-xl border border-[#c2c9bb] bg-white p-3 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
                    maxLength={2000}
                    placeholder={`¿Qué te pareció este plato, ${currentUser.nombre}?`}
                    required
                    rows={3}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    className="rounded-xl bg-[#154212] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#2d5a27] transition disabled:opacity-60 flex items-center gap-2"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting && <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>}
                    <span>{isSubmitting ? 'Publicando...' : 'Publicar Comentario'}</span>
                  </button>
                </div>
              </form>

              {/* Listado de comentarios */}
              <ul className="mt-5 divide-y divide-[#f0eded]">
                {comentarios.map((comment) => (
                  <li className="py-3.5 space-y-1.5" key={comment.id}>
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-xs font-bold text-[#1b1c1c]">{comment.nombreUsuario}</strong>
                      <span className="text-xs text-amber-500" aria-label={`${comment.calificacion} de 5 estrellas`}>
                        {'★'.repeat(comment.calificacion)}{'☆'.repeat(5 - comment.calificacion)}
                      </span>
                    </div>
                    <p className="text-xs text-[#42493e] leading-relaxed">{comment.texto}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <span className="text-[11px] text-[#72796e]">{comment.fecha}</span>
                      <button
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                          comment.likedByUser
                            ? 'bg-red-50 text-red-600 shadow-xs'
                            : 'bg-[#f0eded] text-[#42493e] hover:bg-[#e4e2e1]'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          void onLikeComment(comment.id);
                        }}
                        type="button"
                        title={comment.likedByUser ? 'Quitar Me gusta' : 'Dar Me gusta'}
                      >
                        <span>{comment.likedByUser ? '❤️' : '🤍'}</span>
                        <span>{comment.likedByUser ? 'Te gusta' : 'Me gusta'}</span>
                        <span className="opacity-75">({comment.likes})</span>
                      </button>
                    </div>
                  </li>
                ))}
                {comentarios.length === 0 && (
                  <li className="py-6 text-center text-xs text-[#72796e] bg-[#fbf9f8] rounded-xl mt-3">
                    Aún no hay comentarios para esta receta. ¡Sé el primero en opinar!
                  </li>
                )}
              </ul>
            </section>
          </>
        )}
      </section>
    </div>
  );
}
