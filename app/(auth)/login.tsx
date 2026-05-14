import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LButton } from '@/components/LButton';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function LoginScreen() {
  const { palette } = useTheme();
  const signIn = useAuthStore((s) => s.signInWithPassword);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // Redirect avviene in <AuthGate> del root layout.
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore sconosciuto';
      Alert.alert('Accesso fallito', msg);
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
            <Text className="font-display-bold text-[32px] text-l-text">iLoveLurido</Text>
            <Text className="font-mono text-[13px] text-l-text-muted mt-1">
              baracchini di milano · dopo le 22
            </Text>
          </View>

          <View className="gap-3">
            <TextInput
              className="h-12 px-4 rounded-l-md bg-l-surface border border-l-border font-body text-l-text"
              placeholder="email"
              placeholderTextColor={palette.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              className="h-12 px-4 rounded-l-md bg-l-surface border border-l-border font-body text-l-text"
              placeholder="password"
              placeholderTextColor={palette.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <LButton
              label="Entra"
              onPress={onSubmit}
              loading={loading}
              disabled={!email || !password}
            />
            <LButton label="Continua con Apple" variant="ghost" disabled />
            <LButton label="Continua con Google" variant="ghost" disabled />
          </View>

          <View className="items-center">
            <Text className="text-l-text-muted">
              Non hai un account?{' '}
              <Link href="/(auth)/signup" className="text-l-accent font-body-semibold">
                Registrati
              </Link>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
