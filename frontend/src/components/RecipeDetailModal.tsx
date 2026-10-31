import { useState, type FormEvent } from 'react';
import type { Categoria, Comentario, Dificultad, Ingrediente, Origen, Receta, Usuario } from '../types';

interface Props {
  receta: Receta;
  categorias: Categoria[];
  origenes: Origen[];
  dificultades: Dificultad[];
  todosIngredientes: Ingrediente[];
  comentarios: Comentario[];
  currentUser: Usuario;
  onClose: () => void;
  onToggleFavorite: (id: string) => Promise<void>;
  onAddComment: (id: string, rating: number, text: string) => Promise<void>;
  onLikeComment: (id: string) => Promise<void>;
  onEditRecipe: (recipe: Receta) => void;
  onDeleteRecipe: (id: string) => void;
  initialCookingMode: boolean;
  isFavorite: boolean;
  errorMessage: string;
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
  initialCookingMode,
  isFavorite,
  errorMessage,
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
  const originMatching = origenes.filter(
    (origin) => origin.id === receta.plato.origenId || receta.plato.origenesIds?.includes(origin.id)
  );
  const originNames = originMatching
    .map((o) => (o.bandera ? `${o.bandera} ${o.pais}` : o.pais || o.nombre))
    .filter(Boolean)
    .join(', ');
  const difficultyName = dificultades.find((difficulty) => difficulty.id === receta.plato.dificultadId)?.nivel;
  const totalPasos = receta.pasos.length;
  const progressPercent = totalPasos > 0 ? Math.round(((currentStepIndex + 1) / totalPasos) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-3 sm:p-4 backdrop-blur-xs" onClick={onClose}>
      <section
        aria-label={`Detalle de ${receta.plato.nombre}`}
        aria-modal="true"
        className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 sm:p-7 shadow-2xl transition-all"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        {/* Cabecera del modal */}
        <div className="flex items-start justify-between gap-4 border-b border-[#f0eded] pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="rounded-full bg-[#154212]/10 px-2.5 py-0.5 text-xs font-bold text-[#154212]">
                {categoryName || 'Receta'}
              </span>
              {originNames && (
                <span className="rounded-full bg-[#f6f3f2] px-2.5 py-0.5 text-xs font-semibold text-[#42493e]">
                  {originNames}
                </span>
              )}
              {difficultyName && (
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                  {difficultyName}
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#154212] leading-tight">
              {receta.plato.nombre}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#605e5b] line-clamp-2">
              {receta.plato.descripcion}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#72796e]">
              <span className="text-amber-600 font-bold">★ {receta.calificacionPromedio.toFixed(1)}</span>
              <span>({receta.totalCalificaciones} calificaciones)</span>
              <span>·</span>
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

        {/* ----------------- MODO COCINA PASO A PASO ----------------- */}
        {isCookingMode ? (
          <div className="py-6 space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl bg-[#fbf9f8] border border-[#c2c9bb]/60 p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#154212] mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">restaurant</span>
                  Paso {currentStepIndex + 1} de {totalPasos}
                </span>
                <span>{progressPercent}% Completado</span>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-[#c2c9bb]/30 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#154212] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Tarjeta del paso actual */}
            {!isCookingFinished ? (
              <div className="rounded-2xl border-2 border-[#154212]/30 bg-gradient-to-br from-white to-[#fbf9f8] p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#154212] text-lg font-bold text-white shadow-xs">
                    {currentStepIndex + 1}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#154212]">
                    Instrucción de Cocina
                  </h3>
                </div>

                <p className="text-base sm:text-lg text-[#1b1c1c] leading-relaxed font-medium">
                  {receta.pasos[currentStepIndex] || 'No hay instrucciones para este paso.'}
                </p>

                {/* Botones de navegación de pasos */}
                <div className="flex items-center justify-between gap-3 pt-6 border-t border-[#f0eded]">
                  <button
                    type="button"
                    disabled={currentStepIndex === 0}
                    onClick={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
                    className="flex items-center gap-1.5 rounded-xl border border-[#c2c9bb] bg-white px-4 py-2.5 text-xs font-semibold text-[#42493e] hover:bg-[#f6f3f2] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Paso Anterior</span>
                  </button>

                  {currentStepIndex < totalPasos - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStepIndex((prev) => Math.min(prev + 1, totalPasos - 1))}
                      className="flex items-center gap-1.5 rounded-xl bg-[#154212] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#2d5a27] transition"
                    >
                      <span>Siguiente Paso</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCookingFinished(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition"
                    >
                      <span>¡Finalizar Cocción! 🎉</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-[#bcf0ae] bg-[#bcf0ae]/20 p-8 text-center space-y-4">
                <span className="text-5xl">🎉</span>
                <h3 className="font-serif text-2xl font-bold text-[#154212]">
                  ¡Plato Terminado con Éxito!
                </h3>
                <p className="text-sm text-[#42493e] max-w-md mx-auto">
                  Has completado todos los pasos de <strong>{receta.plato.nombre}</strong>. ¡A emplatar y disfrutar!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCookingFinished(false);
                      setCurrentStepIndex(0);
                    }}
                    className="rounded-xl border border-[#154212] bg-white px-4 py-2 text-xs font-semibold text-[#154212] hover:bg-[#f6f3f2]"
                  >
                    Repetir desde el Paso 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCookingMode(false)}
                    className="rounded-xl bg-[#154212] px-5 py-2 text-xs font-bold text-white hover:bg-[#2d5a27]"
                  >
                    Volver y Dejar Calificación
                  </button>
                </div>
              </div>
            )}

            {/* Checklist de ingredientes durante el modo cocina */}
            <div className="rounded-2xl border border-[#c2c9bb]/60 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-sm font-bold text-[#154212] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">checklist</span>
                  <span>Ingredientes Necesarios (Marca lo que vayas agregando)</span>
                </h4>
                <span className="text-[11px] text-[#72796e]">
                  {Object.values(checkedIngredients).filter(Boolean).length} / {receta.ingredientes.length} listos
                </span>
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
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-[#c2c9bb] text-[#154212] focus:ring-[#154212]"
                        />
                        <span>
                          <strong>{item.cantidad ?? ''} {item.unidad ?? item.unidadMedidaDefecto}</strong> {item.nombre}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Sección Instrucciones */}
              <section className="rounded-2xl border border-[#c2c9bb]/40 bg-[#fbf9f8] p-5">
                <div className="flex items-center justify-between mb-3 border-b border-[#f0eded] pb-2">
                  <h3 className="font-serif text-base font-bold text-[#154212] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">format_list_numbered</span>
                    <span>Preparación</span>
                  </h3>
                  <span className="text-[11px] text-[#72796e]">{receta.pasos.length} pasos</span>
                </div>
                <ol className="space-y-2.5 text-xs">
                  {receta.pasos.map((step, index) => (
                    <li key={`${index}-${step}`} className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#154212] text-[10px] font-bold text-white mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-[#303030] leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            {/* Barra de acciones generales e impresión */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0eded] pt-4">
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
                <button
                  className="rounded-xl border border-[#c2c9bb] px-3.5 py-2 text-xs font-semibold text-[#42493e] hover:bg-[#f6f3f2] transition"
                  onClick={() => onEditRecipe(receta)}
                  type="button"
                >
                  Editar
                </button>
                <button
                  className="rounded-xl border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
                  onClick={() => onDeleteRecipe(receta.id)}
                  type="button"
                >
                  Eliminar
                </button>
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
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="text-2xl transition transform hover:scale-115 focus:outline-hidden"
                        title={`${star} estrellas`}
                      >
                        <span
                          className={`material-symbols-outlined ${
                            (hoverRating || rating) >= star ? 'text-amber-500 font-fill' : 'text-[#c2c9bb]'
                          }`}
                        >
                          star
                        </span>
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-[#605e5b] ml-2">
                      {hoverRating || rating} de 5 estrellas
                    </span>
                  </div>
                </div>

                <textarea
                  className="block w-full rounded-xl border border-[#c2c9bb] bg-white p-3 text-xs text-[#1b1c1c] focus:border-[#154212] focus:outline-hidden focus:ring-2 focus:ring-[#154212]/20"
                  maxLength={2000}
                  placeholder={`Comparte tu experiencia cocinando este plato, ${currentUser.nombre}...`}
                  required
                  rows={3}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />

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
