import React, { useState, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import Button from './Button';
import { validateRequired, validatePhone } from '@utils/validation';

export type ClientFormValues = {
  name: string;
  phone: string;
};

type Props = {
  initialValues?: ClientFormValues;
  submitting?: boolean;
  onSubmit: (values: ClientFormValues) => void;
  onCancel?: () => void;
};

export default function ClientForm({ initialValues, submitting, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initialValues?.name || '');
  const [phone, setPhone] = useState(initialValues?.phone || '');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    setName(initialValues?.name || '');
    setPhone(initialValues?.phone || '');
    setErrors({});
  }, [initialValues]);

  const handleSubmit = () => {
    const nameError = validateRequired(name, 'Nome');
    const phoneError = validatePhone(phone);
    const newErrors: { name?: string; phone?: string } = {};
    if (nameError) newErrors.name = nameError;
    if (phoneError) newErrors.phone = phoneError;
    setErrors(newErrors);

    if (!nameError && !phoneError) {
      onSubmit({ name: name.trim(), phone: phone.trim() });
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
          placeholder="Nome do cliente"
          editable={!submitting}
        />
        {!!errors.name && <Text className="text-red-600 mt-1">{errors.name}</Text>}
      </View>

      <View>
        <Text className="mb-1 font-medium">Telefone</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2"
          value={phone}
          onChangeText={setPhone}
          placeholder="(11) 99999-9999"
          keyboardType="phone-pad"
          editable={!submitting}
        />
        {!!errors.phone && <Text className="text-red-600 mt-1">{errors.phone}</Text>}
      </View>

      <View className="flex-row gap-3 mt-1">
        <View className="flex-1 opacity-100" style={{ opacity: submitting ? 0.7 : 1 }}>
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
