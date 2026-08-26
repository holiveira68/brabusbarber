'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

const links = [
  { href: '/dashboard', label: 'Resumo' },
  { href: '/dashboard/agenda', label: 'Agenda' },
  { href: '/dashboard/servicos', label: 'Serviços' },
  { href: '/dashboard/barbeiros', label: 'Barbeiros' },
  { href: '/dashboard/relatorios', label: 'Relatórios' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-bone-muted">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-bone/10 bg-ink-soft p-6 md:flex">
        <Link href="/" className="mb-10 font-display text-lg tracking-widest2">
         <Image src="/LogoBrabus.png" alt="BRABUS BARBER" width={56} height={54} priority />
          BRABUS<span className="text-brass"> BARBER</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {links
            .filter((l) => user.role === 'ADMIN' || l.href !== '/dashboard/relatorios')
            .map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-sm px-4 py-2.5 font-display text-sm tracking-wide transition ${
                    active
                      ? 'bg-brass/10 text-brass'
                      : 'text-bone-muted hover:bg-bone/5 hover:text-bone'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
        </nav>

        <div className="border-t border-bone/10 pt-4">
          <p className="text-sm text-bone">{user.name}</p>
          <p className="text-xs text-bone-muted">
            {user.role === 'ADMIN' ? 'Administrador' : 'Barbeiro'}
          </p>
          <button
            onClick={logout}
            className="mt-3 text-xs text-oxblood-light hover:underline"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
