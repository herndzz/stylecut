import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Service } from '../types';
import { offlineService } from '../services/offlineService';
import axios, { AxiosError } from 'axios';

// Tipo para o retorno da função
interface UseServicesReturn {
  services: Service[];
  isLoading: boolean;
  addService: (data: ServiceInput) => void;
  isAdding: boolean;
  error: Error | null;
  isError: boolean;
}

// Tipo para os dados de entrada de um novo serviço
type ServiceInput = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;

export const useServices = (): UseServicesReturn => {
  const queryClient = useQueryClient();

  const servicesQuery = useQuery<Service[], Error>('services', async () => {
    try {
      const response = await axios.get('/api/services');
      return response.data;
    } catch (error) {
      console.log('Falha na comunicação com o servidor, usando dados offline');
      // Usa serviço offline apenas em caso de erro de rede
      return offlineService.getServices();
    }
  });

  const addServiceMutation = useMutation<
    Service,
    Error,
    ServiceInput
  >(
    async (serviceData) => {
      try {
        const response = await axios.post('/api/services', serviceData);
        return response.data;
      } catch (error) {
        if ((error as AxiosError).isAxiosError) {
          // Se for um erro do Axios, tentamos salvar offline e notificamos
          const result = await offlineService.addService(serviceData);
          console.log('Serviço salvo offline');
          return result;
        }
        throw error; // Se for outro tipo de erro, propagamos
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
      },
      onError: (error) => {
        const errorMessage = error instanceof AxiosError 
          ? error.response?.data?.message || 'Erro ao criar serviço'
          : 'Erro ao criar serviço';
        console.error(errorMessage);
      },
    }
  );

  return {
    services: servicesQuery.data || [],
    isLoading: servicesQuery.isLoading,
    addService: addServiceMutation.mutate,
    isAdding: addServiceMutation.isLoading,
    error: servicesQuery.error || addServiceMutation.error,
    isError: servicesQuery.isError || addServiceMutation.isError,
  };
};