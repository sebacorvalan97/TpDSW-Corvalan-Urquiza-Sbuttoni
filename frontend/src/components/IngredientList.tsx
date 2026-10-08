/**
 * IngredientList: muestra los ingredientes como tarjetas con botones Editar / Eliminar.
 * Solo "dibuja": recibe la lista por props y avisa con funciones qué botón se apretó.
 *   - Input:  ingredients
 *   - Output: onEdit, onDelete
 */
import type { IngredienteApi } from '../types';
import { getUnidadLabel } from '../constants/unidades';

interface Props {
    ingredients: IngredienteApi[];
    onEdit: (ingredient: IngredienteApi) => void;
    onDelete: (ingredient: IngredienteApi) => void;
}

export default function IngredientList({ ingredients, onEdit, onDelete }: Props) {
    return (
        <ul className="ing-list">
            {/* .map recorre el arreglo y genera una tarjeta por ingrediente.
                `key` es obligatorio en React: identifica cada elemento de la lista. */}
            {ingredients.map((ingredient) => (
                <li className="ing-card" key={ingredient.idIngredient}>
                    <div>
                        <h4 className="ing-card__name">{ingredient.nombre}</h4>
                        {/* Etiqueta con la unidad de medida (ej: "Gramos (g)") */}
                        <span className="ing-badge">{getUnidadLabel(ingredient.unidadMedidaDefecto)}</span>
                        <p className="ing-card__desc">{ingredient.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div className="ing-card__actions">
                        <button className="ing-btn ing-btn--edit" type="button" onClick={() => onEdit(ingredient)}>
                            Editar
                        </button>
                        <button className="ing-btn ing-btn--delete" type="button" onClick={() => onDelete(ingredient)}>
                            Eliminar
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
