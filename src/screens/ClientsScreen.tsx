import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Modal, Alert, ActivityIndicator, RefreshControl, ListRenderItem, ListRenderItemInfo } from 'react-native';
import Loading from '@components/Loading';
import ClientItem from '@components/ClientItem';
import ClientForm, { ClientFormValues } from '@components/ClientForm';
import Button from '@components/Button';
import { Client } from '@utils/types';
import { useClients, useAddClient, useUpdateClient, useDeleteClient } from '@hooks/useClients';

export default function ClientsScreen() {
  const { data, isLoading, isFetching, refetch, isError, error } = useClients();
  const addMutation = useAddClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const clients = useMemo(() => data || [], [data]);

  const openCreate = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setModalVisible(true);
  };

  const closeModal = () => {
    if (addMutation.isPending || updateMutation.isPending) return;
    setModalVisible(false);
    setEditing(null);
  };

  const handleSubmit = (values: ClientFormValues) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload: values },
        {
          onSuccess: () => {
            Alert.alert('Sucesso', 'Cliente atualizado com sucesso.');
            setModalVisible(false);
            setEditing(null);
          },
          onError: (err: any) => {
            Alert.alert('Erro', err?.response?.data?.message || 'Falha ao atualizar cliente.');
          },
        },
      );
    } else {
      addMutation.mutate(values, {
        onSuccess: () => {
          Alert.alert('Sucesso', 'Cliente criado com sucesso.');
          setModalVisible(false);
        },
        onError: (err: any) => {
          Alert.alert('Erro', err?.response?.data?.message || 'Falha ao criar cliente.');
        },
      });
    }
  };

  const handleDelete = (client: Client) => {
    Alert.alert('Confirmar exclusão', `Excluir ${client.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(client.id, {
            onSuccess: () => {
              Alert.alert('Sucesso', 'Cliente excluído.');
            },
            onError: (err: any) => {
              Alert.alert('Erro', err?.response?.data?.message || 'Falha ao excluir cliente.');
            },
          }),
      },
    ]);
  };

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-red-600 mb-3">Falha ao carregar clientes.</Text>
        <Button title="Tentar novamente" onPress={refetch} />
        {!!(error as any)?.message && (
          <Text className="text-gray-500 mt-2">{(error as any).message}</Text>
        )}
      </View>
    );
  }

  if (isLoading) return <Loading />;

  const renderItem: ListRenderItem<Client> = ({ item }: ListRenderItemInfo<Client>) => (
    <View className="px-4">
      <ClientItem client={item} onEdit={openEdit} onDelete={handleDelete} />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold">Clientes</Text>
        <View className="mt-3">
          <Button title="Novo Cliente" onPress={openCreate} />
        </View>
      </View>

      <FlatList<Client>
        data={clients}
        keyExtractor={(item: Client) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={!!isFetching} onRefresh={refetch} />}
        ListEmptyComponent={<Text className="px-4 py-6 text-gray-500">Nenhum cliente cadastrado.</Text>}
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
            <Text className="text-xl font-semibold mb-3">{editing ? 'Editar Cliente' : 'Novo Cliente'}</Text>
            <ClientForm
              initialValues={editing ? { name: editing.name, phone: editing.phone || '' } : undefined}
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
