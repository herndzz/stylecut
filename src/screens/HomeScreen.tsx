import React from 'react';
import { View, Text } from 'react-native';
import Button from '@components/Button';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Clients: undefined;
  Professionals: undefined;
  Services: undefined;
  Appointments: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View className="flex-1 p-4 bg-white gap-3">
      <Text className="text-2xl font-bold mb-2">StyleCut Mobile</Text>
      <Button title="Clientes" onPress={() => navigation.navigate('Clients')} />
      <Button title="Profissionais" onPress={() => navigation.navigate('Professionals')} />
      <Button title="Serviços" onPress={() => navigation.navigate('Services')} />
      <Button title="Agendamentos" onPress={() => navigation.navigate('Appointments')} />
    </View>
  );
}
