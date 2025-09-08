import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Modal, Alert, ActivityIndicator, RefreshControl, ListRenderItem, ListRenderItemInfo } from 'react-native';
import Loading from '@components/Loading';
import Button from '@components/Button';
import AppointmentItem from '@components/AppointmentItem';
import AppointmentForm, { AppointmentFormValues } from '@components/AppointmentForm';
import { Appointment, Client, Professional, Service } from '@utils/types';
import { useAppointments, useAddAppointment, useUpdateAppointmentStatus, useDeleteAppointment } from '@hooks/useAppointments';
import { useClients } from '@hooks/useClients';
import { useProfessionals } from '@hooks/useProfessionals';
import { useServices } from '@hooks/useServices';

function composeStartAt(date: string, time: string) {
  const iso = new Date(`${date}T${time}:00`).toISOString();
  return iso;
}

export default function AppointmentsScreen() {
  const { data, isLoading, isFetching, isError, error, refetch } = useAppointments();
  const addMutation = useAddAppointment();
  const statusMutation = useUpdateAppointmentStatus();
  const deleteMutation = useDeleteAppointment();

  const clientsQ = useClients();
  const profsQ = useProfessionals();
  const servicesQ = useServices();

  const loadingDeps = clientsQ.isLoading || profsQ.isLoading || servicesQ.isLoading;
  const errorDeps = clientsQ.isError || profsQ.isError || servicesQ.isError;

  const [modalVisible, setModalVisible] = useState(false);

  const appts = useMemo(() => data || [], [data]);
  const clients = useMemo<Client[]>(() => clientsQ.data || [], [clientsQ.data]);
  const professionals = useMemo<Professional[]>(() => profsQ.data || [], [profsQ.data]);
  const services = useMemo<Service[]>(() => servicesQ.data || [], [servicesQ.data]);

  const clientMap = useMemo<Map<string, string>>(
    () => new Map(clients.map((c: Client) => [String(c.id), c.name] as [string, string])),
    [clients],
  );
  const profMap = useMemo<Map<string, string>>(
    () => new Map(professionals.map((p: Professional) => [String(p.id), p.name] as [string, string])),
    [professionals],
  );
  const serviceMap = useMemo<Map<string, string>>(
    () => new Map(services.map((s: Service) => [String(s.id), s.name] as [string, string])),
    [services],
  );

  const openCreate = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    if (addMutation.isPending) return;
    setModalVisible(false);
  };

  const handleSubmit = (values: AppointmentFormValues) => {
    const startAt = composeStartAt(values.date, values.time);
    addMutation.mutate(
      { clientId: values.clientId, professionalId: values.professionalId, serviceId: values.serviceId, startAt },
      {
        onSuccess: () => {
          Alert.alert('Sucesso', 'Agendamento criado com sucesso.');
          setModalVisible(false);
        },
        onError: (err: any) => {
          Alert.alert('Erro', err?.response?.data?.message || 'Falha ao criar agendamento.');
        },
      },
    );
  };

  const handleComplete = (a: Appointment) => {
    statusMutation.mutate(
      { id: a.id, status: 'completed' },
      {
        onSuccess: () => Alert.alert('Sucesso', 'Agendamento concluído.'),
        onError: (err: any) => {
          Alert.alert('Erro', err?.response?.data?.message || 'Falha ao atualizar status.');
        },
      },
    );
  };

  const handleCancel = (a: Appointment) => {
    Alert.alert('Cancelar agendamento', 'Confirmar cancelamento?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () =>
          statusMutation.mutate(
            { id: a.id, status: 'cancelled' },
            {
              onSuccess: () => Alert.alert('Sucesso', 'Agendamento cancelado.'),
              onError: (err: any) => {
                Alert.alert('Erro', err?.response?.data?.message || 'Falha ao cancelar.');
              },
            },
          ),
      },
    ]);
  };

  const handleDelete = (a: Appointment) => {
    Alert.alert('Excluir agendamento', 'Excluir permanentemente?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(a.id, {
            onSuccess: () => Alert.alert('Sucesso', 'Agendamento excluído.'),
            onError: (err: any) => {
              Alert.alert('Erro', err?.response?.data?.message || 'Falha ao excluir.');
            },
          }),
      },
    ]);
  };

  if (isError || errorDeps) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-red-600 mb-3">Falha ao carregar agendamentos/dependências.</Text>
        <Button title="Tentar novamente" onPress={() => { refetch(); clientsQ.refetch(); profsQ.refetch(); servicesQ.refetch(); }} />
        {!!(error as any)?.message && (
          <Text className="text-gray-500 mt-2">{(error as any).message}</Text>
        )}
      </View>
    );
  }

  if (isLoading || loadingDeps) return <Loading />;

  const renderItem: ListRenderItem<Appointment> = ({ item }: ListRenderItemInfo<Appointment>) => (
    <View className="px-4">
      <AppointmentItem
        appt={item}
        clientName={clientMap.get(String(item.clientId))}
        professionalName={profMap.get(String(item.professionalId))}
        serviceName={serviceMap.get(String(item.serviceId))}
        onComplete={handleComplete}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold">Agendamentos</Text>
        <View className="mt-3">
          <Button title="Novo Agendamento" onPress={openCreate} />
        </View>
      </View>

      <FlatList<Appointment>
        data={appts}
        keyExtractor={(item: Appointment) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={!!isFetching} onRefresh={refetch} />}
        ListEmptyComponent={<Text className="px-4 py-6 text-gray-500">Nenhum agendamento.</Text>}
      />

      {(addMutation.isPending || statusMutation.isPending || deleteMutation.isPending) && (
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <View className="bg-black/30 absolute inset-0" />
          <ActivityIndicator color="#fff" />
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View className="flex-1 bg-black/30 items-center justify-center">
          <View className="w-11/12 bg-white rounded-lg p-4">
            <Text className="text-xl font-semibold mb-3">Novo Agendamento</Text>
            <AppointmentForm
              clients={clients}
              professionals={professionals}
              services={services}
              submitting={addMutation.isPending}
              onSubmit={(v) => handleSubmit(v)}
              onCancel={closeModal}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
