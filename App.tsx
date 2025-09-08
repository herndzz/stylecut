import React, { useEffect } from 'react';
import { StatusBar, AppState } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { queryClient } from './src/services/queryClient';

import HomeScreen from './src/screens/HomeScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import ProfessionalsScreen from './src/screens/ProfessionalsScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={DefaultTheme}>
          <StatusBar barStyle="dark-content" />
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'StyleCut' }} />
            <Stack.Screen name="Clients" component={ClientsScreen} />
            <Stack.Screen name="Professionals" component={ProfessionalsScreen} />
            <Stack.Screen name="Services" component={ServicesScreen} />
            <Stack.Screen name="Appointments" component={AppointmentsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
