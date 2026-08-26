# BRABUS BARBER — Site (Next.js + Tailwind)

Site institucional + painel de gestão da barbearia, consumido pela equipe
(administrador e barbeiros). Clientes usam o aplicativo mobile.

## Stack
- Next.js 14 (App Router)
- Tailwind CSS (identidade visual própria — ver `tailwind.config.js`)
- Recharts (gráfico de desempenho por barbeiro)
- Autenticação via JWT emitido pela API, guardado no `localStorage`

## Como rodar

```bash
cd frontend-web
npm install

cp .env.local.example .env.local
# ajuste NEXT_PUBLIC_API_URL se a API não estiver em localhost:3333

npm run dev
```

Acesse `http://localhost:3000`.

> A API precisa estar rodando (veja `backend/README.md`) e com o seed
> executado para o login `admin@brabusbarber.com` / `123456` funcionar.

## Estrutura

```
app/
  page.tsx                 # landing page pública
  login/page.tsx            # login da equipe (admin/barbeiro)
  dashboard/
    layout.tsx               # guarda de autenticação + menu lateral
    page.tsx                 # resumo (faturamento, comparecimento...)
    agenda/page.tsx          # agenda do dia, confirmação/cancelamento
    servicos/page.tsx        # CRUD de serviços
    barbeiros/page.tsx       # equipe, horários e serviços vinculados
    relatorios/page.tsx      # desempenho por barbeiro (gráfico)
lib/
  api.ts                    # cliente HTTP para a API NestJS
  auth-context.tsx          # contexto de sessão (login/logout)
```

## Identidade visual

Paleta "garagem + barbearia clássica": fundo preto quente (`ink`), acento
latão (`brass`) e vermelho poste de barbeiro (`oxblood`), com tipografia
condensada (Oswald) para títulos e uma faixa diagonal (`.barber-stripe`)
como elemento assinatura entre seções.
