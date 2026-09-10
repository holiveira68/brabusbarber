import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { TicketLabel } from '../components/TicketLabel';
import { Button } from '../components/Button';
import { api } from '../services/api';

interface Service {
  id: number;
  name: string;
  price: string;
  durationMinutes: number;
}

// Gera os próximos 14 dias como opções de data (evita depender de libs externas de calendário)
function buildNextDays(count: number) {
  const days: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

const weekdayShort = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export default function BookingScreen({ route, navigation }: any) {
  const { barberId, barberName } = route.params;

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [days] = useState(buildNextDays(14));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (barberId) {
      api.get<Service[]>(`/services?active=true&barberId=${barberId}`).then(setServices);
    } else {
      api.get<Service[]>('/services?active=true').then(setServices);
    }
  }, [barberId]);

  useEffect(() => {
    if (!selectedService || !selectedDate) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSelectedSlot(null);
    api
      .get<string[]>(
        `/appointments/disponibilidade?barberId=${barberId}&serviceId=${selectedService.id}&date=${toISODate(selectedDate)}`,
      )
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedService, selectedDate]);

  async function handleConfirm() {
    if (!selectedService || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/appointments', {
        barberId,
        serviceId: selectedService.id,
        date: toISODate(selectedDate),
        startTime: selectedSlot,
      });
      navigation.navigate('Tabs', { screen: 'Appointments' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível agendar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <TicketLabel>NOVO AGENDAMENTO</TicketLabel>
      <Text style={styles.title}>{barberName}</Text>

      <Text style={styles.sectionLabel}>1. Escolha o serviço</Text>
      {services.length === 0 ? (
        <Text style={styles.empty}>Nenhum serviço disponível para este barbeiro.</Text>
      ) : (
        <View style={styles.chipsWrap}>
          {services.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setSelectedService(s)}
              style={[styles.serviceCard, selectedService?.id === s.id && styles.serviceCardActive]}
            >
              <Text style={[styles.serviceName, selectedService?.id === s.id && { color: colors.brass }]}>
                {s.name}
              </Text>
              <Text style={styles.serviceMeta}>
                {s.durationMinutes} min · R$ {Number(s.price).toFixed(2)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.sectionLabel}>2. Escolha a data</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
        {days.map((d) => {
          const active = selectedDate && toISODate(selectedDate) === toISODate(d);
          return (
            <Pressable
              key={toISODate(d)}
              onPress={() => setSelectedDate(d)}
              style={[styles.dayChip, active && styles.dayChipActive]}
            >
              <Text style={[styles.dayWeekday, active && { color: colors.brass }]}>
                {weekdayShort[d.getDay()]}
              </Text>
              <Text style={[styles.dayNumber, active && { color: colors.brass }]}>{d.getDate()}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {selectedDate && (
        <>
          <Text style={styles.sectionLabel}>3. Escolha o horário</Text>
          {loadingSlots && <ActivityIndicator color={colors.brass} style={{ marginTop: 12 }} />}
          {!loadingSlots && slots.length === 0 && (
            <Text style={styles.empty}>Nenhum horário livre nesta data.</Text>
          )}
          <View style={styles.chipsWrap}>
            {slots.map((slot) => (
              <Pressable
                key={slot}
                onPress={() => setSelectedSlot(slot)}
                style={[styles.slotChip, selectedSlot === slot && styles.slotChipActive]}
              >
                <Text style={[styles.slotText, selectedSlot === slot && { color: colors.ink }]}>
                  {slot}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        label={submitting ? 'AGENDANDO...' : 'CONFIRMAR AGENDAMENTO'}
        onPress={handleConfirm}
        disabled={!selectedService || !selectedDate || !selectedSlot || submitting}
        loading={submitting}
        style={{ marginTop: 28, marginBottom: 40 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  title: { color: colors.bone, fontSize: 24, fontWeight: '700', marginTop: 6, marginBottom: 20 },
  sectionLabel: { color: colors.bone, fontSize: 14, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 12,
    minWidth: '47%',
  },
  serviceCardActive: { borderColor: colors.brass, backgroundColor: 'rgba(201,162,75,0.08)' },
  serviceName: { color: colors.bone, fontSize: 14, fontWeight: '600' },
  serviceMeta: { color: colors.boneMuted, fontSize: 12, marginTop: 4 },
  dayChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  dayChipActive: { borderColor: colors.brass, backgroundColor: 'rgba(201,162,75,0.08)' },
  dayWeekday: { color: colors.boneMuted, fontSize: 11 },
  dayNumber: { color: colors.bone, fontSize: 16, fontWeight: '700', marginTop: 2 },
  slotChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  slotChipActive: { backgroundColor: colors.brass, borderColor: colors.brass },
  slotText: { color: colors.bone, fontFamily: 'monospace' },
  empty: { color: colors.boneMuted, marginTop: 8 },
  error: { color: colors.oxbloodLight, marginTop: 16 },
});
