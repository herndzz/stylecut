import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Modal } from 'react-native';
import Button from './Button';
import { Client, Professional, Service } from '@utils/types';
import { validateDate, validateTime } from '@utils/validation';

export type AppointmentFormValues = {
  clientId: string | number;
  professionalId: string | number;
  serviceId: string | number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
};

type Props = {
  clients: Client[];
  professionals: Professional[];
  services: Service[];
  initialValues?: AppointmentFormValues;
  submitting?: boolean;
  onSubmit: (values: AppointmentFormValues) => void;
  onCancel?: () => void;
};

function Selector<T extends { id: any; name: string }>({
  label,
  data,
  selectedId,
  onSelect,
  disabled,
}: {
  label: string;
  data: T[];
  selectedId?: T['id'];
  onSelect: (item: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => data.find((d) => String(d.id) === String(selectedId)), [data, selectedId]);

  return (
    <View>
      <Text className="mb-1 font-medium">{label}</Text>
      <Pressable
        className="border border-gray-300 rounded-md px-3 py-2 bg-white"
        onPress={() => !disabled && setOpen(true)}
      >
        <Text>{selected ? selected.name : 'Selecionar...'}</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View className="flex-1 bg-black/30 items-center justify-center">
          <View className="w-11/12 max-h-[70%] bg-white rounded-lg p-3">
            <Text className="text-lg font-semibold mb-2">{label}</Text>
            <FlatList
              data={data}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Pressable
                  className="py-3 border-b border-gray-200"
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text>{item.name}</Text>
                </Pressable>
              )}
            />
            <View className="mt-3">
              <Button title="Fechar" onPress={() => setOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function AppointmentForm({ clients, professionals, services, initialValues, submitting, onSubmit, onCancel }: Props) {
  const [clientId, setClientId] = useState<any>(initialValues?.clientId || undefined);
  const [professionalId, setProfessionalId] = useState<any>(initialValues?.professionalId || undefined);
  const [serviceId, setServiceId] = useState<any>(initialValues?.serviceId || undefined);
  const [date, setDate] = useState(initialValues?.date || '');
  const [time, setTime] = useState(initialValues?.time || '');
  const [errors, setErrors] = useState<{ clientId?: string; professionalId?: string; serviceId?: string; date?: string; time?: string }>({});

  useEffect(() => {
    setClientId(initialValues?.clientId || undefined);
    setProfessionalId(initialValues?.professionalId || undefined);
    setServiceId(initialValues?.serviceId || undefined);
    setDate(initialValues?.date || '');
    setTime(initialValues?.time || '');
    setErrors({});
  }, [initialValues]);

  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    if (!clientId) newErrors.clientId = 'Cliente é obrigatório.';
    if (!professionalId) newErrors.professionalId = 'Profissional é obrigatório.';
    if (!serviceId) newErrors.serviceId = 'Serviço é obrigatório.';
    const dateErr = validateDate(date);
    const timeErr = validateTime(time);
    if (dateErr) newErrors.date = dateErr;
    if (timeErr) newErrors.time = timeErr;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({ clientId, professionalId, serviceId, date: date.trim(), time: time.trim() });
    }
  };

  return (
    <View className="gap-3">
      <Selector label="Cliente" data={clients} selectedId={clientId} onSelect={(c) => setClientId(c.id)} disabled={submitting} />
      {!!errors.clientId && <Text className="text-red-600 -mt-2">{errors.clientId}</Text>}

      <Selector label="Profissional" data={professionals} selectedId={professionalId} onSelect={(p) => setProfessionalId(p.id)} disabled={submitting} />
      {!!errors.professionalId && <Text className="text-red-600 -mt-2">{errors.professionalId}</Text>}

      <Selector label="Serviço" data={services} selectedId={serviceId} onSelect={(s) => setServiceId(s.id)} disabled={submitting} />
      {!!errors.serviceId && <Text className="text-red-600 -mt-2">{errors.serviceId}</Text>}

      <View>
        <Text className="mb-1 font-medium">Data (YYYY-MM-DD)</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2"
          value={date}
          onChangeText={setDate}
          placeholder="2025-01-31"
          editable={!submitting}
        />
        {!!errors.date && <Text className="text-red-600 mt-1">{errors.date}</Text>}
      </View>

      <View>
        <Text className="mb-1 font-medium">Hora (HH:mm)</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2"
          value={time}
          onChangeText={setTime}
          placeholder="14:30"
          keyboardType="number-pad"
          editable={!submitting}
        />
        {!!errors.time && <Text className="text-red-600 mt-1">{errors.time}</Text>}
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
