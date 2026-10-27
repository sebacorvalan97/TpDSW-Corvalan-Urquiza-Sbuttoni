interface Plato {
  idDish: number;
  name: string;
  description: string;
}

interface PlatoListProps {
  platos: Plato[];
  onEdit: (plato: Plato) => void;
  onDelete: (idDish: number) => void;
}

export function PlatoList({ platos, onEdit, onDelete }: PlatoListProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg text-[#154212]">
        Lista de Platos ({platos.length})
      </h2>
      {platos.length === 0 ? (
        <p className="text-[#605e5b] text-center py-8">
          No hay platos creados aún
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platos.map((plato) => (
            <div
              key={plato.idDish}
              className="p-4 border border-[#c2c9bb] rounded-lg bg-[#fbf9f8] hover:shadow-md transition-shadow"
            >
              <h3 className="font-bold text-[#154212] mb-2">{plato.name}</h3>
              <p className="text-[#605e5b] text-sm mb-4">{plato.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(plato)}
                  className="flex-1 bg-[#bcf0ae] text-[#154212] px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-[#a8e496] transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(plato.idDish)}
                  className="flex-1 bg-[#e8c9c9] text-[#8b3a3a] px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-[#d9b0b0] transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
