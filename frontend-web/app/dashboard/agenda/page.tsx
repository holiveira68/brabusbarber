'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Appointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO' | 'FALTOU';
  client: { name: string; phone: string | null };
  barber: { user: { name: string } };
  service: { name: string; price: string };
}

const statusStyles: Record<Appointment['status'], string> = {
  PENDENTE: 'text-brass border-brass/40 bg-brass/10',
  CONFIRMADO: 'text-bone border-bone/30 bg-bone/5',
  CONCLUIDO: 'text-green-400 border-green-400/30 bg-green-400/10',
  CANCELADO: 'text-bone-muted border-bone/10 bg-transparent line-through',
  FALTOU: 'text-oxblood-light border-oxblood/40 bg-oxblood/10',
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AgendaPage() {
  const [date, setDate] = useState(todayISO());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .get<Appointment[]>(`/appointments?date=${date}`)
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [date]);

  async function updateStatus(id: number, status: Appointment['status']) {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  }

  return (
    <div>
      <span className="ticket-number">AGENDA</span>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-bone">Agendamentos do dia</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field w-auto"
        />
      </div>

      {loading && <p className="mt-8 text-bone-muted">Carregando agenda...</p>}
      {error && <p className="mt-8 text-oxblood-light">{error}</p>}

      {!loading && appointments.length === 0 && !error && (
        <div className="card mt-8">
          <p className="text-bone-muted">Nenhum agendamento para esta data.</p>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="card flex flex-col justify-between gap-4 md:flex-row md:items-center"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-lg text-brass">{appt.startTime}</span>
              <div>
                <p className="text-bone">{appt.client.name}</p>
                <p className="text-xs text-bone-muted">
                  {appt.service.name} · {appt.barber.user.name}
                  {appt.client.phone ? ` · ${appt.client.phone}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-sm border px-3 py-1 text-xs font-display tracking-wide ${statusStyles[appt.status]}`}
              >
                {appt.status}
              </span>

              {(appt.status === 'PENDENTE' || appt.status === 'CONFIRMADO') && (
                <div className="flex gap-2">
                  {appt.status === 'PENDENTE' && (
                    <button
                      onClick={() => updateStatus(appt.id, 'CONFIRMADO')}
                      className="text-xs text-brass hover:underline"
                    >
                      Confirmar
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(appt.id, 'CONCLUIDO')}
                    className="text-xs text-green-400 hover:underline"
                  >
                    Concluir
                  </button>
                  <button
                    onClick={() => updateStatus(appt.id, 'FALTOU')}
                    className="text-xs text-oxblood-light hover:underline"
                  >
                    Faltou
                  </button>
                  <button
                    onClick={() => updateStatus(appt.id, 'CANCELADO')}
                    className="text-xs text-bone-muted hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
