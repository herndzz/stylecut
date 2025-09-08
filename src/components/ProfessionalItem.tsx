import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Professional } from '@utils/types';

type Props = {
  professional: Professional;
  onEdit: (p: Professional) => void;
  onDelete: (p: Professional) => void;
};

export default function ProfessionalItem({ professional, onEdit, onDelete }: Props) {
  return (
    <View className="py-3 border-b border-gray-200 flex-row items-center justify-between">
      <View>
        <Text className="font-semibold">{professional.name}</Text>
        {!!professional.phone && <Text className="text-gray-500">{professional.phone}</Text>}
      </View>
      <View className="flex-row gap-3">
        <Pressable onPress={() => onEdit(professional)} className="px-3 py-2 rounded-md bg-blue-600">
          <Text className="text-white">Editar</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(professional)} className="px-3 py-2 rounded-md bg-red-600">
          <Text className="text-white">Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}
