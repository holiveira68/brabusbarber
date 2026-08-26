'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { api } from '@/lib/api';

interface Service {
  id: number;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  active: boolean;
}

const emptyForm = { name: '', description: '', price: '', durationMinutes: '' };

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function load() {
    setLoading(true);
    api
      .get<Service[]>('/services')
      .then(setServices)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      durationMinutes: Number(form.durationMinutes),
    };

    try {
      if (editingId) {
        await api.patch(`/services/${editingId}`, payload);
      } else {
        await api.post('/services', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar serviço');
    }
  }

  function startEdit(service: Service) {
    setEditingId(service.id);
    setError(null);
    setForm({
      name: service.name,
      description: service.description || '',
      price: String(service.price),
      durationMinutes: String(service.durationMinutes),
    });
    // Em telas menores o formulário fica abaixo da lista — rola até ele
    // pra deixar claro que a edição abriu, já que sem isso parece que o
    // clique em "Editar" não fez nada.
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleDeactivate(id: number) {
    if (!confirm('Desativar este serviço? Ele deixará de aparecer no app.')) return;
    setSavingId(id);
    try {
      await api.delete(`/services/${id}`);
      load();
    } finally {
      setSavingId(null);
    }
  }

  async function handleActivate(id: number) {
    setSavingId(id);
    try {
      await api.patch(`/services/${id}`, { active: true });
      load();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <span className="ticket-number">CATÁLOGO</span>
      <h1 className="mt-2 font-display text-3xl text-bone">Serviços</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {loading && <p className="text-bone-muted">Carregando...</p>}
          {services.map((s) => (
            <div
              key={s.id}
              className={`card flex items-center justify-between ${
                editingId === s.id ? 'border-brass/50' : ''
              }`}
            >
              <div>
                <p className={`text-bone ${!s.active && 'opacity-40 line-through'}`}>
                  {s.name}
                </p>
                <p className="text-xs text-bone-muted">
                  {s.durationMinutes} min ·{' '}
                  {Number(s.price).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                  {!s.active && <span className="ml-2 text-oxblood-light">Inativo</span>}
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                <button onClick={() => startEdit(s)} className="text-brass hover:underline">
                  Editar
                </button>
                {s.active ? (
                  <button
                    onClick={() => handleDeactivate(s.id)}
                    disabled={savingId === s.id}
                    className="text-oxblood-light hover:underline disabled:opacity-50"
                  >
                    {savingId === s.id ? 'Salvando...' : 'Desativar'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(s.id)}
                    disabled={savingId === s.id}
                    className="text-green-400 hover:underline disabled:opacity-50"
                  >
                    {savingId === s.id ? 'Salvando...' : 'Ativar'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="card h-fit space-y-4">
          <h2 className="font-display text-lg text-bone">
            {editingId ? 'Editar serviço' : 'Novo serviço'}
          </h2>

          <div>
            <label className="mb-1 block text-xs text-bone-muted">Nome</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="Ex: Corte Masculino"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-bone-muted">Descrição</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              placeholder="Opcional"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-bone-muted">Preço (R$)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-bone-muted">Duração (min)</label>
              <input
                required
                type="number"
                min="5"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {error && <p className="text-sm text-oxblood-light">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">
              {editingId ? 'Salvar alterações' : 'Adicionar serviço'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="btn-outline">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
