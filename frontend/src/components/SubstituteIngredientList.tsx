/**
 * SubstituteIngredientList: muestra la tabla de sustitutos con botones Editar / Eliminar.
 * Componente presentacional ("tonto"): recibe datos por props y emite eventos de acción al padre.
 *   - Input:  substitutes
 *   - Output: onEdit, onDelete
 */
import type { SustitutoApi } from '../types';

interface Props {
    substitutes: SustitutoApi[];
    onEdit: (sub: SustitutoApi) => void;
    onDelete: (sub: SustitutoApi) => void;
}

export default function SubstituteIngredientList({ substitutes, onEdit, onDelete }: Props) {
    return (
        <div className="sub-table-container">
            <table className="sub-table">
                <thead>
                    <tr>
                        <th>Nombre Sustituto</th>
                        <th>Proporción</th>
                        <th>Notas</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {substitutes.map((sub) => (
                        <tr key={sub.idSubstituteIngredient}>
                            <td className="sub-table__name">{sub.nombreSustituto}</td>
                            <td>
                                <span className="sub-badge">{sub.proporcion}</span>
                            </td>
                            <td className="sub-table__notes">{sub.notas || 'Sin notas'}</td>
                            <td>
                                <div className="sub-table__actions">
                                    <button
                                        className="sub-btn sub-btn--edit"
                                        type="button"
                                        onClick={() => onEdit(sub)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="sub-btn sub-btn--delete"
                                        type="button"
                                        onClick={() => onDelete(sub)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
