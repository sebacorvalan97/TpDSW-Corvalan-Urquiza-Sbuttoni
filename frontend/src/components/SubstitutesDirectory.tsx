import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { AuthSession } from './AuthPanel';
import type { Ingrediente } from '../types';
import { getErrorMessage } from '../services/http';
import { userDataService, type PantryItemApi, type SubstituteApi } from '../services/user-data.service';
import { UNIDADES_MEDIDA } from '../constants/unidades';

interface Props {
  ingredientes: Ingrediente[];
  authSession: AuthSession | null;
  onSignIn?: () => void;
}

export default function SubstitutesDirectory({ ingredientes, authSession, onSignIn }: Props) {
  const [pantry, setPantry] = useState<PantryItemApi[]>([]);
  const [substitutes, setSubstitutes] = useState<SubstituteApi[]>([]);
  
  // Estado para formulario de despensa
  const [pantryIngredientId, setPantryIngredientId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('unidad');

  // Estado para formulario de sustitutos (admin)
  const [subOriginalId, setSubOriginalId] = useState('');
  const [subReplacementId, setSubReplacementId] = useState('');
  const [proportion, setProportion] = useState('1:1');
  const [notes, setNotes] = useState('');

  // Filtro de búsqueda en la lista de sustitutos
  const [subSearch, setSubSearch] = useState('');

  // Mensajes de feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    const requests: Promise<unknown>[] = [
      userDataService.getSubstitutes().then((data) => {
        if (mounted) setSubstitutes(data);
      }),
    ];
    if (authSession?.role === 'user') {
      requests.push(userDataService.getPantry().then((data) => {
        if (mounted) setPantry(data);
      }));
    }
    void Promise.all(requests).catch((cause: unknown) => {
      if (mounted) setError(getErrorMessage(cause));
    });
    return () => {
      mounted = false;
    };
  }, [authSession?.role]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const updatePantry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError('');
      const updated = await userDataService.setPantryItem(Number(pantryIngredientId), Number(quantity), unit);
      setPantry(updated);
      setPantryIngredientId('');
      setQuantity('1');
      setUnit('unidad');
      showSuccess('Ingrediente guardado en tu despensa.');
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    }
  };

  const removePantry = async (id: number) => {
    try {
      setError('');
      await userDataService.removePantryItem(id);
      setPantry((items) => items.filter((item) => item.idIngredient !== id));
      showSuccess('Ingrediente quitado de tu despensa.');
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    }
  };

  const addSubstitute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError('');
      const created = await userDataService.createSubstitute(Number(subOriginalId), Number(subReplacementId), proportion, notes);
      setSubstitutes((items) => [...items.filter((item) => item.id !== created.id), created]);
      setSubOriginalId('');
      setSubReplacementId('');
      setProportion('1:1');
      setNotes('');
      showSuccess('Sustituto registrado correctamente en el catálogo.');
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    }
  };

  const removeSubstitute = async (item: SubstituteApi) => {
    if (!window.confirm(`¿Eliminar el sustituto "${item.substituteName}" para "${item.ingredientName}"?`)) return;
    try {
      setError('');
      await userDataService.deleteSubstitute(item.ingredientId, item.substituteId);
      setSubstitutes((items) => items.filter((substitute) => substitute.id !== item.id));
      showSuccess('Sustituto eliminado del catálogo.');
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    }
  };

  const filteredSubstitutes = useMemo(() => {
    const q = subSearch.trim().toLowerCase();
    if (!q) return substitutes;
    return substitutes.filter(
      (s) =>
        s.ingredientName.toLowerCase().includes(q) ||
        s.substituteName.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q)
    );
  }, [substitutes, subSearch]);

  return (
    <section className="space-y-6 rounded-2xl border border-[#c2c9bb]/60 bg-white p-6 shadow-sm">
      <div className="border-b border-[#f0eded] pb-4">
        <h1 className="font-serif text-2xl font-bold text-[#154212]">Despensa y Sustitutos Culinarios</h1>
        <p className="text-xs text-[#605e5b] mt-0.5">Explora alternativas a ingredientes y gestiona los alimentos disponibles en tu cocina</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-[#ffdad6] p-3 text-xs text-[#93000a]" role="alert">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-[#bcf0ae]/40 p-3 text-xs text-[#154212]" role="status">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      {!authSession && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[#c2c9bb]/60 bg-[#fbf9f8] p-4">
          <div>
            <h2 className="text-sm font-bold text-[#154212]">¿Quieres gestionar tu despensa personal?</h2>
            <p className="text-xs text-[#605e5b] mt-0.5">Inicia sesión como usuario para guardar los ingredientes que tienes en casa y ver qué recetas puedes preparar.</p>
          </div>
          {onSignIn && (
            <button
              type="button"
              onClick={onSignIn}
              className="rounded-lg bg-[#154212] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2d5a27] transition shrink-0"
            >
              Iniciar sesión
            </button>
          )}
        </div>
      )}

      {authSession?.role === 'user' && (
        <section className="space-y-4 rounded-xl border border-[#c2c9bb]/40 bg-[#fbf9f8] p-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#154212]">kitchen</span>
            <h2 className="text-lg font-bold text-[#154212]">Mi Despensa</h2>
          </div>

          <form className="flex flex-wrap items-center gap-2" onSubmit={(event) => void updatePantry(event)}>
            <select
              className="flex-1 min-w-44 rounded-xl border border-[#c2c9bb] bg-white p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
              required
              value={pantryIngredientId}
              onChange={(event) => setPantryIngredientId(event.target.value)}
            >
              <option value="">Seleccionar ingrediente</option>
              {ingredientes.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
            </select>
            <input
              aria-label="Cantidad"
              className="w-24 rounded-xl border border-[#c2c9bb] bg-white p-2.5 text-xs text-[#1b1c1c] text-center focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
              min="0.01"
              required
              step="any"
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
            <select
              aria-label="Unidad"
              className="w-32 rounded-xl border border-[#c2c9bb] bg-white p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNIDADES_MEDIDA.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
            <button className="rounded-xl bg-[#154212] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2d5a27] transition" type="submit">
              Guardar en Despensa
            </button>
          </form>

          <ul className="divide-y divide-[#c2c9bb]/30">
            {pantry.map((item) => (
              <li className="flex items-center justify-between py-2 text-xs" key={item.idIngredient}>
                <span className="font-medium text-[#1b1c1c]">{item.nombre} — <span className="text-[#605e5b]">{item.cantidad} {item.unidad}</span></span>
                <button className="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 transition" onClick={() => void removePantry(item.idIngredient)} type="button">
                  Quitar
                </button>
              </li>
            ))}
            {pantry.length === 0 && <li className="py-2 text-xs text-[#605e5b]">Tu despensa está vacía. Añade lo que tienes en la cocina arriba.</li>}
          </ul>
        </section>
      )}

      {/* CATÁLOGO DE SUSTITUTOS */}
      <section className="space-y-4 rounded-xl border border-[#c2c9bb]/40 bg-[#fbf9f8] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#154212]">swap_horiz</span>
            <h2 className="text-lg font-bold text-[#154212]">Sustitutos Culinarios Disponibles</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#72796e] text-sm pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              placeholder="Buscar sustituto..."
              className="w-full rounded-lg border border-[#c2c9bb]/70 bg-white py-1.5 pl-8 pr-3 text-xs focus:ring-1 focus:ring-[#154212] focus:outline-hidden"
            />
          </div>
        </div>

        <ul className="divide-y divide-[#c2c9bb]/30">
          {filteredSubstitutes.map((item) => (
            <li className="flex items-center justify-between gap-3 py-2.5 text-xs" key={item.id}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-semibold text-[#154212]">{item.ingredientName}</span>
                <span className="text-[#605e5b]">reemplazable por</span>
                <span className="font-semibold text-[#2d5a27]">{item.substituteName}</span>
                <span className="rounded-full bg-[#154212]/10 px-2 py-0.5 text-[11px] font-medium text-[#154212]">
                  Proporción: {item.proportion}
                </span>
                {item.notes && <span className="text-[11px] text-[#72796e] italic">({item.notes})</span>}
              </div>
              {authSession?.role === 'admin' && (
                <button className="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 transition shrink-0" onClick={() => void removeSubstitute(item)} type="button">
                  Eliminar
                </button>
              )}
            </li>
          ))}
          {filteredSubstitutes.length === 0 && (
            <li className="py-4 text-center text-xs text-[#605e5b]">
              {subSearch ? 'No se encontraron sustitutos que coincidan con la búsqueda.' : 'Todavía no hay sustitutos cargados en el catálogo.'}
            </li>
          )}
        </ul>
      </section>

      {/* REGISTRO DE SUSTITUTO (ADMIN) */}
      {authSession?.role === 'admin' && (
        <form className="grid gap-3 rounded-xl border border-[#c2c9bb]/50 bg-white p-5 sm:grid-cols-2" onSubmit={(event) => void addSubstitute(event)}>
          <div className="sm:col-span-2 flex items-center gap-2 border-b border-[#f0eded] pb-2">
            <span className="material-symbols-outlined text-sm text-[#154212]">add_circle</span>
            <h2 className="text-sm font-bold text-[#154212]">Agregar Nuevo Sustituto (Administrador)</h2>
          </div>
          <select
            className="rounded-xl border border-[#c2c9bb] bg-white p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
            required
            value={subOriginalId}
            onChange={(event) => setSubOriginalId(event.target.value)}
          >
            <option value="">Ingrediente original</option>
            {ingredientes.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
          </select>
          <select
            className="rounded-xl border border-[#c2c9bb] bg-white p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
            required
            value={subReplacementId}
            onChange={(event) => setSubReplacementId(event.target.value)}
          >
            <option value="">Ingrediente sustituto</option>
            {ingredientes.filter((item) => item.id !== subOriginalId).map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
          </select>
          <input
            className="rounded-xl border border-[#c2c9bb] bg-white p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
            placeholder="Proporción (ej. 1:1, 1 taza : 3/4 taza)"
            required
            value={proportion}
            onChange={(event) => setProportion(event.target.value)}
          />
          <input
            className="rounded-xl border border-[#c2c9bb] bg-white p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
            maxLength={200}
            placeholder="Notas o recomendaciones (opcional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <button className="rounded-xl bg-[#154212] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2d5a27] transition sm:col-span-2" type="submit">
            Registrar Sustituto
          </button>
        </form>
      )}
    </section>
  );
}
