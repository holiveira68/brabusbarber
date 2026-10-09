'use client';

import Link from 'next/link';
import Image from 'next/image';

const equipe = [
  {
    nome: 'Helder Oliveira',
    cargo: 'Desenvolvedor Full Stack',
    foto: '/team/helder.jpg',
    descricao:
      'Responsável pela arquitetura da API em NestJS, modelagem do banco de dados MySQL com Prisma e integração das regras de negócio do sistema.',
  },
  {
    nome: 'Larissa Procopio',
    cargo: 'Desenvolvedor Mobile (React Native)',
    foto: '/team/larissa.jpg',
    descricao:
      'Responsável pela criação do aplicativo de agendamentos para clientes em Expo / React Native, controle de estado e integração de notificações.',
  },
  {
    nome: 'Laura Bevilaqua',
    cargo: 'Designer UI/UX & Frontend',
    foto: '/team/gabriel.png',
    descricao:
      'Criador da identidade visual da BRABUS BARBER, cuidando da paleta de cores, tipografia e prototipagem das interfaces web em Next.js.',
  },
  {
    nome: 'Marcello Gomes',
    cargo: 'Banco de Dados & QA',
    foto: '/team/felipe.png',
    descricao:
      'Responsável pela estrutura de migrações do MySQL, relacionamentos entre entidades e garantia de qualidade com testes automatizados de API.',
  },
  {
    nome: 'Mayara Batista',
    cargo: 'Documentação Técnica',
    foto: '/team/mayara.jpg',
    descricao:
      'Encarregado da infraestrutura dos ambientes de desenvolvimento, execução dos scripts e documentação arquitetural do Projeto Integrador.',
  },
];

export default function SobreNosPage() {
  return (
    <main className="min-h-screen bg-ink">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 md:px-16 border-b border-bone/10 bg-ink-soft/80 backdrop-blur sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 font-display text-xl tracking-widest2 text-bone">
          <Image src="/LogoBrabus.png" alt="BRABUS BARBER" width={48} height={46} priority />
          BRABUS<span className="text-brass"> BARBER</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-sm tracking-wide text-bone-muted hover:text-brass transition">
            Início
          </Link>
          <Link href="/sobre" className="font-display text-sm tracking-wide text-brass font-bold">
            Sobre Nós
          </Link>
          <Link href="/login" className="btn-outline text-xs">
            Área da equipe
          </Link>
        </div>
      </header>

      {/* HERO SOBRE */}
      <section className="px-6 py-16 text-center md:px-16 max-w-4xl mx-auto">
        <span className="ticket-number">PROJETO INTEGRADOR III</span>
        <h1 className="mt-4 text-4xl text-bone md:text-5xl font-display leading-tight">
          CONHEÇA A EQUIPE <span className="text-brass">BRABUS BARBER</span>
        </h1>
        <p className="mt-6 text-base text-bone-muted leading-relaxed">
          Desenvolvido como projeto de conclusão para o Curso Técnico em Informática para Internet.
          Nosso objetivo é transformar a experiência de agendamento em barbearias, conectando clientes
          e barbeiros com praticidade, agilidade e tecnologia de ponta.
        </p>
      </section>

      <div className="barber-stripe" />

      {/* CARDS DA EQUIPE (5 INTEGRANTES) */}
      <section className="px-6 py-16 md:px-16 max-w-7xl mx-auto">
        <h2 className="text-2xl text-bone md:text-3xl font-display mb-10 text-center">
          INTEGRANTES DO NOSSO <span className="text-brass">GRUPO</span>
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {equipe.map((membro) => (
            <div
              key={membro.nome}
              className="card group hover:border-brass/50 transition-all duration-300 flex flex-col items-center text-center p-6 bg-ink-surface/90"
            >
              <div className="relative w-28 h-28 mb-4 overflow-hidden rounded-full border-2 border-brass/40 shadow-[0_0_20px_rgba(201,162,75,0.2)] group-hover:scale-105 group-hover:border-brass transition-all duration-300">
                <Image
                  src={membro.foto}
                  alt={membro.nome}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-display text-lg text-bone group-hover:text-brass transition font-bold">
                {membro.nome}
              </h3>
              <span className="mt-1.5 text-xs font-semibold text-brass tracking-wider uppercase bg-brass/10 px-2 py-0.5 rounded border border-brass/20">
                {membro.cargo}
              </span>
              <p className="mt-4 text-xs text-bone-muted leading-relaxed">
                {membro.descricao}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* DETALHES DO PROJETO */}
      <section className="bg-ink-soft px-6 py-16 md:px-16 border-t border-bone/10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl text-bone font-display">TECNOLOGIAS UTILIZADAS</h3>
          <p className="mt-3 text-sm text-bone-muted">
            Uma stack moderna para garantir performance, escalabilidade e excelente usabilidade.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 font-mono text-xs text-bone">
            <span className="rounded-sm bg-ink px-3 py-1.5 border border-bone/10">Next.js 14</span>
            <span className="rounded-sm bg-ink px-3 py-1.5 border border-bone/10">TypeScript</span>
            <span className="rounded-sm bg-ink px-3 py-1.5 border border-bone/10">NestJS</span>
            <span className="rounded-sm bg-ink px-3 py-1.5 border border-bone/10">Prisma ORM</span>
            <span className="rounded-sm bg-ink px-3 py-1.5 border border-bone/10">MySQL</span>
            <span className="rounded-sm bg-ink px-3 py-1.5 border border-bone/10">React Native / Expo</span>
            <span className="rounded-sm bg-ink px-3 py-1.5 border border-bone/10">Tailwind CSS</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-col items-center gap-2 px-6 py-10 text-center text-xs text-bone-muted md:px-16 border-t border-bone/10">
        <span className="font-display tracking-widest2 text-bone">
          BRABUS BARBER
        </span>
        <span>Projeto Integrador — Curso Técnico em Informática para Internet</span>
      </footer>
    </main>
  );
}
