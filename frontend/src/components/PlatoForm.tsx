import { useState } from 'react';
import { Plato } from '../types';

interface PlatoFormProps {
  platoEditando?: Plato | null;
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}

export function PlatoForm({
  platoEditando,
  onSubmit,
  onCancel,
}: PlatoFormProps) {
  const [name, setName] = useState(platoEditando?.name || '');
  const [description, setDescription] = useState(
    platoEditando?.description || '',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, description);
    setName('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{platoEditando ? 'Editar Plato' : 'Crear Plato'}</h2>
      <input
        type="text"
        placeholder="Nombre del plato"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <button type="submit">
        {platoEditando ? 'Guardar cambios' : 'Crear plato'}
      </button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}
