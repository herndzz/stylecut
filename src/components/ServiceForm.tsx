import React, { useEffect, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import Button from './Button';
import { validateRequired, validatePositiveNumber, validatePositiveInteger } from '@utils/validation';

export type ServiceFormValues = {
  name: string;
  price: number;
  duration: number; // minutes
};

type Props = {
  initialValues?: ServiceFormValues;
  submitting?: boolean;
  onSubmit: (values: ServiceFormValues) => void;
  onCancel?: () => void;
};

export default function ServiceForm({ initialValues, submitting, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initialValues?.name || '');
  const [price, setPrice] = useState(String(initialValues?.price ?? ''));
  const [duration, setDuration] = useState(String(initialValues?.duration ?? ''));
  const [errors, setErrors] = useState<{ name?: string; price?: string; duration?: string }>({});

  useEffect(() => {
    setName(initialValues?.name || '');
    setPrice(initialValues?.price != null ? String(initialValues.price) : '');
    setDuration(initialValues?.duration != null ? String(initialValues.duration) : '');
    setErrors({});
  }, [initialValues]);

  const handleSubmit = () => {
    const nameError = validateRequired(name, 'Nome');
    const priceError = validatePositiveNumber(price, 'Preço');
    const durationError = validatePositiveInteger(duration, 'Duração (min)');

    const newErrors: { name?: string; price?: string; duration?: string } = {};
    if (nameError) newErrors.name = nameError;
    if (priceError) newErrors.price = priceError;
    if (durationError) newErrors.duration = durationError;
    setErrors(newErrors);

    if (!nameError && !priceError && !durationError) {
      const priceNum = parseFloat(price.replace(',', '.'));
      const durationNum = parseInt(duration.replace(/[^0-9]/g, ''), 10);
      onSubmit({ name: name.trim(), price: priceNum, duration: durationNum });
    }
  };

  return (
    <View className="gap-3">
      <View>
        <Text className="mb-1 font-medium">Nome</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2"
          value={name}
          onChangeText={setName}
          placeholder="Nome do serviço"
          editable={!submitting}
        />
        {!!errors.name && <Text className="text-red-600 mt-1">{errors.name}</Text>}
      </View>

      <View>
        <Text className="mb-1 font-medium">Preço (R$)</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2"
          value={price}
          onChangeText={setPrice}
          placeholder="0,00"
          keyboardType="decimal-pad"
          editable={!submitting}
        />
        {!!errors.price && <Text className="text-red-600 mt-1">{errors.price}</Text>}
      </View>

      <View>
        <Text className="mb-1 font-medium">Duração (minutos)</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2"
          value={duration}
          onChangeText={setDuration}
          placeholder="30"
          keyboardType="number-pad"
          editable={!submitting}
        />
        {!!errors.duration && <Text className="text-red-600 mt-1">{errors.duration}</Text>}
      </View>

      <View className="flex-row gap-3 mt-1">
        <View className="flex-1" style={{ opacity: submitting ? 0.7 : 1 }}>
          <Button title={submitting ? 'Salvando...' : 'Salvar'} onPress={handleSubmit} />
        </View>
        {onCancel && (
          <View className="flex-1">
            <Button title="Cancelar" onPress={onCancel} />
          </View>
        )}
      </View>
    </View>
  );
}
