import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
};

export default function Button({ title, onPress, style }: Props) {
  return (
    <Pressable onPress={onPress} className="bg-black rounded-md px-4 py-3" style={style}>
      <Text className="text-white font-semibold text-center">{title}</Text>
    </Pressable>
  );
}
