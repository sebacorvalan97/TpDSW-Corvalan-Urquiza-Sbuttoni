import { useState } from 'react';
import type { PasoReceta } from '../services/paso-receta.service';

interface PasoRecetaFormProps {
  pasoEditando?: PasoReceta | null;
  onSubmit: (
    recetaId: number,
    numeroOrden: number,
    descripcion: string,
  ) => void;
  onCancel: () => void;
}

export function PasoRecetaForm({
  pasoEditando,
  onSubmit,
  onCancel,
}: PasoRecetaFormProps) {
  const [recetaId, setRecetaId] = useState<number>(pasoEditando?.recetaId || 0);
  const [numeroOrden, setNumeroOrden] = useState<number>(
    pasoEditando?.numeroOrden || 1,
  );
  const [descripcion, setDescripcion] = useState(
    pasoEditando?.descripcion || '',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(recetaId, numeroOrden, descripcion);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{pasoEditando ? 'Editar Paso de Receta' : 'Crear Paso de Receta'}</h2>

      <label>ID de Receta:</label>
      <input
        type="number"
        value={recetaId}
        onChange={(e) => setRecetaId(Number(e.target.value))}
        required
      />

      <label>Número de Orden:</label>
      <input
        type="number"
        value={numeroOrden}
        onChange={(e) => setNumeroOrden(Number(e.target.value))}
        required
      />

      <label>Descripción:</label>
      <textarea
        placeholder="Descripción del paso..."
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        required
      />

      <button type="submit">
        {pasoEditando ? 'Guardar cambios' : 'Crear paso'}
      </button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}
