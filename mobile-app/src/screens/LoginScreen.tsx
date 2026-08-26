import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { colors } from '../theme/colors';
import { Button } from '../components/Button';
import { TicketLabel } from '../components/TicketLabel';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.ink }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>
          BRABUS <Text style={{ color: colors.brass }}>BARBER</Text>
        </Text>

        <View style={styles.card}>
          <TicketLabel>Entrar</TicketLabel>
          <Text style={styles.title}>Bem-vindo de volta</Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="voce@email.com"
            placeholderTextColor={colors.boneMuted}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.boneMuted}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button label="ENTRAR" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />
        </View>

        <Pressable onPress={() => navigation.navigate('Register')} style={styles.footerLink}>
          <Text style={styles.footerText}>
            Ainda não tem conta? <Text style={{ color: colors.brass }}>Cadastre-se</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand: {
    color: colors.bone,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: colors.inkSurface,
    borderRadius: 4,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.bone, fontSize: 22, fontWeight: '600', marginTop: 8, marginBottom: 20 },
  label: { color: colors.boneMuted, fontSize: 12, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: colors.inkSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 12,
    color: colors.bone,
  },
  error: { color: colors.oxbloodLight, marginTop: 12, fontSize: 13 },
  footerLink: { marginTop: 24, alignItems: 'center' },
  footerText: { color: colors.boneMuted, fontSize: 13 },
});
