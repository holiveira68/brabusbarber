'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

interface Service {
  id: number;
  name: string;
  description?: string | null;
  price: string | number;
  durationMinutes: number;
  active: boolean;
}

const problemas = [
  {
    titulo: 'Telefone e WhatsApp lotados',
    texto: 'Cliente espera resposta pra saber se tem horário livre.',
  },
  {
    titulo: 'Agenda de caderno',
    texto: 'Horários batendo um em cima do outro, atrasos na certa.',
  },
  {
    titulo: 'Falta sem aviso',
    texto: 'Sem lembrete automático, o horário vago dá prejuízo.',
  },
  {
    titulo: 'Zero controle gerencial',
    texto: 'Nenhum dado sobre faturamento ou serviço mais vendido.',
  },
];

export default function LandingPage() {
  const [servicos, setServicos] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Service[]>('/services?active=true')
      .then((data) => setServicos(data))
      .catch((err) => console.error('Erro ao buscar serviços:', err))
      .finally(() => setLoading(false));
  }, []);
  return (
    <main>
      {/* NAV */}
      <header className="flex items-center justify-between px-6 py-6 md:px-16">
        <span className="flex items-center gap-3 font-display text-xl tracking-widest2 text-bone">
          <Image src="/LogoBrabus.png" alt="BRABUS BARBER" width={124} height={122} priority />
          BRABUS<span className="text-brass"> BARBER</span>
        </span>
        <Link href="/login" className="btn-outline text-xs">
          Área da equipe
        </Link>
      </header>

      {/* HERO */}
      <section className="grid gap-12 px-6 pb-20 pt-10 md:grid-cols-2 md:px-16 md:pt-16">
        <div className="flex flex-col justify-center">
          <span className="ticket-number mb-4">Nº 001 — SISTEMA DE AGENDAMENTO</span>
          <h1 className="text-5xl leading-[1.05] text-bone md:text-6xl">
            CORTE MARCADO
            <br />
            <span className="text-brass">SEM FILA</span> DE
            <br />
            WHATSAPP.
          </h1>
          <p className="mt-6 max-w-md font-body text-bone-muted">
            A BRABUS BARBER digitalizou o agendamento: o cliente escolhe
            barbeiro, serviço e horário direto pelo app — e a barbearia
            gerencia tudo pelo painel, em tempo real.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#como-funciona" className="btn-primary">
              Ver como funciona
            </a>
            <Link href="/login" className="btn-outline">
              Sou da equipe
            </Link>
          </div>
        </div>

        {/* Elemento assinatura: ticket de agendamento, como um comprovante de fila */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-sm -rotate-2 rounded-sm border border-brass/30 bg-ink-surface p-6 shadow-[0_0_60px_-15px_rgba(201,162,75,0.25)]">
            <div className="flex items-center justify-between border-b border-dashed border-bone/20 pb-4">
              <span className="font-display tracking-widest2 text-bone">
                COMPROVANTE
              </span>
              <span className="ticket-number">#0248</span>
            </div>
            <div className="space-y-3 py-5 font-body text-sm">
              <div className="flex justify-between">
                <span className="text-bone-muted">Barbeiro</span>
                <span className="text-bone">Lucas Silva</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone-muted">Serviço</span>
                <span className="text-bone">Combo Corte + Barba</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone-muted">Data</span>
                <span className="text-bone">Sáb, 14:30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone-muted">Status</span>
                <span className="text-brass">Confirmado</span>
              </div>
            </div>
            <div className="border-t border-dashed border-bone/20 pt-4 text-center font-mono text-xs text-bone-muted">
              APRESENTE ESTE HORÁRIO NA CHEGADA
            </div>
          </div>
        </div>
      </section>

      <div className="barber-stripe" />

      {/* PROBLEMA */}
      <section className="px-6 py-20 md:px-16">
        <h2 className="text-3xl text-bone md:text-4xl">
          O AGENDAMENTO MANUAL <span className="text-oxblood">CUSTA CARO</span>
        </h2>
        <p className="mt-4 max-w-2xl text-bone-muted">
          A maioria das barbearias ainda depende de telefone, WhatsApp ou
          caderno físico — um processo que gera filas, esquecimentos e
          faltas sem aviso.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {problemas.map((p) => (
            <div key={p.titulo} className="card">
              <h3 className="font-display text-lg text-brass">{p.titulo}</h3>
              <p className="mt-2 text-sm text-bone-muted">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="bg-ink-soft px-6 py-20 md:px-16">
        <h2 className="text-3xl text-bone md:text-4xl">
          UMA PLATAFORMA, <span className="text-brass">DUAS FRENTES</span>
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="card">
            <span className="ticket-number">APP · CLIENTE</span>
            <h3 className="mt-3 font-display text-2xl text-bone">
              Agende em poucos toques
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-bone-muted">
              <li>→ Horários disponíveis em tempo real</li>
              <li>→ Escolha de barbeiro e serviço</li>
              <li>→ Lembrete automático por notificação</li>
              <li>→ Cancelamento e remarcação fácil</li>
            </ul>
          </div>
          <div className="card">
            <span className="ticket-number">SITE · EQUIPE</span>
            <h3 className="mt-3 font-display text-2xl text-bone">
              Gerencie toda a operação
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-bone-muted">
              <li>→ Agenda por barbeiro, dia e semana</li>
              <li>→ Cadastro de serviços, preço e duração</li>
              <li>→ Relatórios de faturamento e comparecimento</li>
              <li>→ Controle de horários de trabalho da equipe</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="px-6 py-20 md:px-16">
        <h2 className="text-3xl text-bone md:text-4xl">SERVIÇOS</h2>
        <div className="mt-10 divide-y divide-bone/10 border-y border-bone/10">
          {loading ? (
            <p className="py-5 text-bone-muted">Carregando serviços...</p>
          ) : servicos.length === 0 ? (
            <p className="py-5 text-bone-muted">Nenhum serviço cadastrado no momento.</p>
          ) : (
            servicos.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-5"
              >
                <div className="flex items-center gap-4">
                  <span className="ticket-number">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <span className="font-display text-lg text-bone block">{s.name}</span>
                    {s.description && (
                      <span className="text-xs text-bone-muted">{s.description}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-bone-muted">
                  <span>{s.durationMinutes} min</span>
                  <span className="font-display text-brass">
                    {Number(s.price).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="barber-stripe" />

      {/* FOOTER */}
      <footer className="flex flex-col items-center gap-2 px-6 py-10 text-center text-xs text-bone-muted md:px-16">
        <span className="font-display tracking-widest2 text-bone">
          BRABUS BARBER
        </span>
        <span>Projeto Integrador — Curso Técnico em Informática para Internet</span>
      </footer>
    </main>
  );
}
