# BRABUS BARBER — API (NestJS)

API REST que serve tanto o site (gestão da barbearia) quanto o app mobile (clientes).

## Stack
- NestJS 10 + TypeScript
- Prisma ORM + MySQL
- Autenticação JWT (passport-jwt) com controle de acesso por papel (`CLIENTE`, `BARBEIRO`, `ADMIN`)
- Validação de DTOs com `class-validator`

## Como rodar

```bash
cd backend
npm install

# 1. Configure o banco
cp .env.example .env
# edite o .env com sua string de conexão MySQL e um JWT_SECRET

# 2. Crie as tabelas
npx prisma migrate dev --name init

# 3. (opcional, recomendado) popule com dados de exemplo
npm run prisma:seed

# 4. Suba a API
npm run start:dev
```

A API sobe em `http://localhost:3333/api`.

## Usuários de exemplo (após rodar o seed)

| Papel     | E-mail                     | Senha  |
|-----------|-----------------------------|--------|
| Admin     | admin@brabusbarber.com      | 123456 |
| Barbeiro  | lucas@brabusbarber.com      | 123456 |
| Cliente   | cliente@teste.com           | 123456 |

## Estrutura de módulos

```
src/
  auth/          # login, cadastro, JWT strategy, guards de role
  users/         # CRUD de usuários (admin gerencia barbeiros/clientes)
  barbers/       # perfil do barbeiro, serviços vinculados, horários de trabalho
  services/      # catálogo de serviços (corte, barba, combo...)
  appointments/  # agendamentos: criação, disponibilidade de horários, status
  reports/       # faturamento, taxa de comparecimento, desempenho por barbeiro
  prisma/        # PrismaService (conexão com o banco)
```

## Principais rotas

- `POST /api/auth/register` — cadastro público (cliente)
- `POST /api/auth/login`
- `GET  /api/barbers` — lista pública de barbeiros
- `GET  /api/services` — catálogo público de serviços
- `GET  /api/appointments/disponibilidade?barberId=&serviceId=&date=` — horários livres
- `POST /api/appointments` — cria agendamento (cliente autenticado)
- `PATCH /api/appointments/:id/status` — confirma/cancela/conclui
- `GET  /api/reports/resumo` — dashboard do admin

Todas as rotas protegidas exigem o header `Authorization: Bearer <token>` retornado no login.
