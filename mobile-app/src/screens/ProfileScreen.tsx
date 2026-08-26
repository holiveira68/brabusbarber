import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { TicketLabel } from '../components/TicketLabel';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.screen}>
      <TicketLabel>PERFIL</TicketLabel>
      <Text style={styles.title}>{user?.name}</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>E-mail</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tipo de conta</Text>
          <Text style={styles.value}>Cliente</Text>
        </View>
      </View>

      <Button label="SAIR DA CONTA" variant="outline" onPress={logout} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink, padding: 24, paddingTop: 60 },
  title: { color: colors.bone, fontSize: 24, fontWeight: '700', marginTop: 6, marginBottom: 24 },
  card: {
    backgroundColor: colors.inkSurface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  label: { color: colors.boneMuted, fontSize: 13 },
  value: { color: colors.bone, fontSize: 13 },
});
