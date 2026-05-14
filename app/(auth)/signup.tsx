import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LButton } from '@/components/LButton';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function SignupScreen() {
  const { palette } = useTheme();
  const signUp = useAuthStore((s) => s.signUpWithPassword);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !username || password.length < 8) return;
    setLoading(true);
    try {
      await signUp(email.trim(), password, username.trim());
      Alert.alert(
        'Controlla la mail',
        'Ti abbiamo mandato un link per confermare. Poi torna qui e fai login.',
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore sconosciuto';
      Alert.alert('Registrazione fallita', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-l-bg" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View className="flex-1 px-[18px] justify-between py-8">
          <View>
            <Text className="font-display-bold text-[28px] text-l-text">Unisciti ai luridi</Text>
            <Text className="font-body text-[14px] text-l-text-muted mt-1">
              Basta una mail e un nickname.
            </Text>
          </View>

          <View className="gap-3">
            <TextInput
              className="h-12 px-4 rounded-l-md bg-l-surface border border-l-border font-body text-l-text"
              placeholder="username"
              placeholderTextColor={palette.textMuted}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              className="h-12 px-4 rounded-l-md bg-l-surface border border-l-border font-body text-l-text"
              placeholder="email"
              placeholderTextColor={palette.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              className="h-12 px-4 rounded-l-md bg-l-surface border border-l-border font-body text-l-text"
              placeholder="password (min. 8)"
              placeholderTextColor={palette.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <LButton
              label="Crea account"
              onPress={onSubmit}
              loading={loading}
              disabled={!email || !username || password.length < 8}
            />
          </View>

          <View className="items-center">
            <Text className="text-l-text-muted">
              Hai già un account?{' '}
              <Link href="/(auth)/login" className="text-l-accent font-body-semibold">
                Accedi
              </Link>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
