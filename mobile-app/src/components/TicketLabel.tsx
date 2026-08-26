import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Pequeno rótulo estilo "ticket" usado como assinatura visual da marca,
// o mesmo elemento usado no site (ex: "Nº 001", "AGENDA", "APP · CLIENTE")
export function TicketLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: colors.brass,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
