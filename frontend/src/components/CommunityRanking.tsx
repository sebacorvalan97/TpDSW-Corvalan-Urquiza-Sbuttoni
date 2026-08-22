import type { Categoria, Origen, Receta } from '../types';
interface Props { recetas: Receta[]; categorias: Categoria[]; origenes: Origen[]; onSelectRecipe: (recipe: Receta) => void; }
export default function CommunityRanking({ recetas, onSelectRecipe }: Props) { return <section><h2 className="text-2xl font-bold">Ranking de la comunidad</h2>{recetas.map((recipe) => <button className="block p-3" key={recipe.id} onClick={() => onSelectRecipe(recipe)}>{recipe.plato.nombre} · {recipe.calificacionPromedio}/5</button>)}</section>; }
