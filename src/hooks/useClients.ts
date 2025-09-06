import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { Client } from '../types';
import { offlineService } from '../services/offlineService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useClients = () => {
  const queryClient = useQueryClient();

  const { data: clients, isLoading, error } = useQuery<Client[]>('clients', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/clients`);
      return response.data;
    } catch (error) {
      console.log("Endpoint '/api/clients' não encontrado. Usando fallback offline.");
      return offlineService.getClients();
    }
  });

  const addClientMutation = useMutation(
    async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await axios.post(`${API_URL}/api/clients`, clientData);
        return response.data;
      } catch (error) {
        console.log("Cliente salvo offline");
        return await offlineService.addClient(clientData);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
      },
    }
  );

  const updateClientMutation = useMutation(
    async ({ id, data }: { id: string; data: Partial<Client> }) => {
      try {
        const response = await axios.put(`${API_URL}/api/clients/${id}`, data);
        return response.data;
      } catch (error) {
        throw new Error('Falha ao atualizar cliente');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
      },
    }
  );

  const deleteClientMutation = useMutation(
    async (id: string) => {
      try {
        await axios.delete(`${API_URL}/api/clients/${id}`);
      } catch (error) {
        throw new Error('Falha ao excluir cliente');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
      },
    }
  );

  const searchByPhone = async (phone: string): Promise<Client | undefined> => {
    try {
      // Corrigir endpoint - usar o endpoint correto do backend
      const response = await axios.get(`${API_URL}/api/clients/search/phone/${phone}`);
      return response.data;
    } catch (error) {
      console.log('Buscando cliente offline...');
      return offlineService.searchClientByPhone(phone);
    }
  };

  return {
    clients,
    isLoading,
    error,
    addClient: addClientMutation.mutate,
    updateClient: (id: string, data: Partial<Client>) => updateClientMutation.mutate({ id, data }),
    deleteClient: deleteClientMutation.mutate,
    searchByPhone,
    isAdding: addClientMutation.isLoading,
  };
};