'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { api } from '@/lib/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface BarberPerformance {
  barbeiro: string;
  atendimentosConcluidos: number;
  faltas: number;
  cancelados: number;
  taxaComparecimento: number;
  faturamentoGerado: number;
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

function normalize(rows: BarberPerformance[]): BarberPerformance[] {
  return (Array.isArray(rows) ? rows : []).map((b) => ({
    ...b,
    atendimentosConcluidos: Number(b.atendimentosConcluidos ?? 0),
    faltas: Number(b.faltas ?? 0),
    cancelados: Number(b.cancelados ?? 0),
    taxaComparecimento: Number(b.taxaComparecimento ?? 100),
    faturamentoGerado: Number(b.faturamentoGerado ?? 0),
  }));
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
      return { start: toISO(new Date(now.getFullYear(), now.getMonth(), 1)), end: toISO(now) };
    },
  },
  {
    label: 'Mês anterior',
    getDates: () => {
      const now = new Date();
      return {
        start: toISO(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        end: toISO(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    },
  },
];

// ─── Tooltip personalizado ────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-sm border border-bone/20 bg-ink-soft p-3 text-sm shadow-lg">
      <p className="font-display text-bone mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name === 'faturamentoGerado'
            ? fmtBRL(p.value)
            : `${p.value} ${p.name === 'atendimentosConcluidos' ? 'concluídos' : p.name}`}
        </p>
      ))}
    </div>
  );
}

// ─── Barra de comparecimento ──────────────────────────────────────────────────

function AttendanceBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#4ADE80' : pct >= 60 ? '#C9A24B' : '#B14545';
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-bone-muted">Comparecimento</span>
        <span className="text-sm font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Página de Relatórios ─────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const defaultEnd = toISO(new Date());
  const defaultStart = toISO(new Date(Date.now() - 29 * 86400000));

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [activePreset, setActivePreset] = useState('30 dias');

  const [data, setData] = useState<BarberPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback((start: string, end: string) => {
    setLoading(true);
    setError(null);
    const qs = `?startDate=${start}T00:00:00.000Z&endDate=${end}T23:59:59.999Z`;
    api
      .get<BarberPerformance[]>(`/reports/desempenho-barbeiros${qs}`)
      .then((rows) => setData(normalize(rows)))
      .catch((err) => setError(err?.message ?? 'Erro ao carregar relatório.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData(startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyPreset(preset: (typeof PRESETS)[number]) {
    const { start, end } = preset.getDates();
    setActivePreset(preset.label);
    setStartDate(start);
    setEndDate(end);
    fetchData(start, end);
  }

  function handleApply() {
    setActivePreset('');
    fetchData(startDate, endDate);
  }

  return (
    <div>
      {/* ── Cabeçalho ── */}
      <span className="ticket-number">GERENCIAL</span>
      <h1 className="mt-2 font-display text-3xl text-bone">
        Desempenho por barbeiro
      </h1>
      <p className="mt-1 text-bone-muted">
        Analise atendimentos, faltas e faturamento por período.
      </p>

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

        {/* Date inputs + botão */}
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

        {data.length > 0 && (
          <p className="mt-3 text-xs text-bone-muted">
            📅 Dados de{' '}
            <span className="text-brass font-semibold">{fmtDate(startDate)}</span>
            {' '}até{' '}
            <span className="text-brass font-semibold">{fmtDate(endDate)}</span>
          </p>
        )}
      </div>

      {/* ── Feedback ── */}
      {loading && (
        <p className="mt-8 text-bone-muted animate-pulse">Carregando relatório...</p>
      )}
      {error && (
        <div className="mt-4 rounded-sm border border-oxblood-light/40 bg-oxblood/10 p-4">
          <p className="text-sm text-oxblood-light">{error}</p>
          <button
            onClick={() => fetchData(startDate, endDate)}
            className="mt-2 text-xs text-brass underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && data.length === 0 && !error && (
        <div className="mt-8 card text-center">
          <p className="text-bone-muted">Nenhum dado encontrado para o período selecionado.</p>
        </div>
      )}

      {/* ── Gráfico de faturamento ── */}
      {!loading && data.length > 0 && (
        <>
          <div className="card mt-6">
            <span className="text-xs text-bone-muted uppercase tracking-widest">
              Faturamento gerado por barbeiro (R$)
            </span>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="barbeiro" stroke="#9B968D" fontSize={12} />
                  <YAxis
                    stroke="#9B968D"
                    fontSize={12}
                    tickFormatter={(v) =>
                      v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="faturamentoGerado"
                    name="faturamentoGerado"
                    fill="#C9A24B"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Gráfico de atendimentos vs faltas ── */}
          <div className="card mt-4">
            <span className="text-xs text-bone-muted uppercase tracking-widest">
              Atendimentos × Faltas × Cancelados
            </span>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="barbeiro" stroke="#9B968D" fontSize={12} />
                  <YAxis stroke="#9B968D" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="atendimentosConcluidos" name="atendimentosConcluidos" fill="#4ADE80" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="faltas" name="faltas" fill="#B14545" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="cancelados" name="cancelados" fill="#9B968D" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Cards por barbeiro ── */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {data.map((b) => (
              <div key={b.barbeiro} className="card">
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-lg text-bone">{b.barbeiro}</h3>
                  <span className="font-display text-lg text-brass">
                    {fmtBRL(b.faturamentoGerado)}
                  </span>
                </div>

                <AttendanceBar pct={b.taxaComparecimento} />

                <div className="mt-4 grid grid-cols-3 gap-3 text-center border-t border-bone/10 pt-4">
                  <div>
                    <p className="font-display text-2xl" style={{ color: '#4ADE80' }}>
                      {b.atendimentosConcluidos}
                    </p>
                    <p className="text-xs text-bone-muted mt-1">Concluídos</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl" style={{ color: '#B14545' }}>
                      {b.faltas}
                    </p>
                    <p className="text-xs text-bone-muted mt-1">Faltas</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-bone-muted">
                      {b.cancelados}
                    </p>
                    <p className="text-xs text-bone-muted mt-1">Cancelados</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
