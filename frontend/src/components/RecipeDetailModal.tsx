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
  receta, categorias, origenes, dificultades, comentarios, currentUser, onClose, onToggleFavorite, onAddComment, onLikeComment,
  onEditRecipe, onDeleteRecipe, isFavorite, errorMessage,
}: Props) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddComment(receta.id, rating, text);
      setText('');
    } catch {
      // The parent displays the API error and preserves the draft for retry.
    } finally {
      setIsSubmitting(false);
    }
  };
  const categoryName = categorias.find((category) => category.id === receta.plato.categoriaId)?.nombre;
  const originName = origenes.find((origin) => origin.id === receta.plato.origenId)?.pais;
  const difficultyName = dificultades.find((difficulty) => difficulty.id === receta.plato.dificultadId)?.nivel;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <section aria-label={`Detalle de ${receta.plato.nombre}`} aria-modal="true" className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#154212]">{receta.plato.nombre}</h2>
            <p className="mt-1 text-sm text-gray-700">{receta.plato.descripcion}</p>
            <p className="mt-2 text-sm text-gray-600">
              {receta.calificacionPromedio.toFixed(1)} ★ ({receta.totalCalificaciones} calificaciones)
              {[categoryName, originName, difficultyName].filter(Boolean).length > 0 && ` · ${[categoryName, originName, difficultyName].filter(Boolean).join(' · ')}`}
            </p>
          </div>
          <button aria-label="Cerrar detalle" className="rounded px-2 py-1 text-xl" onClick={onClose} type="button">×</button>
        </div>

        {receta.plato.imagenUrl && <img alt={receta.plato.nombre} className="mt-4 max-h-72 w-full rounded-xl object-cover" src={receta.plato.imagenUrl} />}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <section>
            <h3 className="font-semibold">Ingredientes</h3>
            <ul className="mt-2 list-inside list-disc text-sm">
              {receta.ingredientes.map((item) => <li key={item.id}>{item.cantidad ?? ''} {item.unidad ?? item.unidadMedidaDefecto} {item.nombre}</li>)}
            </ul>
          </section>
          <section>
            <h3 className="font-semibold">Preparación</h3>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
              {receta.pasos.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
            </ol>
          </section>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
          <button className="rounded border px-3 py-2" onClick={() => void onToggleFavorite(receta.id)} type="button">{isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}</button>
          <button className="rounded border px-3 py-2" onClick={() => onEditRecipe(receta)} type="button">Editar</button>
          <button className="rounded border px-3 py-2 text-red-700" onClick={() => onDeleteRecipe(receta.id)} type="button">Eliminar</button>
        </div>

        <section className="mt-6 border-t pt-5">
          <h3 className="text-lg font-semibold">Comentarios y calificaciones</h3>
          {errorMessage && <p className="my-3 rounded bg-[#ffdad6] p-3 text-sm text-[#93000a]" role="alert">{errorMessage}</p>}
          <form className="mt-3 space-y-2" onSubmit={(event) => void commentSubmit(event)}>
            <label className="block text-sm font-medium" htmlFor="commentRating">Tu calificación</label>
            <select className="rounded border p-2" id="commentRating" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} estrellas</option>)}
            </select>
            <textarea className="block w-full rounded border p-3" maxLength={2000} placeholder={`Comenta, ${currentUser.nombre}...`} required rows={3} value={text} onChange={(event) => setText(event.target.value)} />
            <button className="rounded bg-[#154212] px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Enviando...' : 'Publicar comentario'}
            </button>
          </form>
          <ul className="mt-4 divide-y">
            {comentarios.map((comment) => (
              <li className="py-3" key={comment.id}>
                <div className="flex items-center justify-between gap-2">
                  <strong>{comment.nombreUsuario}</strong>
                  <span className="text-sm" aria-label={`${comment.calificacion} de 5 estrellas`}>{'★'.repeat(comment.calificacion)}{'☆'.repeat(5 - comment.calificacion)}</span>
                </div>
                <p className="mt-1 text-sm">{comment.texto}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                  <time dateTime={comment.fecha}>{new Date(comment.fecha).toLocaleDateString()}</time>
                  <button className="hover:underline" onClick={() => void onLikeComment(comment.id)} type="button">
                    {comment.likedByUser ? 'Te gusta' : 'Me gusta'} · {comment.likes}
                  </button>
                </div>
              </li>
            ))}
            {comentarios.length === 0 && <li className="py-3 text-sm text-gray-600">Todavía no hay comentarios.</li>}
          </ul>
        </section>
      </section>
    </div>
  );
}
