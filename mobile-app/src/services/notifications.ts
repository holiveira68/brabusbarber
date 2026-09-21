import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';

/**
 * Solicita permissões e registra o token de notificação push do Expo no servidor.
 * Protegido contra falhas em emuladores, Expo Go (SDK 53+) ou ambientes sem EAS projectId.
 */
export async function registerPushTokenAsync() {
  try {
    let Notifications: any = null;
    try {
      Notifications = require('expo-notifications');
    } catch {
      console.log('[Push] Módulo expo-notifications não instalado.');
      return;
    }

    if (!Notifications || Platform.OS === 'web') return;

    // Configura o comportamento de alertas para notificações (locais ou remotas)
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch {}

    // A partir do SDK 53, notificações push REMOTAS via servidor não funcionam no Expo Go (Android/iOS)
    if (Constants.appOwnership === 'expo') {
      console.log('[Push] Notificações push remotas são desativadas no Expo Go a partir do SDK 53. Notificações locais funcionam normalmente.');
      return;
    }

    let existingStatus = 'denied';
    try {
      const perms = await Notifications.getPermissionsAsync();
      existingStatus = perms.status;
    } catch {}

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      try {
        const req = await Notifications.requestPermissionsAsync();
        finalStatus = req.status;
      } catch {}
    }

    if (finalStatus !== 'granted') {
      console.log('[Push] Permissão de notificação não concedida.');
      return;
    }

    let pushToken: string | undefined;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      pushToken = tokenData?.data;
    } catch (err: any) {
      console.log('[Push] Aviso: Não foi possível obter o Expo Push Token:', err.message || err);
    }

    if (pushToken) {
      console.log('[Push] Token do Expo registrado:', pushToken);
      await api.patch('/notifications/push-token', { pushToken }).catch(() => {});
    }
  } catch (error) {
      console.log('[Push] Erro capturado e isolado ao inicializar notificações:', error);
  }
}
