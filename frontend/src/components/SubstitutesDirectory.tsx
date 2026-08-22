import type { Ingrediente } from '../types';
interface Props { ingredientes: Ingrediente[]; onAddSubstitute: (id: string, name: string, proportion: string, notes: string) => void; }
export default function SubstitutesDirectory({ ingredientes, onAddSubstitute }: Props) { return <section><h2 className="text-2xl font-bold">Despensa y sustitutos</h2>{ingredientes.map((ingredient) => <button className="block p-3" key={ingredient.id} onClick={() => onAddSubstitute(ingredient.id, 'Sustituto', '1 a 1', 'Agregado desde la despensa')}>{ingredient.nombre}</button>)}</section>; }
