import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { api } from './api';

/**
 * Solicita permissões e registra o token de notificação push do Expo no servidor.
 * Protegido contra falhas em emuladores, Expo Go (SDK 53+) ou ambientes sem EAS.
 */
export async function registerPushTokenAsync() {
  try {
    // No Expo Go (SDK 53+), notificações push remotas foram removidas.
    // Usamos as notificações via banco de dados (tabela Notification no MySQL).
    const isExpoGo =
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
      Constants.appOwnership === 'expo';

    if (isExpoGo) {
      // Silenciosamente ignora a tentativa de gerar Push Token no Expo Go
      return;
    }

    let Notifications: any = null;
    try {
      Notifications = require('expo-notifications');
    } catch {
      return;
    }

    if (!Notifications || Platform.OS === 'web') return;

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch {}

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
      return;
    }

    let pushToken: string | undefined;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      pushToken = tokenData?.data;
    } catch {
      // Ignora erro se não for possível obter o token
    }

    if (pushToken) {
      await api.patch('/notifications/push-token', { pushToken }).catch(() => {});
    }
  } catch (error) {
    // Isolamento completo de erros de Push
  }
}

