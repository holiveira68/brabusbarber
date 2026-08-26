'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-xl tracking-widest2 border-radius-full text-bone">
           <Image src="/LogoBrabus.png" alt="BRABUS BARBER" width={104} height={102} border-radius-full priority />
          BRABUS<span className="text-brass"> BARBER</span>
        </Link>

        <div className="card">
          <span className="ticket-number">ÁREA DA EQUIPE</span>
          <h1 className="mt-2 font-display text-2xl text-bone">Entrar no painel</h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs text-bone-muted">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="voce@brabusbarber.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-bone-muted">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-sm border border-oxblood/40 bg-oxblood/10 px-3 py-2 text-sm text-oxblood-light">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-bone-muted">
          Login exclusivo para administradores e barbeiros. <br />
          Clientes agendam pelo aplicativo BRABUS BARBER.
        </p>
      </div>
    </main>
  );
}
