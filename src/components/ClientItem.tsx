import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Client } from '@utils/types';

type Props = {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
};

export default function ClientItem({ client, onEdit, onDelete }: Props) {
  return (
    <View className="py-3 border-b border-gray-200 flex-row items-center justify-between">
      <View>
        <Text className="font-semibold">{client.name}</Text>
        {!!client.phone && <Text className="text-gray-500">{client.phone}</Text>}
      </View>
      <View className="flex-row gap-3">
        <Pressable onPress={() => onEdit(client)} className="px-3 py-2 rounded-md bg-blue-600">
          <Text className="text-white">Editar</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(client)} className="px-3 py-2 rounded-md bg-red-600">
          <Text className="text-white">Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}
