'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'CLIENTE' | 'BARBEIRO' | 'ADMIN';
  pushToken?: string;
  createdAt: string;
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('TODOS');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modais
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CLIENTE' as 'CLIENTE' | 'BARBEIRO' | 'ADMIN',
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/users';
      const params = new URLSearchParams();
      if (selectedRole !== 'TODOS') params.append('role', selectedRole);
      if (search.trim()) params.append('search', search.trim());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get<User[]>(url);
      setUsers(res);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar lista de usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedRole]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'CLIENTE',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '', // Vazio para não alterar se não digitado
      role: user.role,
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await api.post('/users', formData);
      setSuccess('Usuário cadastrado com sucesso!');
      setIsCreateOpen(false);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar usuário.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setError('');
      setSuccess('');
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      };
      if (formData.password.trim()) {
        payload.password = formData.password;
      }
      await api.patch(`/users/${selectedUser.id}`, payload);
      setSuccess('Usuário atualizado com sucesso!');
      setIsEditOpen(false);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar usuário.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      setError('');
      setSuccess('');
      await api.delete(`/users/${selectedUser.id}`);
      setSuccess('Usuário removido com sucesso!');
      setIsDeleteOpen(false);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao remover usuário.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="rounded-full bg-brass/20 px-2.5 py-1 text-xs font-semibold text-brass border border-brass/30">
            Administrador
          </span>
        );
      case 'BARBEIRO':
        return (
          <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30">
            Barbeiro
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-bone/10 px-2.5 py-1 text-xs font-semibold text-bone-muted border border-bone/20">
            Cliente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-bone">
            Administração de Usuários
          </h1>
          <p className="text-sm text-bone-muted">
            Gerencie clientes, barbeiros e administradores do sistema BRABUS BARBER.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 rounded bg-brass px-4 py-2.5 font-display text-sm font-semibold tracking-wide text-ink transition hover:bg-brass-light"
        >
          + Novo Usuário
        </button>
      </div>

      {/* Feedback Alert */}
      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col gap-4 rounded-lg border border-bone/10 bg-ink-soft p-4 md:flex-row md:items-center md:justify-between">
        {/* Tabs de Filtro por Função */}
        <div className="flex flex-wrap gap-2">
          {['TODOS', 'CLIENTE', 'BARBEIRO', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                selectedRole === r
                  ? 'bg-brass text-ink font-bold'
                  : 'bg-ink/60 text-bone-muted hover:bg-bone/10 hover:text-bone'
              }`}
            >
              {r === 'TODOS' ? 'Todos' : r === 'CLIENTE' ? 'Clientes' : r === 'BARBEIRO' ? 'Barbeiros' : 'Admins'}
            </button>
          ))}
        </div>

        {/* Busca por Nome/Email */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-bone/20 bg-ink px-3 py-1.5 text-sm text-bone placeholder-bone-muted/50 focus:border-brass focus:outline-none md:w-72"
          />
          <button
            type="submit"
            className="rounded bg-bone/10 px-4 py-1.5 text-xs font-semibold text-bone hover:bg-bone/20"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Tabela de Usuários */}
      <div className="overflow-x-auto rounded-lg border border-bone/10 bg-ink-soft">
        <table className="w-full text-left text-sm text-bone">
          <thead className="border-b border-bone/10 bg-ink/50 text-xs font-display uppercase text-bone-muted tracking-wider">
            <tr>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">Função</th>
              <th className="px-6 py-4">Push Expo</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bone/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-bone-muted">
                  Carregando usuários...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-bone-muted">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="transition hover:bg-bone/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brass/10 font-display font-bold text-brass border border-brass/20">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-bone">{u.name}</p>
                        <p className="text-xs text-bone-muted">ID: #{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-bone">{u.email}</p>
                    <p className="text-xs text-bone-muted">{u.phone || 'Não informado'}</p>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                  <td className="px-6 py-4">
                    {u.pushToken ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                        Token Ativo
                      </span>
                    ) : (
                      <span className="text-xs text-bone-muted/60">Sem dispositivo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="rounded border border-bone/20 px-2.5 py-1 text-xs text-bone hover:border-brass hover:text-brass"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleOpenDelete(u)}
                        className="rounded border border-red-500/30 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CRIAÇÃO */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg border border-bone/10 bg-ink-soft p-6 space-y-4">
            <h2 className="font-display text-lg text-bone">Cadastrar Novo Usuário</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-bone-muted mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone focus:border-brass focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-bone-muted mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone focus:border-brass focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-bone-muted mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(12) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone focus:border-brass focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-bone-muted mb-1">Senha de Acesso</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone focus:border-brass focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-bone-muted mb-1">Função / Permissão</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
                  className="w-full rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone focus:border-brass focus:outline-none"
                >
                  <option value="CLIENTE">Cliente</option>
                  <option value="BARBEIRO">Barbeiro</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded px-4 py-2 text-sm text-bone-muted hover:text-bone"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-brass-light"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIÇÃO */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg border border-bone/10 bg-ink-soft p-6 space-y-4">
            <h2 className="font-display text-lg text-bone">Editar Usuário #{selectedUser.id}</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-bone-muted mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone focus:border-brass focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-bone-muted mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone focus:border-brass focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-bone-muted mb-1">Telefone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone focus:border-brass focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-bone-muted mb-1">
                  Nova Senha (deixe em branco se não quiser alterar)
                </label>
                <input
                  type="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone focus:border-brass focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-bone-muted mb-1">Função / Permissão</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
                  className="w-full rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone focus:border-brass focus:outline-none"
                >
                  <option value="CLIENTE">Cliente</option>
                  <option value="BARBEIRO">Barbeiro</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded px-4 py-2 text-sm text-bone-muted hover:text-bone"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded bg-brass px-4 py-2 text-sm font-semibold text-ink hover:bg-brass-light"
                >
                  Atualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REMOÇÃO */}
      {isDeleteOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-lg border border-red-500/20 bg-ink-soft p-6 space-y-4 text-center">
            <h2 className="font-display text-lg text-bone">Excluir Usuário?</h2>
            <p className="text-sm text-bone-muted">
              Tem certeza que deseja remover <strong>{selectedUser.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded px-4 py-2 text-sm text-bone-muted hover:text-bone"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
