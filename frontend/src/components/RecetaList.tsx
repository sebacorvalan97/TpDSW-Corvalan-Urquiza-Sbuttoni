import { type Receta } from '../services/receta.service';

interface RecetaListProps {
  recetas: Receta[];
  onEdit: (receta: Receta) => void;
  onDelete: (idReceta: number) => void;
}

export function RecetaList({ recetas, onEdit, onDelete }: RecetaListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tiempo
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recetas.map((receta) => (
            <tr key={receta.idReceta}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {receta.nombre}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {receta.descripcion}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {receta.tiempoMinutos} min
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(receta)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(receta.idReceta)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
