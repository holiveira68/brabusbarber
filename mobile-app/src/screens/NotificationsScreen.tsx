import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { TicketLabel } from '../components/TicketLabel';
import { api } from '../services/api';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type?: string;
  createdAt: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await api.get<NotificationItem[]>('/notifications');
      setNotifications(data || []);
    } catch (error) {
      console.log('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (item.read) return;
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      );
      await api.patch(`/notifications/${item.id}/read`);
    } catch (error) {
      console.log('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await api.patch('/notifications/read-all');
    } catch (error) {
      console.log('Erro ao marcar todas como lidas:', error);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month} às ${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const getIconName = (type?: string, title?: string) => {
    if (type === 'AGENDAMENTO' || title?.includes('Agendamento')) return 'calendar-outline';
    if (type === 'LEMBRETE' || title?.includes('Lembrete')) return 'alarm-outline';
    if (title?.includes('Confirmado') || title?.includes('Concluído')) return 'checkmark-circle-outline';
    if (title?.includes('Cancelado')) return 'close-circle-outline';
    return 'notifications-outline';
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <View>
          <TicketLabel>BRABUS BARBER</TicketLabel>
          <Text style={styles.title}>Notificações</Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Limpar não lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>
        {unreadCount > 0
          ? `Você tem ${unreadCount} nova${unreadCount > 1 ? 's' : ''} notificação${unreadCount > 1 ? 'ões' : ''}`
          : 'Histórico de avisos e lembretes'}
      </Text>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.brass} size="large" />
        </View>
      ) : (
        <FlatList
          style={{ marginTop: 20 }}
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.brass}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => {
            const iconName = getIconName(item.type, item.title);
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleMarkAsRead(item)}
                style={[styles.card, !item.read && styles.cardUnread]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconTitleRow}>
                    <Ionicons
                      name={iconName}
                      size={20}
                      color={item.read ? colors.boneMuted : colors.brass}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>
                      {item.title}
                    </Text>
                  </View>

                  {!item.read && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.cardMessage}>{item.message}</Text>
                <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.boneMuted} />
              <Text style={styles.emptyText}>Nenhuma notificação por enquanto.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink, padding: 24, paddingTop: 60 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { color: colors.bone, fontSize: 26, fontWeight: '700', marginTop: 6 },
  subtitle: { color: colors.boneMuted, fontSize: 14, marginTop: 4 },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.inkSurface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
  },
  markAllText: { color: colors.brass, fontSize: 12, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  card: {
    backgroundColor: colors.inkSurface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardUnread: {
    borderColor: colors.brass,
    backgroundColor: '#26231e',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    color: colors.boneMuted,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  cardTitleUnread: {
    color: colors.bone,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brass,
    marginLeft: 8,
  },
  cardMessage: { color: colors.bone, fontSize: 13, lineHeight: 18 },
  cardDate: { color: colors.boneMuted, fontSize: 11, marginTop: 8, textAlign: 'right' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { color: colors.boneMuted, textAlign: 'center', marginTop: 12, fontSize: 14 },
});
