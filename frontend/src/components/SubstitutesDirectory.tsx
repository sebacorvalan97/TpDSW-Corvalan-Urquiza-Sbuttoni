import { useEffect, useState, type FormEvent } from 'react';
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
  const [ingredientId, setIngredientId] = useState('');
  const [substituteId, setSubstituteId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('unidad');
  const [proportion, setProportion] = useState('1:1');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

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

  const updatePantry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError('');
      const updated = await userDataService.setPantryItem(Number(ingredientId), Number(quantity), unit);
      setPantry(updated);
      setIngredientId('');
      setQuantity('1');
      setUnit('unidad');
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    }
  };

  const removePantry = async (id: number) => {
    try {
      setError('');
      await userDataService.removePantryItem(id);
      setPantry((items) => items.filter((item) => item.idIngredient !== id));
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    }
  };

  const addSubstitute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError('');
      const created = await userDataService.createSubstitute(Number(ingredientId), Number(substituteId), proportion, notes);
      setSubstitutes((items) => [...items.filter((item) => item.id !== created.id), created]);
      setIngredientId('');
      setSubstituteId('');
      setProportion('1:1');
      setNotes('');
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    }
  };

  const removeSubstitute = async (item: SubstituteApi) => {
    try {
      setError('');
      await userDataService.deleteSubstitute(item.ingredientId, item.substituteId);
      setSubstitutes((items) => items.filter((substitute) => substitute.id !== item.id));
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-[#c2c9bb]/60 bg-white p-6 shadow-sm">
      <div className="border-b border-[#f0eded] pb-4">
        <h1 className="font-serif text-2xl font-bold text-[#154212]">Despensa y Sustitutos Culinarios</h1>
        <p className="text-xs text-[#605e5b] mt-0.5">Explora alternativas a ingredientes y gestiona los alimentos disponibles en tu cocina</p>
      </div>

      {error && <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#93000a]" role="alert">{error}</p>}

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
              value={ingredientId}
              onChange={(event) => setIngredientId(event.target.value)}
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

      <section className="space-y-4 rounded-xl border border-[#c2c9bb]/40 bg-[#fbf9f8] p-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#154212]">swap_horiz</span>
          <h2 className="text-lg font-bold text-[#154212]">Sustitutos Culinarios Disponibles</h2>
        </div>
        <ul className="divide-y divide-[#c2c9bb]/30">
          {substitutes.map((item) => (
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
          {substitutes.length === 0 && <li className="py-2 text-xs text-[#605e5b]">Todavía no hay sustitutos cargados en el catálogo.</li>}
        </ul>
      </section>

      {authSession?.role === 'admin' && (
        <form className="grid gap-3 rounded-xl border border-[#c2c9bb]/50 bg-white p-5 sm:grid-cols-2" onSubmit={(event) => void addSubstitute(event)}>
          <div className="sm:col-span-2 flex items-center gap-2 border-b border-[#f0eded] pb-2">
            <span className="material-symbols-outlined text-sm text-[#154212]">add_circle</span>
            <h2 className="text-sm font-bold text-[#154212]">Agregar Nuevo Sustituto (Administrador)</h2>
          </div>
          <select
            className="rounded-xl border border-[#c2c9bb] bg-white p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
            required
            value={ingredientId}
            onChange={(event) => setIngredientId(event.target.value)}
          >
            <option value="">Ingrediente original</option>
            {ingredientes.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
          </select>
          <select
            className="rounded-xl border border-[#c2c9bb] bg-white p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
            required
            value={substituteId}
            onChange={(event) => setSubstituteId(event.target.value)}
          >
            <option value="">Ingrediente sustituto</option>
            {ingredientes.filter((item) => item.id !== ingredientId).map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
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
