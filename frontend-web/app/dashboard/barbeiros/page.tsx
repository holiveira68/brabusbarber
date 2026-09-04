'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Barber {
  id: number;
  bio: string | null;
  specialties: string | null;
  active: boolean;
  user: { name: string; email: string; phone: string | null };
  workingHours: { weekday: number; startTime: string; endTime: string }[];
  services: { service: { id: number; name: string } }[];
}

interface ServiceOption {
  id: number;
  name: string;
}

const weekdayLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const weekdayShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const emptyNewBarberForm = { name: '', email: '', password: '', phone: '' };

// Estrutura auxiliar usada só na tela para editar a grade semanal:
// um item por dia da semana, com "ativo" controlando se ele entra no envio.
interface WeekdayRow {
  weekday: number;
  active: boolean;
  startTime: string;
  endTime: string;
}

function buildWeekRows(existing: Barber['workingHours']): WeekdayRow[] {
  return weekdayLabels.map((_, weekday) => {
    const found = existing.find((h) => h.weekday === weekday);
    return {
      weekday,
      active: !!found,
      startTime: found?.startTime || '09:00',
      endTime: found?.endTime || '18:00',
    };
  });
}

export default function BarbeirosPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newBarberForm, setNewBarberForm] = useState(emptyNewBarberForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [weekRows, setWeekRows] = useState<WeekdayRow[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      api.get<Barber[]>('/barbers?includeInactive=true'),
      api.get<ServiceOption[]>('/services?active=true'),
    ])
      .then(([barbersData, servicesData]) => {
        setBarbers(barbersData);
        setServices(servicesData);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreateBarber(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      await api.post('/users', {
        name: newBarberForm.name,
        email: newBarberForm.email,
        password: newBarberForm.password,
        phone: newBarberForm.phone || undefined,
        role: 'BARBEIRO',
      });
      setNewBarberForm(emptyNewBarberForm);
      setShowNewForm(false);
      load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Erro ao cadastrar barbeiro');
    } finally {
      setCreating(false);
    }
  }

  function startEditing(barber: Barber) {
    setEditingId(barber.id);
    setWeekRows(buildWeekRows(barber.workingHours));
    setSelectedServiceIds(barber.services.map((s) => s.service.id));
    setScheduleError(null);
  }

  function toggleService(id: number) {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function updateRow(weekday: number, patch: Partial<WeekdayRow>) {
    setWeekRows((prev) =>
      prev.map((row) => (row.weekday === weekday ? { ...row, ...patch } : row)),
    );
  }

  async function handleSaveSchedule(barberId: number) {
    setSavingSchedule(true);
    setScheduleError(null);
    try {
      const hours = weekRows
        .filter((row) => row.active)
        .map((row) => ({
          weekday: row.weekday,
          startTime: row.startTime,
          endTime: row.endTime,
        }));

      if (hours.length === 0) {
        throw new Error('Selecione pelo menos um dia de atendimento');
      }

      await api.put(`/barbers/${barberId}/horarios`, { hours });
      await api.patch(`/barbers/${barberId}`, { serviceIds: selectedServiceIds });

      setEditingId(null);
      load();
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSavingSchedule(false);
    }
  }

  async function toggleActive(barber: Barber) {
    await api.patch(`/barbers/${barber.id}`, { active: !barber.active });
    load();
  }

  async function handleDeleteBarber(id: number) {
    if (!confirm('Deseja excluir permanentemente este barbeiro e a conta dele?')) return;
    try {
      await api.delete(`/barbers/${id}`);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir barbeiro');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="ticket-number">EQUIPE</span>
          <h1 className="mt-2 font-display text-3xl text-bone">Barbeiros</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowNewForm((v) => !v)} className="btn-primary">
            {showNewForm ? 'Cancelar' : '+ Novo barbeiro'}
          </button>
        )}
      </div>

      {isAdmin && showNewForm && (
        <form onSubmit={handleCreateBarber} className="card mt-6 max-w-lg space-y-4">
          <h2 className="font-display text-lg text-bone">Cadastrar novo barbeiro</h2>
          <p className="text-xs text-bone-muted">
            Um usuário com papel BARBEIRO é criado, e o perfil de barbeiro já
            entra vinculado automaticamente.
          </p>

          <div>
            <label className="mb-1 block text-xs text-bone-muted">Nome</label>
            <input
              required
              value={newBarberForm.name}
              onChange={(e) => setNewBarberForm({ ...newBarberForm, name: e.target.value })}
              className="input-field"
              placeholder="Ex: Pedro Alves"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-bone-muted">E-mail</label>
            <input
              required
              type="email"
              value={newBarberForm.email}
              onChange={(e) => setNewBarberForm({ ...newBarberForm, email: e.target.value })}
              className="input-field"
              placeholder="pedro@brabusbarber.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-bone-muted">Senha provisória</label>
              <input
                required
                type="text"
                minLength={6}
                value={newBarberForm.password}
                onChange={(e) => setNewBarberForm({ ...newBarberForm, password: e.target.value })}
                className="input-field"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-bone-muted">Telefone</label>
              <input
                value={newBarberForm.phone}
                onChange={(e) => setNewBarberForm({ ...newBarberForm, phone: e.target.value })}
                className="input-field"
                placeholder="(12) 99999-0000"
              />
            </div>
          </div>

          {createError && <p className="text-sm text-oxblood-light">{createError}</p>}

          <button type="submit" disabled={creating} className="btn-primary w-full">
            {creating ? 'Cadastrando...' : 'Cadastrar barbeiro'}
          </button>
        </form>
      )}

      {loading && <p className="mt-8 text-bone-muted">Carregando...</p>}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {barbers.map((b) => (
          <div key={b.id} className="card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-bone">{b.user.name}</h2>
              {isAdmin ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(b)}
                    className={`rounded-sm border px-2 py-0.5 text-xs ${
                      b.active
                        ? 'border-brass/40 text-brass'
                        : 'border-bone/20 text-bone-muted'
                    }`}
                  >
                    {b.active ? 'Ativo' : 'Inativo'}
                  </button>
                  <button
                    onClick={() => handleDeleteBarber(b.id)}
                    className="rounded-sm border border-oxblood/40 px-2 py-0.5 text-xs text-oxblood-light hover:bg-oxblood/20"
                  >
                    Excluir
                  </button>
                </div>
              ) : (
                <span
                  className={`rounded-sm border px-2 py-0.5 text-xs ${
                    b.active
                      ? 'border-brass/40 text-brass'
                      : 'border-bone/20 text-bone-muted'
                  }`}
                >
                  {b.active ? 'Ativo' : 'Inativo'}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-bone-muted">{b.user.email}</p>
            {b.specialties && <p className="mt-2 text-xs text-brass">{b.specialties}</p>}

            {editingId !== b.id ? (
              <>
                <div className="mt-4 border-t border-bone/10 pt-4">
                  <span className="text-xs text-bone-muted">Horários de trabalho</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {b.workingHours.length === 0 && (
                      <span className="text-xs text-bone-muted">Não configurado</span>
                    )}
                    {b.workingHours
                      .sort((a, c) => a.weekday - c.weekday)
                      .map((wh) => (
                        <span
                          key={wh.weekday}
                          className="rounded-sm bg-ink-soft px-2 py-1 font-mono text-xs text-bone"
                        >
                          {weekdayShort[wh.weekday]} {wh.startTime}–{wh.endTime}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-bone/10 pt-4">
                  <span className="text-xs text-bone-muted">Serviços realizados</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {b.services.length === 0 && (
                      <span className="text-xs text-bone-muted">Nenhum serviço vinculado</span>
                    )}
                    {b.services.map((s) => (
                      <span
                        key={s.service.id}
                        className="rounded-sm border border-bone/10 px-2 py-1 text-xs text-bone"
                      >
                        {s.service.name}
                      </span>
                    ))}
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => startEditing(b)}
                    className="btn-outline mt-4 w-full text-xs"
                  >
                    Editar horários e serviços
                  </button>
                )}
              </>
            ) : (
              <div className="mt-4 border-t border-bone/10 pt-4">
                <span className="text-xs text-bone-muted">Dias e horários de atendimento</span>
                <div className="mt-3 space-y-2">
                  {weekRows.map((row) => (
                    <div key={row.weekday} className="flex items-center gap-2">
                      <label className="flex w-28 items-center gap-2 text-xs text-bone">
                        <input
                          type="checkbox"
                          checked={row.active}
                          onChange={(e) => updateRow(row.weekday, { active: e.target.checked })}
                        />
                        {weekdayShort[row.weekday]}
                      </label>
                      <input
                        type="time"
                        value={row.startTime}
                        disabled={!row.active}
                        onChange={(e) => updateRow(row.weekday, { startTime: e.target.value })}
                        className="input-field py-1.5 text-xs disabled:opacity-30"
                      />
                      <span className="text-bone-muted">–</span>
                      <input
                        type="time"
                        value={row.endTime}
                        disabled={!row.active}
                        onChange={(e) => updateRow(row.weekday, { endTime: e.target.value })}
                        className="input-field py-1.5 text-xs disabled:opacity-30"
                      />
                    </div>
                  ))}
                </div>

                <span className="mt-4 block text-xs text-bone-muted">Serviços realizados</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {services.map((s) => (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-sm border px-2 py-1 text-xs ${
                        selectedServiceIds.includes(s.id)
                          ? 'border-brass/50 text-brass'
                          : 'border-bone/10 text-bone-muted'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedServiceIds.includes(s.id)}
                        onChange={() => toggleService(s.id)}
                      />
                      {s.name}
                    </label>
                  ))}
                </div>

                {scheduleError && (
                  <p className="mt-3 text-sm text-oxblood-light">{scheduleError}</p>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleSaveSchedule(b.id)}
                    disabled={savingSchedule}
                    className="btn-primary flex-1 text-xs"
                  >
                    {savingSchedule ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="btn-outline text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
