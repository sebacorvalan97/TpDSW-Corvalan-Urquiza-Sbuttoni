import { useState, useEffect } from 'react';
import { RecetaIngrediente, Ingrediente } from '../types';
import { recetaIngredienteService } from '../services/receta-ingrediente.service';
import { ingredienteService } from '../services/ingrediente.service';

interface Props {
  recetaId: number;
}

export default function AgregarIngredientesAReceta({ recetaId }: Props) {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [recetaIngredientes, setRecetaIngredientes] = useState<
    RecetaIngrediente[]
  >([]);
  const [selectedIngrediente, setSelectedIngrediente] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [unidad, setUnidad] = useState<string>('');

  useEffect(() => {
    loadIngredientes();
    loadRecetaIngredientes();
  }, [recetaId]);

  const loadIngredientes = async () => {
    try {
      const data = await ingredienteService.getAll();
      setIngredientes(data);
    } catch (error) {
      console.error('Error cargando ingredientes:', error);
    }
  };

  const loadRecetaIngredientes = async () => {
    try {
      const data = await recetaIngredienteService.getByRecetaId(recetaId);
      setRecetaIngredientes(data);
    } catch (error) {
      console.error('Error cargando ingredientes de receta:', error);
    }
  };

  const handleAgregar = async () => {
    if (!selectedIngrediente || !cantidad || !unidad) {
      alert('Completa todos los campos');
      return;
    }

    try {
      const newItem = await recetaIngredienteService.addToReceta(
        recetaId,
        parseInt(selectedIngrediente),
        cantidad,
        unidad,
      );
      setRecetaIngredientes([...recetaIngredientes, newItem]);
      setSelectedIngrediente('');
      setCantidad(1);
      setUnidad('');
    } catch (error) {
      console.error('Error agregando ingrediente:', error);
    }
  };

  return (
    <div className="border p-4 rounded">
      <h3 className="font-bold mb-4">Agregar Ingredientes a Receta</h3>

      <div className="space-y-3 mb-4">
        <select
          value={selectedIngrediente}
          onChange={(e) => setSelectedIngrediente(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Selecciona un ingrediente</option>
          {ingredientes.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {ing.nombre}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(parseFloat(e.target.value))}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Unidad (tazas, kg, ml, etc)"
          value={unidad}
          onChange={(e) => setUnidad(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={handleAgregar}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Agregar Ingrediente
        </button>
      </div>

      <h4 className="font-semibold mb-2">Ingredientes en esta Receta:</h4>
      {recetaIngredientes.length === 0 ? (
        <p className="text-gray-500">No hay ingredientes agregados</p>
      ) : (
        <ul className="space-y-2">
          {recetaIngredientes.map((ri) => (
            <li
              key={ri.idRecetaIngrediente}
              className="border p-2 rounded text-sm"
            >
              Ingrediente ID {ri.ingredienteId}: {ri.cantidad} {ri.unidad}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
