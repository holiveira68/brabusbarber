import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { colors } from '../theme/colors';
import { TicketLabel } from '../components/TicketLabel';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Barber {
  id: number;
  bio: string | null;
  specialties: string | null;
  user: { name: string };
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<Barber[]>('/barbers')
      .then(setBarbers)
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  return (
    <View style={styles.screen}>
      <TicketLabel>BRABUS BARBER</TicketLabel>
      <Text style={styles.title}>Olá, {user?.name?.split(' ')[0]} 👋</Text>
      <Text style={styles.subtitle}>Escolha um barbeiro para agendar</Text>

      <FlatList
        style={{ marginTop: 20 }}
        data={barbers}
        keyExtractor={(b) => String(b.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.brass} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.barberName}>{item.user.name}</Text>
            {item.specialties && <Text style={styles.specialties}>{item.specialties}</Text>}
            {item.bio && <Text style={styles.bio}>{item.bio}</Text>}
            <Button
              label="AGENDAR"
              onPress={() => navigation.navigate('Booking', { barberId: item.id, barberName: item.user.name })}
              style={{ marginTop: 14 }}
            />
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Nenhum barbeiro disponível no momento.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink, padding: 24, paddingTop: 60 },
  title: { color: colors.bone, fontSize: 26, fontWeight: '700', marginTop: 6 },
  subtitle: { color: colors.boneMuted, fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: colors.inkSurface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  barberName: { color: colors.bone, fontSize: 18, fontWeight: '600' },
  specialties: { color: colors.brass, fontSize: 12, marginTop: 4 },
  bio: { color: colors.boneMuted, fontSize: 13, marginTop: 8 },
  empty: { color: colors.boneMuted, textAlign: 'center', marginTop: 40 },
});
