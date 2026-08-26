import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { TicketLabel } from '../components/TicketLabel';
import { api } from '../services/api';

interface Appointment {
  id: number;
  date: string;
  startTime: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO' | 'FALTOU';
  barber: { user: { name: string } };
  service: { name: string; price: string };
}

const statusColor: Record<Appointment['status'], string> = {
  PENDENTE: colors.brass,
  CONFIRMADO: colors.bone,
  CONCLUIDO: colors.success,
  CANCELADO: colors.boneMuted,
  FALTOU: colors.oxbloodLight,
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<Appointment[]>('/appointments')
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  function handleCancel(id: number) {
    Alert.alert('Cancelar agendamento', 'Tem certeza que deseja cancelar?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar horário',
        style: 'destructive',
        onPress: async () => {
          await api.patch(`/appointments/${id}/status`, { status: 'CANCELADO' });
          load();
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <TicketLabel>MEUS AGENDAMENTOS</TicketLabel>
      <Text style={styles.title}>Histórico</Text>

      <FlatList
        style={{ marginTop: 20 }}
        data={appointments}
        keyExtractor={(a) => String(a.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.brass} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.time}>
                {formatDate(item.date)} · {item.startTime}
              </Text>
              <Text style={[styles.status, { color: statusColor[item.status] }]}>{item.status}</Text>
            </View>
            <Text style={styles.service}>{item.service.name}</Text>
            <Text style={styles.barber}>com {item.barber.user.name}</Text>

            {(item.status === 'PENDENTE' || item.status === 'CONFIRMADO') && (
              <Text onPress={() => handleCancel(item.id)} style={styles.cancelLink}>
                Cancelar horário
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Você ainda não tem agendamentos.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink, padding: 24, paddingTop: 60 },
  title: { color: colors.bone, fontSize: 26, fontWeight: '700', marginTop: 6 },
  card: {
    backgroundColor: colors.inkSurface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { color: colors.brass, fontFamily: 'monospace', fontSize: 13 },
  status: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  service: { color: colors.bone, fontSize: 17, fontWeight: '600', marginTop: 8 },
  barber: { color: colors.boneMuted, fontSize: 13, marginTop: 2 },
  cancelLink: { color: colors.oxbloodLight, fontSize: 12, marginTop: 12 },
  empty: { color: colors.boneMuted, textAlign: 'center', marginTop: 40 },
});
