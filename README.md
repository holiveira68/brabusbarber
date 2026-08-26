# BRABUS BARBER

Sistema completo de agendamento para barbearias — Projeto Integrador do
Curso Técnico em Informática para Internet (IFSP Caraguatatuba).

Baseado no documento de definição do projeto: site + app conectados pela
mesma API, com autenticação JWT e papéis distintos para cliente, barbeiro
e administrador.

## Visão geral da arquitetura

```
┌─────────────────┐        ┌──────────────────┐        ┌────────────────────┐
│  App (Cliente)   │        │  Site (Equipe)     │        │                    │
│  React Native /  │───────▶│  Next.js + Tailwind│───────▶│   API (NestJS)     │
│  Expo             │        │  Admin/Barbeiro    │        │  + Prisma + MySQL  │
└─────────────────┘        └──────────────────┘        └────────────────────┘
```

Site e app **não conversam diretamente entre si** — ambos consomem a mesma
API REST, que é a única fonte da verdade dos dados (agenda, serviços,
usuários). Isso é o que garante que um horário marcado no app apareça
instantaneamente na agenda do site, e vice-versa.

## Pastas do projeto

| Pasta            | O quê                          | Tecnologias                          |
|-------------------|--------------------------------|----------------------------------------|
| `backend/`        | API REST                       | NestJS, Prisma, MySQL, JWT             |
| `frontend-web/`   | Site de gestão (equipe)        | Next.js (App Router), Tailwind CSS     |
| `mobile-app/`     | App do cliente                 | React Native, Expo, React Navigation   |

Cada pasta tem seu próprio `README.md` com instruções detalhadas de setup.

## Ordem recomendada para rodar o projeto

1. **Backend primeiro** — configure o MySQL, rode as migrations e o seed
   (veja `backend/README.md`). A API precisa estar de pé para site e app
   funcionarem.
2. **Site** — `cd frontend-web && npm install && npm run dev`. Login com
   `admin@brabusbarber.com` / `123456` (criado pelo seed).
3. **App mobile** — `cd mobile-app && npm install && npx expo start`.
   **Atenção**: ajuste a URL da API em `src/services/api.ts` para o IP da
   sua máquina na rede local antes de testar em um celular físico (detalhes
   no README do mobile-app).

## Papéis de usuário (Role)

- **CLIENTE** — cadastro público, usa apenas o app, agenda/cancela os
  próprios horários.
- **BARBEIRO** — acessa o site, vê e gerencia a própria agenda.
- **ADMIN** — acessa o site com acesso total: cadastro de serviços,
  barbeiros, horários de trabalho e relatórios gerenciais.

## Funcionalidades implementadas

**API**
- Cadastro/login com JWT e controle de acesso por papel
- CRUD de serviços (nome, preço, duração)
- Perfis de barbeiro com horários de trabalho semanais e serviços vinculados
- Criação de agendamento com validação de expediente e detecção de conflito
  de horário
- Endpoint de disponibilidade (calcula horários livres em tempo real)
- Relatórios: faturamento do mês, taxa de comparecimento, serviços mais
  vendidos, desempenho por barbeiro

**Site (equipe)**
- Landing page institucional pública
- Login exclusivo para admin/barbeiro
- Painel: resumo do dia, agenda com confirmação/cancelamento/conclusão,
  cadastro de serviços, visão da equipe e horários, relatório com gráfico

**App (cliente)**
- Cadastro e login
- Lista de barbeiros
- Fluxo de agendamento: serviço → data → horário livre → confirmação
- Histórico de agendamentos com cancelamento

## Próximos passos sugeridos (para evoluir o projeto)

- Notificações push reais (Expo Notifications) para lembretes automáticos
- Upload de foto de perfil dos barbeiros (multer, como no projeto Mercadim)
- Avaliação do atendimento pelo cliente (o modelo `Review` já existe no
  banco, falta a tela/rota de criação)
- Tela de administração de usuários no site (o endpoint `POST /api/users`
  já existe na API)
