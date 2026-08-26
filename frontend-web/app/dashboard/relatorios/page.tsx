'use client';

import { useEffect, useState } from 'react';
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

interface BarberPerformance {
  barbeiro: string;
  atendimentosConcluidos: number;
  faltas: number;
  faturamentoGerado: number;
}

export default function RelatoriosPage() {
  const [data, setData] = useState<BarberPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<BarberPerformance[]>('/reports/desempenho-barbeiros')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <span className="ticket-number">GERENCIAL</span>
      <h1 className="mt-2 font-display text-3xl text-bone">
        Desempenho por barbeiro
      </h1>

      {loading && <p className="mt-8 text-bone-muted">Carregando relatório...</p>}

      {!loading && (
        <>
          <div className="card mt-8">
            <span className="text-xs text-bone-muted">Faturamento gerado (R$)</span>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="barbeiro" stroke="#9B968D" fontSize={12} />
                  <YAxis stroke="#9B968D" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#18181b',
                      border: '1px solid #ffffff20',
                      color: '#F3EFE8',
                    }}
                  />
                  <Bar dataKey="faturamentoGerado" fill="#C9A24B" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {data.map((b) => (
              <div key={b.barbeiro} className="card">
                <h3 className="font-display text-lg text-bone">{b.barbeiro}</h3>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-display text-2xl text-brass">
                      {b.atendimentosConcluidos}
                    </p>
                    <p className="text-xs text-bone-muted">Concluídos</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-oxblood-light">
                      {b.faltas}
                    </p>
                    <p className="text-xs text-bone-muted">Faltas</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-bone">
                      {b.faturamentoGerado.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                    <p className="text-xs text-bone-muted">Faturado</p>
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
