import { useState, type FormEvent } from 'react';
import { recipeCatalogService, type DifficultyApi, type OriginApi } from '../services/recipe-catalog.service';
import { getErrorMessage } from '../services/http';
import type { Dificultad, Origen } from '../types';

interface Props {
  origins: Origen[];
  difficulties: Dificultad[];
  onOriginsChanged: (origins: Origen[]) => void;
  onDifficultiesChanged: (difficulties: Dificultad[]) => void;
}

export default function RecipeCatalogCrud({ origins, difficulties, onOriginsChanged, onDifficultiesChanged }: Props) {
  const [originName, setOriginName] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [difficultyName, setDifficultyName] = useState('');
  const [error, setError] = useState('');

  const updateOrigin = (item: OriginApi, nombre: string, pais: string) => {
    void recipeCatalogService.updateOrigin(item.idOrigin, { nombre, pais }).then(async () => {
      onOriginsChanged((await recipeCatalogService.getOrigins()).map((origin) => ({ id: String(origin.idOrigin), pais: origin.pais, nombre: origin.nombre, bandera: '' })));
    }).catch((cause: unknown) => setError(getErrorMessage(cause)));
  };
  const deleteOrigin = (id: number) => {
    void recipeCatalogService.deleteOrigin(id).then(async () => {
      onOriginsChanged((await recipeCatalogService.getOrigins()).map((origin) => ({ id: String(origin.idOrigin), pais: origin.pais, nombre: origin.nombre, bandera: '' })));
    }).catch((cause: unknown) => setError(getErrorMessage(cause)));
  };
  const updateDifficulty = (item: DifficultyApi, nivel: string) => {
    void recipeCatalogService.updateDifficulty(item.idDifficulty, nivel).then(async () => {
      onDifficultiesChanged((await recipeCatalogService.getDifficulties()).map((difficulty) => ({ id: String(difficulty.idDifficulty), nivel: difficulty.nivel })));
    }).catch((cause: unknown) => setError(getErrorMessage(cause)));
  };
  const deleteDifficulty = (id: number) => {
    void recipeCatalogService.deleteDifficulty(id).then(async () => {
      onDifficultiesChanged((await recipeCatalogService.getDifficulties()).map((difficulty) => ({ id: String(difficulty.idDifficulty), nivel: difficulty.nivel })));
    }).catch((cause: unknown) => setError(getErrorMessage(cause)));
  };
  const createOrigin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError('');
      await recipeCatalogService.createOrigin({ nombre: originName.trim(), pais: originCountry.trim() });
      onOriginsChanged((await recipeCatalogService.getOrigins()).map((origin) => ({ id: String(origin.idOrigin), pais: origin.pais, nombre: origin.nombre, bandera: '' })));
      setOriginName('');
      setOriginCountry('');
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    }
  };
  const createDifficulty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError('');
      await recipeCatalogService.createDifficulty(difficultyName.trim());
      onDifficultiesChanged((await recipeCatalogService.getDifficulties()).map((difficulty) => ({ id: String(difficulty.idDifficulty), nivel: difficulty.nivel })));
      setDifficultyName('');
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    }
  };

  return (
    <section className="space-y-4 rounded-xl border border-[#c2c9bb] bg-white p-5">
      <h2 className="text-xl font-bold text-[#154212]">Orígenes y dificultades</h2>
      {error && <p className="rounded bg-[#ffdad6] p-2 text-sm text-[#93000a]" role="alert">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h3 className="font-semibold">Orígenes</h3>
          <form className="flex flex-wrap gap-2" onSubmit={(event) => void createOrigin(event)}>
            <input aria-label="Nombre del origen" className="min-w-32 flex-1 rounded border p-2" maxLength={150} placeholder="Nombre o región" required value={originName} onChange={(event) => setOriginName(event.target.value)} />
            <input aria-label="País de referencia" className="min-w-32 flex-1 rounded border p-2" maxLength={100} placeholder="País" required value={originCountry} onChange={(event) => setOriginCountry(event.target.value)} />
            <button className="rounded bg-[#154212] px-3 py-2 text-white" type="submit">Agregar</button>
          </form>
          {origins.map((origin) => {
            const id = Number(origin.id);
            return <OriginRow key={origin.id} origin={origin} onSave={(name, country) => updateOrigin({ idOrigin: id, nombre: name, pais: country }, name, country)} onDelete={() => deleteOrigin(id)} />;
          })}
        </section>
        <section className="space-y-3">
          <h3 className="font-semibold">Dificultades</h3>
          <form className="flex gap-2" onSubmit={(event) => void createDifficulty(event)}>
            <input aria-label="Nivel de dificultad" className="min-w-32 flex-1 rounded border p-2" maxLength={50} placeholder="Ej. Fácil" required value={difficultyName} onChange={(event) => setDifficultyName(event.target.value)} />
            <button className="rounded bg-[#154212] px-3 py-2 text-white" type="submit">Agregar</button>
          </form>
          {difficulties.map((difficulty) => {
            const id = Number(difficulty.id);
            return <DifficultyRow key={difficulty.id} difficulty={difficulty} onSave={(level) => updateDifficulty({ idDifficulty: id, nivel: level }, level)} onDelete={() => deleteDifficulty(id)} />;
          })}
        </section>
      </div>
    </section>
  );
}

function OriginRow({ origin, onSave, onDelete }: { origin: Origen; onSave: (name: string, country: string) => void; onDelete: () => void }) {
  const [name, setName] = useState(origin.nombre ?? origin.pais);
  const [country, setCountry] = useState(origin.pais);
  return <div className="flex gap-2">
    <input aria-label="Nombre del origen" className="min-w-0 flex-1 rounded border p-2" value={name} onChange={(event) => setName(event.target.value)} />
    <input aria-label="País de origen" className="min-w-0 flex-1 rounded border p-2" value={country} onChange={(event) => setCountry(event.target.value)} />
    <button className="text-sm text-[#154212]" onClick={() => onSave(name, country)} type="button">Guardar</button>
    <button className="text-sm text-red-700" onClick={onDelete} type="button">Borrar</button>
  </div>;
}

function DifficultyRow({ difficulty, onSave, onDelete }: { difficulty: Dificultad; onSave: (level: string) => void; onDelete: () => void }) {
  const [level, setLevel] = useState(difficulty.nivel);
  return <div className="flex gap-2">
    <input aria-label="Nivel de dificultad" className="min-w-0 flex-1 rounded border p-2" value={level} onChange={(event) => setLevel(event.target.value)} />
    <button className="text-sm text-[#154212]" onClick={() => onSave(level)} type="button">Guardar</button>
    <button className="text-sm text-red-700" onClick={onDelete} type="button">Borrar</button>
  </div>;
}
