# BRABUS BARBER — App (React Native + Expo)

Aplicativo mobile usado pelos **clientes** da barbearia para agendar horários,
acompanhar e cancelar agendamentos.

## Stack
- Expo (React Native 0.74)
- React Navigation (bottom tabs + native stack)
- AsyncStorage para persistir sessão (token JWT)
- Consome a mesma API NestJS usada pelo site

## Como rodar

```bash
cd mobile-app
npm install
npx expo start
```

Escaneie o QR Code com o app **Expo Go** (Android/iOS) ou rode num emulador
(`npx expo start --android` / `--ios`).

### ⚠️ Importante: apontando para a API

Em `src/services/api.ts`, a constante `API_URL` está como
`http://localhost:3333/api`. Isso funciona apenas no emulador Android com
redirecionamento especial ou no simulador iOS — em um **celular físico** ou
no Expo Go, `localhost` aponta para o próprio celular, não para o seu
computador.

Troque para o IP da sua máquina na rede local, por exemplo:

```ts
const API_URL = 'http://192.168.0.15:3333/api';
```

Você descobre seu IP local com `ipconfig` (Windows) ou `ifconfig`/`ip a`
(Linux/Mac). Certifique-se de que o celular e o computador estão na mesma
rede Wi-Fi, e que o backend está rodando com `npm run start:dev`.

## Fluxo do app

1. **Login / Cadastro** — tela inicial para quem ainda não tem sessão.
2. **Início** — lista de barbeiros disponíveis; toque em "Agendar" para
   iniciar o fluxo de agendamento.
3. **Agendamento** — escolha do serviço → data (próximos 14 dias) → horário
   livre (calculado pela API a partir da agenda real do barbeiro) → confirma.
4. **Agendamentos** — histórico do cliente, com opção de cancelar horários
   pendentes ou confirmados.
5. **Perfil** — dados da conta e logout.

## Estrutura

```
App.tsx                      # entry point (providers + navegação)
src/
  theme/colors.ts             # paleta compartilhada com o site
  services/api.ts             # cliente HTTP (AsyncStorage para o token)
  context/AuthContext.tsx     # sessão do usuário (login/cadastro/logout)
  navigation/index.tsx        # stacks (auth vs. app logado) + tabs
  screens/
    LoginScreen.tsx
    RegisterScreen.tsx
    HomeScreen.tsx             # lista de barbeiros
    BookingScreen.tsx          # fluxo de agendamento
    AppointmentsScreen.tsx     # histórico do cliente
    ProfileScreen.tsx
  components/
    Button.tsx
    TicketLabel.tsx            # elemento de marca (rótulo estilo "ticket")
```
