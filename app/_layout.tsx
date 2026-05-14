import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/lib/query/client';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeProvider';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { registerPushToken } from '@/lib/push/registerPushToken';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* no-op: screen may already be hidden in dev */
});

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { session, profile, initializing, hydrate } = useAuthStore();
  const pushRegistered = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (initializing) return;
    SplashScreen.hideAsync().catch(() => {});

    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [initializing, session, segments, router]);

  // Register push token once per session
  useEffect(() => {
    if (session && profile?.id && !pushRegistered.current) {
      pushRegistered.current = true;
      void registerPushToken(profile.id);
    }
  }, [session, profile?.id]);

  // Handle notification tap → route to lurido
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const luridoId = response.notification.request.content.data?.luridoId as string | undefined;
      if (luridoId) router.push(`/lurido/${luridoId}`);
    });
    return () => sub.remove();
  }, [router]);

  return null;
}

function RootStack() {
  const { mode } = useTheme();
  return (
    <>
      <AuthGate />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="lurido/[id]"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
      </Stack>
      <StatusBar style={mode === 'day' ? 'dark' : 'light'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider defaultMode="night" defaultAccent="ambra">
            <RootStack />
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
