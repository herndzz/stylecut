import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Modal, Alert, ActivityIndicator, RefreshControl, ListRenderItem, ListRenderItemInfo } from 'react-native';
import Loading from '@components/Loading';
import Button from '@components/Button';
import ProfessionalItem from '@components/ProfessionalItem';
import ProfessionalForm, { ProfessionalFormValues } from '@components/ProfessionalForm';
import { Professional } from '@utils/types';
import { useProfessionals, useAddProfessional, useUpdateProfessional, useDeleteProfessional } from '@hooks/useProfessionals';

export default function ProfessionalsScreen() {
  const { data, isLoading, isFetching, isError, error, refetch } = useProfessionals();
  const addMutation = useAddProfessional();
  const updateMutation = useUpdateProfessional();
  const deleteMutation = useDeleteProfessional();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);

  const professionals = useMemo(() => data || [], [data]);

  const openCreate = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (p: Professional) => {
    setEditing(p);
    setModalVisible(true);
  };

  const closeModal = () => {
    if (addMutation.isPending || updateMutation.isPending) return;
    setModalVisible(false);
    setEditing(null);
  };

  const handleSubmit = (values: ProfessionalFormValues) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload: values },
        {
          onSuccess: () => {
            Alert.alert('Sucesso', 'Profissional atualizado com sucesso.');
            setModalVisible(false);
            setEditing(null);
          },
          onError: (err: any) => {
            Alert.alert('Erro', err?.response?.data?.message || 'Falha ao atualizar profissional.');
          },
        },
      );
    } else {
      addMutation.mutate(values, {
        onSuccess: () => {
          Alert.alert('Sucesso', 'Profissional criado com sucesso.');
          setModalVisible(false);
        },
        onError: (err: any) => {
          Alert.alert('Erro', err?.response?.data?.message || 'Falha ao criar profissional.');
        },
      });
    }
  };

  const handleDelete = (p: Professional) => {
    Alert.alert('Confirmar exclusão', `Excluir ${p.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(p.id, {
            onSuccess: () => Alert.alert('Sucesso', 'Profissional excluído.'),
            onError: (err: any) => {
              Alert.alert('Erro', err?.response?.data?.message || 'Falha ao excluir profissional.');
            },
          }),
      },
    ]);
  };

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-red-600 mb-3">Falha ao carregar profissionais.</Text>
        <Button title="Tentar novamente" onPress={refetch} />
        {!!(error as any)?.message && (
          <Text className="text-gray-500 mt-2">{(error as any).message}</Text>
        )}
      </View>
    );
  }

  if (isLoading) return <Loading />;

  const renderItem: ListRenderItem<Professional> = ({ item }: ListRenderItemInfo<Professional>) => (
    <View className="px-4">
      <ProfessionalItem professional={item} onEdit={openEdit} onDelete={handleDelete} />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold">Profissionais</Text>
        <View className="mt-3">
          <Button title="Novo Profissional" onPress={openCreate} />
        </View>
      </View>

      <FlatList<Professional>
        data={professionals}
        keyExtractor={(item: Professional) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={!!isFetching} onRefresh={refetch} />}
        ListEmptyComponent={<Text className="px-4 py-6 text-gray-500">Nenhum profissional cadastrado.</Text>}
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
            <Text className="text-xl font-semibold mb-3">{editing ? 'Editar Profissional' : 'Novo Profissional'}</Text>
            <ProfessionalForm
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
