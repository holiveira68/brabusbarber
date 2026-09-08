import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { TicketLabel } from '../components/TicketLabel';
import { api } from '../services/api';

interface AppointmentReview {
  id: number;
  rating: number;
  comment?: string;
}

interface Appointment {
  id: number;
  date: string;
  startTime: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO' | 'FALTOU';
  barber: { user: { name: string } };
  service: { name: string; price: string };
  review?: AppointmentReview | null;
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

  // Estado do Modal de Avaliação
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

  function openReviewModal(appt: Appointment) {
    setSelectedAppt(appt);
    setRating(5);
    setComment('');
  }

  async function handleSubmitReview() {
    if (!selectedAppt) return;
    try {
      setSubmittingReview(true);
      await api.post('/reviews', {
        appointmentId: selectedAppt.id,
        rating,
        comment: comment.trim() || undefined,
      });

      Alert.alert('Avaliação Enviada', 'Obrigado por avaliar nosso atendimento!');
      setSelectedAppt(null);
      load();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao enviar avaliação.');
    } finally {
      setSubmittingReview(false);
    }
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

            {/* Ações de acordo com o Status */}
            {(item.status === 'PENDENTE' || item.status === 'CONFIRMADO') && (
              <TouchableOpacity onPress={() => handleCancel(item.id)}>
                <Text style={styles.cancelLink}>Cancelar horário</Text>
              </TouchableOpacity>
            )}

            {item.status === 'CONCLUIDO' && (
              <View style={styles.reviewContainer}>
                {item.review ? (
                  <View style={styles.reviewBox}>
                    <Text style={styles.reviewStars}>
                      {'★'.repeat(item.review.rating)}{' '}
                      <Text style={styles.reviewScore}>({item.review.rating}/5)</Text>
                    </Text>
                    {item.review.comment && (
                      <Text style={styles.reviewComment}>"{item.review.comment}"</Text>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => openReviewModal(item)}
                  >
                    <Text style={styles.reviewButtonText}>★ Avaliar Atendimento</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Você ainda não tem agendamentos.</Text> : null
        }
      />

      {/* Modal de Avaliação do Atendimento */}
      {selectedAppt && (
        <Modal transparent animationType="fade" visible={!!selectedAppt}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Avaliar Atendimento</Text>
              <Text style={styles.modalSubtitle}>
                Como foi seu atendimento de {selectedAppt.service.name} com{' '}
                {selectedAppt.barber.user.name}?
              </Text>

              {/* Estrelas Selecionáveis */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Text style={[styles.starIcon, star <= rating && styles.starIconActive]}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comentário Opicional */}
              <TextInput
                style={styles.commentInput}
                placeholder="Escreva um comentário (opcional)..."
                placeholderTextColor={colors.boneMuted}
                multiline
                numberOfLines={3}
                value={comment}
                onChangeText={setComment}
              />

              {/* Botões do Modal */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setSelectedAppt(null)}
                  disabled={submittingReview}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator color={colors.ink} size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink, padding: 24, paddingTop: 60 },
  title: { color: colors.bone, fontSize: 26, fontWeight: '700', marginTop: 6 },
  card: {
    backgroundColor: colors.inkSurface,
    borderRadius: 6,
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

  // Estilos de Avaliação
  reviewContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  reviewButton: {
    backgroundColor: colors.brass + '20',
    borderColor: colors.brass,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  reviewButtonText: { color: colors.brass, fontSize: 13, fontWeight: '600' },
  reviewBox: { backgroundColor: colors.ink, padding: 10, borderRadius: 4 },
  reviewStars: { color: '#F59E0B', fontSize: 14, fontWeight: '700' },
  reviewScore: { color: colors.boneMuted, fontSize: 12, fontWeight: 'normal' },
  reviewComment: { color: colors.boneMuted, fontSize: 12, fontStyle: 'italic', marginTop: 4 },

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.inkSurface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: { color: colors.bone, fontSize: 18, fontWeight: '700' },
  modalSubtitle: { color: colors.boneMuted, fontSize: 13, marginTop: 4, marginBottom: 16 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 },
  starIcon: { fontSize: 36, color: colors.boneMuted },
  starIconActive: { color: '#F59E0B' },
  commentInput: {
    backgroundColor: colors.ink,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    color: colors.bone,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelButtonText: { color: colors.boneMuted, fontSize: 14 },
  submitButton: {
    backgroundColor: colors.brass,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  submitButtonText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
});
