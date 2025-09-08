import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Modal, Alert, ActivityIndicator, RefreshControl, ListRenderItem, ListRenderItemInfo } from 'react-native';
import Loading from '@components/Loading';
import Button from '@components/Button';
import ServiceItem from '@components/ServiceItem';
import ServiceForm, { ServiceFormValues } from '@components/ServiceForm';
import { Service } from '@utils/types';
import { useServices, useAddService, useUpdateService, useDeleteService } from '@hooks/useServices';

export default function ServicesScreen() {
  const { data, isLoading, isFetching, isError, error, refetch } = useServices();
  const addMutation = useAddService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const services = useMemo(() => data || [], [data]);

  const openCreate = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setModalVisible(true);
  };

  const closeModal = () => {
    if (addMutation.isPending || updateMutation.isPending) return;
    setModalVisible(false);
    setEditing(null);
  };

  const handleSubmit = (values: ServiceFormValues) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload: values },
        {
          onSuccess: () => {
            Alert.alert('Sucesso', 'Serviço atualizado com sucesso.');
            setModalVisible(false);
            setEditing(null);
          },
          onError: (err: any) => {
            Alert.alert('Erro', err?.response?.data?.message || 'Falha ao atualizar serviço.');
          },
        },
      );
    } else {
      addMutation.mutate(values, {
        onSuccess: () => {
          Alert.alert('Sucesso', 'Serviço criado com sucesso.');
          setModalVisible(false);
        },
        onError: (err: any) => {
          Alert.alert('Erro', err?.response?.data?.message || 'Falha ao criar serviço.');
        },
      });
    }
  };

  const handleDelete = (s: Service) => {
    Alert.alert('Confirmar exclusão', `Excluir ${s.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(s.id, {
            onSuccess: () => Alert.alert('Sucesso', 'Serviço excluído.'),
            onError: (err: any) => {
              Alert.alert('Erro', err?.response?.data?.message || 'Falha ao excluir serviço.');
            },
          }),
      },
    ]);
  };

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-red-600 mb-3">Falha ao carregar serviços.</Text>
        <Button title="Tentar novamente" onPress={refetch} />
        {!!(error as any)?.message && (
          <Text className="text-gray-500 mt-2">{(error as any).message}</Text>
        )}
      </View>
    );
  }

  if (isLoading) return <Loading />;

  const renderItem: ListRenderItem<Service> = ({ item }: ListRenderItemInfo<Service>) => (
    <View className="px-4">
      <ServiceItem service={item} onEdit={openEdit} onDelete={handleDelete} />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold">Serviços</Text>
        <View className="mt-3">
          <Button title="Novo Serviço" onPress={openCreate} />
        </View>
      </View>

      <FlatList<Service>
        data={services}
        keyExtractor={(item: Service) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={!!isFetching} onRefresh={refetch} />}
        ListEmptyComponent={<Text className="px-4 py-6 text-gray-500">Nenhum serviço cadastrado.</Text>}
      />

      {(addMutation.isPending || updateMutation.isPending || deleteMutation.isPending) && (
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <View className="bg-black/30 absolute inset-0" />
          <ActivityIndicator color="#fff" />
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View className="flex-1 bg-black/30 items-center justify-center">
          <View className="w-11/12 bg-white rounded-lg p-4">
            <Text className="text-xl font-semibold mb-3">{editing ? 'Editar Serviço' : 'Novo Serviço'}</Text>
            <ServiceForm
              initialValues={
                editing
                  ? { name: editing.name, price: Number(editing.price), duration: Number(editing.duration) }
                  : undefined
              }
              submitting={addMutation.isPending || updateMutation.isPending}
              onSubmit={handleSubmit}
              onCancel={closeModal}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
