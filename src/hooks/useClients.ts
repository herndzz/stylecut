import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Client } from '../types';
import { offlineService } from '../services/offlineService';
import axios, { AxiosError } from 'axios';

// Tipo para o retorno da função
interface UseClientsReturn {
  clients: Client[];
  isLoading: boolean;
  addClient: (data: ClientInput) => void;
  isAdding: boolean;
  searchByPhone: (phone: string) => Promise<Client | undefined>;
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
      console.log('Falha na comunicação com o servidor, usando dados offline');
      // Usa serviço offline apenas em caso de erro de rede
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
    isAdding: addClientMutation.isLoading,
    searchByPhone,
    error: clientsQuery.error || addClientMutation.error,
    isError: clientsQuery.isError || addClientMutation.isError,
  };
};