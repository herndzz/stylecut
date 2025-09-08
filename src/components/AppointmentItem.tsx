import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Appointment, Client, Professional, Service } from '@utils/types';

type Props = {
  appt: Appointment;
  clientName?: string;
  professionalName?: string;
  serviceName?: string;
  onComplete: (a: Appointment) => void;
  onCancel: (a: Appointment) => void;
  onDelete?: (a: Appointment) => void;
};

export default function AppointmentItem({ appt, clientName, professionalName, serviceName, onComplete, onCancel, onDelete }: Props) {
  const dt = useMemo(() => new Date(appt.startAt), [appt.startAt]);
  const dateStr = useMemo(() => dt.toLocaleString(), [dt]);
  const isScheduled = appt.status === 'scheduled';

  return (
    <View className="py-3 border-b border-gray-200">
      <Text className="font-semibold">{clientName || appt.client?.name || '—'} ➜ {professionalName || appt.professional?.name || '—'}</Text>
      <Text className="text-gray-600">{serviceName || appt.service?.name || '—'}</Text>
      <Text className="text-gray-500">{dateStr} • {appt.status}</Text>

      <View className="flex-row gap-3 mt-2">
        {isScheduled && (
          <Pressable onPress={() => onComplete(appt)} className="px-3 py-2 rounded-md bg-emerald-600">
            <Text className="text-white">Completar</Text>
          </Pressable>
        )}
        {isScheduled && (
          <Pressable onPress={() => onCancel(appt)} className="px-3 py-2 rounded-md bg-orange-600">
            <Text className="text-white">Cancelar</Text>
          </Pressable>
        )}
        {onDelete && (
          <Pressable onPress={() => onDelete(appt)} className="px-3 py-2 rounded-md bg-red-600">
            <Text className="text-white">Excluir</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
