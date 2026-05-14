import { Tabs } from 'expo-router';
import { LFloatingTabBar } from '@/components/LFloatingTabBar';
import { selectIsMod, useAuthStore } from '@/lib/store/useAuthStore';

export default function TabsLayout() {
  const isMod = useAuthStore(selectIsMod);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={(props) => <LFloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Mappa' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifiche' }} />
      <Tabs.Screen name="add" options={{ title: '' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profilo' }} />
      <Tabs.Screen
        name="mod"
        options={{
          title: 'Mod',
          href: isMod ? '/mod' : null,
        }}
      />
    </Tabs>
  );
}
