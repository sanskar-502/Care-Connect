import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Colors from '../constants/Colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="(patient)/checklist" 
          options={{ title: 'Daily Check-in' }} 
        />
        <Stack.Screen 
          name="(doctor)/dictate" 
          options={{ title: 'Ambient Dictation' }} 
        />
        <Stack.Screen 
          name="(doctor)/copilot" 
          options={{ title: 'RAG Copilot' }} 
        />
      </Stack>
    </>
  );
}
