import { useState } from 'react';

interface Plato {
  idDish: number;
  name: string;
  description: string;
}

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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-[#fbf9f8] rounded-xl border border-[#c2c9bb]"
    >
      <h2 className="font-bold text-lg text-[#154212]">
        {platoEditando ? 'Editar Plato' : 'Crear Plato'}
      </h2>
      <input
        type="text"
        placeholder="Nombre del plato"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-4 py-2 border border-[#c2c9bb] rounded-lg focus:ring-2 focus:ring-[#154212] focus:outline-none"
      />
      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="w-full px-4 py-2 border border-[#c2c9bb] rounded-lg focus:ring-2 focus:ring-[#154212] focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-[#154212] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2d5a27] transition-colors"
        >
          {platoEditando ? 'Guardar cambios' : 'Crear plato'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-[#c2c9bb] text-[#154212] px-4 py-2 rounded-lg font-bold hover:bg-[#a8afaa] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
