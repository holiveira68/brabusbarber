'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Summary {
  faturamentoPeriodo: number;
  taxaComparecimento: number;
  agendamentosHoje: number;
  agendamentosConcluidos: number;
  agendamentosComFalta: number;
  agendamentosCancelados: number;
  agendamentosPendentes: number;
  agendamentosConfirmados: number;
  totalNoPeriodo: number;
  servicosMaisVendidos: { nome: string; totalAgendamentos: number }[];
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtBRL(n: number) {
  return (n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const PRESETS = [
  { label: 'Hoje', getDates: () => { const t = toISO(new Date()); return { start: t, end: t }; } },
  { label: '7 dias', getDates: () => ({ start: toISO(new Date(Date.now() - 6 * 86400000)), end: toISO(new Date()) }) },
  { label: '15 dias', getDates: () => ({ start: toISO(new Date(Date.now() - 14 * 86400000)), end: toISO(new Date()) }) },
  { label: '30 dias', getDates: () => ({ start: toISO(new Date(Date.now() - 29 * 86400000)), end: toISO(new Date()) }) },
  {
    label: 'Mês atual',
    getDates: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toISO(start), end: toISO(now) };
    },
  },
  {
    label: 'Mês anterior',
    getDates: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: toISO(start), end: toISO(end) };
    },
  },
];

// ─── Componente de comparecimento ─────────────────────────────────────────────

function AttendanceBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#4ADE80' : pct >= 60 ? '#C9A24B' : '#B14545';
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-bone-muted">
          Taxa de comparecimento
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function DashboardHome() {
  const { user } = useAuth();

  const defaultEnd = toISO(new Date());
  const defaultStart = toISO(new Date(Date.now() - 29 * 86400000));

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [activePreset, setActivePreset] = useState('30 dias');

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(
    (start: string, end: string) => {
      if (user?.role !== 'ADMIN') return;
      setLoading(true);
      setError(null);
      const qs = `?startDate=${start}T00:00:00.000Z&endDate=${end}T23:59:59.999Z`;
      api
        .get<Summary>(`/reports/resumo${qs}`)
        .then((s) =>
          setSummary({
            ...s,
            faturamentoPeriodo: Number(s?.faturamentoPeriodo ?? 0),
            taxaComparecimento: Number(s?.taxaComparecimento ?? 100),
            agendamentosConcluidos: Number(s?.agendamentosConcluidos ?? 0),
            agendamentosComFalta: Number(s?.agendamentosComFalta ?? 0),
            agendamentosCancelados: Number(s?.agendamentosCancelados ?? 0),
            agendamentosPendentes: Number(s?.agendamentosPendentes ?? 0),
            agendamentosConfirmados: Number(s?.agendamentosConfirmados ?? 0),
            totalNoPeriodo: Number(s?.totalNoPeriodo ?? 0),
            agendamentosHoje: Number(s?.agendamentosHoje ?? 0),
            servicosMaisVendidos: Array.isArray(s?.servicosMaisVendidos)
              ? s.servicosMaisVendidos
              : [],
          })
        )
        .catch((err) => setError(err?.message ?? 'Erro ao carregar resumo.'))
        .finally(() => setLoading(false));
    },
    [user]
  );

  // Carrega ao montar
  useEffect(() => {
    fetchSummary(startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function applyPreset(preset: (typeof PRESETS)[number]) {
    const { start, end } = preset.getDates();
    setActivePreset(preset.label);
    setStartDate(start);
    setEndDate(end);
    fetchSummary(start, end);
  }

  function handleApply() {
    setActivePreset('');
    fetchSummary(startDate, endDate);
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div>
        <span className="ticket-number">PAINEL</span>
        <h1 className="mt-2 font-display text-3xl text-bone">
          Olá, {user?.name?.split(' ')[0]}
        </h1>
        <div className="card mt-8">
          <p className="text-bone-muted">
            Use o menu <strong className="text-bone">Agenda</strong> para ver
            seus próprios atendimentos do dia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Cabeçalho ── */}
      <span className="ticket-number">PAINEL</span>
      <h1 className="mt-2 font-display text-3xl text-bone">
        Olá, {user?.name?.split(' ')[0]} 👋
      </h1>
      <p className="mt-1 text-bone-muted">Resumo operacional da BRABUS BARBER.</p>

      {/* ── Seletor de período ── */}
      <div className="mt-6 card">
        <p className="text-xs text-bone-muted mb-3 tracking-widest uppercase">
          Período de análise
        </p>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={`rounded-sm border px-4 py-1.5 text-xs font-semibold transition ${
                activePreset === p.label
                  ? 'border-brass bg-brass text-ink'
                  : 'border-bone/20 text-bone-muted hover:border-brass hover:text-brass'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Inputs de data + botão aplicar */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-bone-muted">De</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => { setStartDate(e.target.value); setActivePreset(''); }}
              className="input-field w-40 text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-bone-muted">Até</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={toISO(new Date())}
              onChange={(e) => { setEndDate(e.target.value); setActivePreset(''); }}
              className="input-field w-40 text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <button
            onClick={handleApply}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Carregando…' : 'Aplicar'}
          </button>
        </div>

        {/* Indicador do período ativo */}
        {summary && (
          <p className="mt-3 text-xs text-bone-muted">
            📅 Exibindo dados de{' '}
            <span className="text-brass font-semibold">{fmtDate(startDate)}</span>
            {' '}até{' '}
            <span className="text-brass font-semibold">{fmtDate(endDate)}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-sm border border-oxblood-light/40 bg-oxblood/10 p-4">
          <p className="text-sm text-oxblood-light">{error}</p>
        </div>
      )}

      {/* ── Cards de métricas ── */}
      {summary && (
        <div className="mt-6 space-y-6">

          {/* Linha 1: faturamento + comparecimento + hoje */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card">
              <span className="text-xs text-bone-muted uppercase tracking-widest">
                Faturamento do período
              </span>
              <p className="mt-2 font-display text-3xl text-brass">
                {fmtBRL(summary.faturamentoPeriodo)}
              </p>
              <p className="mt-1 text-xs text-bone-muted">
                {summary.agendamentosConcluidos} atendimentos concluídos
              </p>
            </div>

            <div className="card">
              <span className="text-xs text-bone-muted uppercase tracking-widest">
                Comparecimento
              </span>
              <p
                className="mt-2 font-display text-4xl font-bold"
                style={{
                  color:
                    summary.taxaComparecimento >= 80
                      ? '#4ADE80'
                      : summary.taxaComparecimento >= 60
                      ? '#C9A24B'
                      : '#B14545',
                }}
              >
                {summary.taxaComparecimento}%
              </p>
              <AttendanceBar pct={summary.taxaComparecimento} />
              <p className="mt-2 text-xs text-bone-muted">
                {summary.agendamentosConcluidos} realizados ·{' '}
                {summary.agendamentosComFalta} faltas
              </p>
            </div>

            <div className="card">
              <span className="text-xs text-bone-muted uppercase tracking-widest">
                Agendamentos hoje
              </span>
              <p className="mt-2 font-display text-4xl text-bone">
                {summary.agendamentosHoje}
              </p>
              <p className="mt-1 text-xs text-bone-muted">
                {summary.totalNoPeriodo} no período selecionado
              </p>
            </div>
          </div>

          {/* Linha 2: breakdown por status */}
          <div className="card">
            <span className="text-xs text-bone-muted uppercase tracking-widest">
              Agendamentos por status no período
            </span>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {[
                { label: 'Concluídos', value: summary.agendamentosConcluidos, color: '#4ADE80' },
                { label: 'Faltas', value: summary.agendamentosComFalta, color: '#B14545' },
                { label: 'Cancelados', value: summary.agendamentosCancelados, color: '#9B968D' },
                { label: 'Confirmados', value: summary.agendamentosConfirmados, color: '#F3EFE8' },
                { label: 'Pendentes', value: summary.agendamentosPendentes, color: '#C9A24B' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="font-display text-2xl font-bold" style={{ color: item.color }}>
                    {item.value}
                  </p>
                  <p className="text-xs text-bone-muted mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Linha 3: serviços */}
          <div className="card">
            <span className="text-xs text-bone-muted uppercase tracking-widest">
              Serviços mais realizados
            </span>
            <div className="mt-4 space-y-3">
              {(summary.servicosMaisVendidos ?? []).length === 0 ? (
                <p className="text-sm text-bone-muted">
                  Nenhum serviço concluído no período selecionado.
                </p>
              ) : (
                (summary.servicosMaisVendidos ?? []).map((s, i) => (
                  <div key={s.nome} className="flex items-center gap-3">
                    <span className="w-6 text-center font-mono text-xs text-brass font-bold">
                      #{i + 1}
                    </span>
                    <span className="flex-1 text-sm text-bone">{s.nome}</span>
                    <span className="font-mono text-sm text-brass font-semibold">
                      {s.totalAgendamentos}×
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!summary && !loading && !error && (
        <p className="mt-8 text-bone-muted">Selecione um período e clique em Aplicar.</p>
      )}
    </div>
  );
}
