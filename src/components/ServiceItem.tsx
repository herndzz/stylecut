import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Service } from '@utils/types';

type Props = {
  service: Service;
  onEdit: (s: Service) => void;
  onDelete: (s: Service) => void;
};

export default function ServiceItem({ service, onEdit, onDelete }: Props) {
  const price = Number(service.price || 0);
  return (
    <View className="py-3 border-b border-gray-200 flex-row items-center justify-between">
      <View>
        <Text className="font-semibold">{service.name}</Text>
        <Text className="text-gray-500">R$ {price.toFixed(2)} — {service.duration} min</Text>
      </View>
      <View className="flex-row gap-3">
        <Pressable onPress={() => onEdit(service)} className="px-3 py-2 rounded-md bg-blue-600">
          <Text className="text-white">Editar</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(service)} className="px-3 py-2 rounded-md bg-red-600">
          <Text className="text-white">Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}
