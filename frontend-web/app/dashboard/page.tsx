'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Summary {
  faturamentoMes: number;
  taxaComparecimento: number;
  agendamentosHoje: number;
  servicosMaisVendidos: { nome: string; totalAgendamentos: number }[];
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    api
      .get<Summary>('/reports/resumo')
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, [user]);

  return (
    <div>
      <span className="ticket-number">PAINEL</span>
      <h1 className="mt-2 font-display text-3xl text-bone">
        Olá, {user?.name.split(' ')[0]}
      </h1>
      <p className="mt-1 text-bone-muted">
        Aqui está o panorama da BRABUS BARBER hoje.
      </p>

      {user?.role !== 'ADMIN' && (
        <div className="card mt-8">
          <p className="text-bone-muted">
            Use o menu <strong className="text-bone">Agenda</strong> para ver
            seus próprios atendimentos do dia.
          </p>
        </div>
      )}

      {error && <p className="mt-6 text-oxblood-light">{error}</p>}

      {summary && (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="card">
            <span className="text-xs text-bone-muted">Faturamento do mês</span>
            <p className="mt-2 font-display text-3xl text-brass">
              {summary.faturamentoMes.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div className="card">
            <span className="text-xs text-bone-muted">Taxa de comparecimento</span>
            <p className="mt-2 font-display text-3xl text-bone">
              {summary.taxaComparecimento}%
            </p>
          </div>
          <div className="card">
            <span className="text-xs text-bone-muted">Agendamentos hoje</span>
            <p className="mt-2 font-display text-3xl text-bone">
              {summary.agendamentosHoje}
            </p>
          </div>

          <div className="card md:col-span-3">
            <span className="text-xs text-bone-muted">Serviços mais vendidos</span>
            <div className="mt-4 space-y-3">
              {summary.servicosMaisVendidos.map((s) => (
                <div key={s.nome} className="flex items-center justify-between">
                  <span className="text-sm text-bone">{s.nome}</span>
                  <span className="font-mono text-sm text-brass">
                    {s.totalAgendamentos} agendamentos
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
