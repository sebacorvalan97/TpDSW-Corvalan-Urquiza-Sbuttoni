import { useEffect, useState, type FormEvent } from 'react';
import type { AuthSession } from './AuthPanel';
import type { Ingrediente } from '../types';
import { getErrorMessage } from '../services/http';
import { userDataService, type PantryItemApi, type SubstituteApi } from '../services/user-data.service';

interface Props {
  ingredientes: Ingrediente[];
  authSession: AuthSession;
}

export default function SubstitutesDirectory({ ingredientes, authSession }: Props) {
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
    if (authSession.role === 'user') {
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
  }, [authSession.role]);

  const updatePantry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError('');
      const updated = await userDataService.setPantryItem(Number(ingredientId), Number(quantity), unit);
      setPantry(updated);
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
    <section className="space-y-6 rounded-xl border border-[#c2c9bb] bg-white p-6">
      <h1 className="text-2xl font-bold text-[#154212]">Despensa y sustitutos</h1>
      {error && <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#93000a]" role="alert">{error}</p>}

      {authSession.role === 'user' && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Mi despensa</h2>
          <form className="flex flex-wrap gap-2" onSubmit={(event) => void updatePantry(event)}>
            <select className="rounded border p-2" required value={ingredientId} onChange={(event) => setIngredientId(event.target.value)}>
              <option value="">Ingrediente</option>
              {ingredientes.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
            </select>
            <input aria-label="Cantidad" className="w-24 rounded border p-2" min="0.01" required step="any" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            <input aria-label="Unidad" className="w-32 rounded border p-2" required value={unit} onChange={(event) => setUnit(event.target.value)} />
            <button className="rounded bg-[#154212] px-4 py-2 font-semibold text-white" type="submit">Guardar ingrediente</button>
          </form>
          <ul className="divide-y">
            {pantry.map((item) => (
              <li className="flex items-center justify-between py-2" key={item.idIngredient}>
                <span>{item.nombre} — {item.cantidad} {item.unidad}</span>
                <button className="text-sm text-red-700 hover:underline" onClick={() => void removePantry(item.idIngredient)} type="button">Quitar</button>
              </li>
            ))}
            {pantry.length === 0 && <li className="py-2 text-sm text-gray-600">Tu despensa está vacía.</li>}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sustitutos disponibles</h2>
        <ul className="divide-y">
          {substitutes.map((item) => (
            <li className="flex items-center justify-between gap-3 py-2" key={item.id}>
              <span><strong>{item.ingredientName}</strong> → {item.substituteName} ({item.proportion}){item.notes && ` — ${item.notes}`}</span>
              {authSession.role === 'admin' && <button className="text-sm text-red-700 hover:underline" onClick={() => void removeSubstitute(item)} type="button">Quitar</button>}
            </li>
          ))}
          {substitutes.length === 0 && <li className="py-2 text-sm text-gray-600">Todavía no hay sustitutos cargados.</li>}
        </ul>
      </section>

      {authSession.role === 'admin' && (
        <form className="grid gap-2 rounded-lg bg-gray-50 p-4 sm:grid-cols-2" onSubmit={(event) => void addSubstitute(event)}>
          <h2 className="sm:col-span-2 text-lg font-semibold">Administrar sustitutos</h2>
          <select className="rounded border p-2" required value={ingredientId} onChange={(event) => setIngredientId(event.target.value)}>
            <option value="">Ingrediente original</option>
            {ingredientes.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
          </select>
          <select className="rounded border p-2" required value={substituteId} onChange={(event) => setSubstituteId(event.target.value)}>
            <option value="">Ingrediente sustituto</option>
            {ingredientes.filter((item) => item.id !== ingredientId).map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
          </select>
          <input className="rounded border p-2" placeholder="Proporción (ej. 1:1)" required value={proportion} onChange={(event) => setProportion(event.target.value)} />
          <input className="rounded border p-2" maxLength={200} placeholder="Notas (opcional)" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <button className="rounded bg-[#154212] px-4 py-2 font-semibold text-white sm:col-span-2" type="submit">Agregar sustituto</button>
        </form>
      )}
    </section>
  );
}
