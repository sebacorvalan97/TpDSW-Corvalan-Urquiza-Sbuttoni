import { Plato } from '../types';

interface PlatoListProps {
  platos: Plato[];
  onEdit: (plato: Plato) => void;
  onDelete: (idDish: number) => void;
}

export function PlatoList({ platos, onEdit, onDelete }: PlatoListProps) {
  return (
    <div>
      <h2>Lista de Platos</h2>
      <ul>
        {platos.map((plato) => (
          <li key={plato.idDish}>
            <strong>{plato.name}</strong>: {plato.description}
            <button onClick={() => onEdit(plato)}>Editar</button>
            <button onClick={() => onDelete(plato.idDish)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
