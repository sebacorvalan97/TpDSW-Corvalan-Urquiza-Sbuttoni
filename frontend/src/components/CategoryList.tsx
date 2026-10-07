/**
 * CategoryList: muestra las categorías como tarjetas con botones Editar / Eliminar.
 * Solo "dibuja": recibe la lista por props y avisa con funciones qué botón se apretó.
 *   - Input:  categories
 *   - Output: onEdit, onDelete
 */
import type { CategoriaApi } from '../types';

interface Props {
    categories: CategoriaApi[];
    onEdit: (category: CategoriaApi) => void;
    onDelete: (category: CategoriaApi) => void;
}

export default function CategoryList({ categories, onEdit, onDelete }: Props) {
    return (
        <ul className="cat-list">
            {/* .map recorre el arreglo y genera una tarjeta por categoría.
                `key` es obligatorio en React: identifica cada elemento de la lista. */}
            {categories.map((category) => (
                <li className="cat-card" key={category.idCategory}>
                    <div>
                        <h4 className="cat-card__name">{category.nombre}</h4>
                        <p className="cat-card__desc">{category.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div className="cat-card__actions">
                        <button className="cat-btn cat-btn--edit" type="button" onClick={() => onEdit(category)}>
                            Editar
                        </button>
                        <button className="cat-btn cat-btn--delete" type="button" onClick={() => onDelete(category)}>
                            Eliminar
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
