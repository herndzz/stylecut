import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Client } from '../types';
import { offlineService } from '../services/offlineService';
import axios, { AxiosError } from 'axios';

// Tipo para o retorno da função
interface UseClientsReturn {
  clients: Client[];
  isLoading: boolean;
  addClient: (data: ClientInput) => void;
  updateClient: (id: string, data: ClientInput) => void;
  deleteClient: (id: string) => void;
  searchByPhone: (phone: string) => Promise<Client | undefined>;
  isAdding: boolean;
  error: Error | null;
  isError: boolean;
}

// Tipo para os dados de entrada de um novo cliente
type ClientInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;

export const useClients = (): UseClientsReturn => {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery<Client[], Error>('clients', async () => {
    try {
      const response = await axios.get('/api/clients');
      return response.data;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        console.warn("Endpoint '/api/clients' não encontrado. Usando fallback offline.");
      } else {
        console.error("Erro ao carregar clientes:", error);
      }
      return offlineService.getClients();
    }
  });

  const addClientMutation = useMutation<
    Client,
    Error,
    ClientInput
  >(
    async (clientData) => {
      try {
        const response = await axios.post('/api/clients', clientData);
        return response.data;
      } catch (error) {
        if ((error as AxiosError).isAxiosError) {
          // Se for um erro do Axios, tentamos salvar offline e notificamos
          const result = await offlineService.addClient(clientData);
          console.log('Cliente salvo offline');
          return result;
        }
        throw error; // Se for outro tipo de erro, propagamos
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
      },
      onError: (error) => {
        const errorMessage = error instanceof AxiosError 
          ? error.response?.data?.message || 'Erro ao criar cliente'
          : 'Erro ao criar cliente';
        console.error(errorMessage);
      },
    }
  );

  const updateClientMutation = useMutation<void, Error, { id: string; data: ClientInput }>(
    async ({ id, data }) => {
      await axios.put(`/api/clients/${id}`, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
      },
    }
  );

  const deleteClientMutation = useMutation<void, Error, string>(
    async (id) => {
      try {
        await axios.delete(`/api/clients/${id}`);
      } catch (error) {
        if ((error as AxiosError).response?.status === 404) {
          console.warn(`Cliente com ID ${id} não encontrado no servidor. Removendo localmente.`);
        } else {
          throw error;
        }
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
      },
      onError: (error) => {
        console.error("Erro ao excluir cliente:", error);
      },
    }
  );

  const searchByPhone = async (phone: string): Promise<Client | undefined> => {
    try {
      return await offlineService.searchClientByPhone(phone);
    } catch (error) {
      console.error('Erro ao buscar cliente por telefone:', error);
      return undefined;
    }
  };

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    addClient: addClientMutation.mutate,
    updateClient: (id, data) => updateClientMutation.mutate({ id, data }),
    deleteClient: (id) => deleteClientMutation.mutate(id),
    searchByPhone,
    isAdding: addClientMutation.isLoading,
    error: clientsQuery.error || addClientMutation.error,
    isError: clientsQuery.isError || addClientMutation.isError,
  };
};