import AsyncStorage from '@react-native-async-storage/async-storage';

// Em dispositivo físico/emulador, "localhost" não aponta para o seu
// computador — troque pelo IP da sua máquina na rede local (ex: 192.168.x.x)
// ou pelo endereço do túnel do Expo. Veja o README do mobile-app.
// const API_URL = 'http://10.81.204.24:3333/api';
const API_URL = 'http://192.168.15.28:3333/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem('brabus_token');

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    throw new ApiError(
      `Não foi possível conectar ao servidor (${API_URL}). Verifique se o backend está rodando.`,
      0,
    );
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message || 'Erro inesperado ao falar com o servidor';
    throw new ApiError(message, res.status);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
};
