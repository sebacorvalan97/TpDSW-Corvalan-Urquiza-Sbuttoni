import { useState, useEffect } from 'react';
import type { RecetaIngrediente, IngredienteApi } from '../types';
import { recetaIngredienteService } from '../services/receta-ingrediente.service';
import { ingredientService } from '../services/ingredient.service';
import { recetaService } from '../services/receta.service';

export default function AgregarIngredientesAReceta() {
  const [recetas, setRecetas] = useState<Awaited<ReturnType<typeof recetaService.getAllRecetas>>>([]);
  const [selectedRecetaId, setSelectedRecetaId] = useState<number | null>(null);
  const [ingredientes, setIngredientes] = useState<IngredienteApi[]>([]);
  const [recetaIngredientes, setRecetaIngredientes] = useState<
    RecetaIngrediente[]
  >([]);
  const [selectedIngrediente, setSelectedIngrediente] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [unidad, setUnidad] = useState<string>('');

  useEffect(() => {
    loadRecetas();
    loadIngredientes();
  }, []);

  useEffect(() => {
    if (selectedRecetaId) {
      loadRecetaIngredientes(selectedRecetaId);
    }
  }, [selectedRecetaId]);

  const loadRecetas = async () => {
    try {
      const data = await recetaService.getAllRecetas();
      setRecetas(data);
    } catch (error) {
      console.error('Error cargando recetas:', error);
    }
  };

  const loadIngredientes = async () => {
    try {
      const data = await ingredientService.getAll();
      setIngredientes(data);
    } catch (error) {
      console.error('Error cargando ingredientes:', error);
    }
  };

  const loadRecetaIngredientes = async (recetaId: number) => {
    try {
      const data = await recetaIngredienteService.getByRecetaId(recetaId);
      setRecetaIngredientes(data);
    } catch (error) {
      console.error('Error cargando ingredientes de receta:', error);
    }
  };

  const handleAgregar = async () => {
    if (!selectedRecetaId || !selectedIngrediente || !cantidad || !unidad) {
      alert('Completa todos los campos');
      return;
    }

    try {
      const newItem = await recetaIngredienteService.addToReceta(
        selectedRecetaId,
        Number(selectedIngrediente),
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
          value={selectedRecetaId || ''}
          onChange={(e) =>
            setSelectedRecetaId(
              e.target.value ? parseInt(e.target.value) : null,
            )
          }
          className="w-full border p-2 rounded"
        >
          <option value="">Selecciona una receta</option>
          {recetas.map((rec) => (
            <option key={rec.idRecipe} value={rec.idRecipe}>
              Receta {rec.idRecipe}
            </option>
          ))}
        </select>

        {selectedRecetaId && (
          <>
            <select
              value={selectedIngrediente}
              onChange={(e) => setSelectedIngrediente(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Selecciona un ingrediente</option>
              {ingredientes.map((ing) => (
                <option key={ing.idIngredient} value={ing.idIngredient}>
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

            <h4 className="font-semibold mb-2 mt-4">
              Ingredientes en esta Receta:
            </h4>
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
          </>
        )}
      </div>
    </div>
  );
}
