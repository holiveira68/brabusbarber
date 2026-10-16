import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { TicketLabel } from '../components/TicketLabel';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const [deleting, setDeleting] = useState(false);

  function handleDeleteAccount() {
    Alert.alert(
      'Eliminar Conta',
      'Tem certeza que deseja eliminar sua conta? Esta ação não pode ser desfeita e só é permitida se você não possuir agendamentos ou registros vinculados no banco de dados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteAccount();
              Alert.alert('Conta Eliminada', 'Sua conta foi eliminada com sucesso.');
            } catch (err: any) {
              Alert.alert(
                'Não foi possível eliminar a conta',
                err.message || 'Erro ao tentar eliminar a conta.'
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  const roleLabel =
    user?.role === 'BARBEIRO'
      ? 'Barbeiro'
      : user?.role === 'ADMIN'
      ? 'Administrador'
      : 'Cliente';

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
          <Text style={styles.value}>{roleLabel}</Text>
        </View>
      </View>

      <Button label="SAIR DA CONTA" variant="outline" onPress={logout} style={{ marginTop: 24 }} />

      <Button
        label="ELIMINAR CONTA"
        variant="danger"
        loading={deleting}
        onPress={handleDeleteAccount}
        style={{ marginTop: 12 }}
      />
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
