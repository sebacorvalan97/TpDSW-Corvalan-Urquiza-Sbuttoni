import type { PasoReceta } from '../services/paso-receta.service';

interface PasoRecetaListProps {
  pasos: PasoReceta[];
  onEdit: (paso: PasoReceta) => void;
  onDelete: (idPaso: number) => void;
}

export function PasoRecetaList({
  pasos,
  onEdit,
  onDelete,
}: PasoRecetaListProps) {
  return (
    <div>
      <h2>Lista de Pasos de Receta</h2>
      <ul>
        {pasos.map((paso) => (
          <li key={paso.idPaso}>
            <strong>Paso {paso.numeroOrden}</strong> (Receta ID: {paso.recetaId}
            ): {paso.descripcion}
            <button onClick={() => onEdit(paso)}>Editar</button>
            <button onClick={() => onDelete(paso.idPaso)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
