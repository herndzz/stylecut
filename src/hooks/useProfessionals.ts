import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Professional } from '../types';
import { offlineService } from '../services/offlineService';
import axios, { AxiosError } from 'axios';

// Tipo para o retorno da função
interface UseProfessionalsReturn {
  professionals: Professional[];
  isLoading: boolean;
  addProfessional: (data: ProfessionalInput) => void;
  updateProfessional: (id: string, data: ProfessionalInput) => void;
  deleteProfessional: (id: string) => void;
  isAdding: boolean;
  error: Error | null;
  isError: boolean;
}

// Tipo para os dados de entrada de um novo profissional
type ProfessionalInput = Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>;

export const useProfessionals = (): UseProfessionalsReturn => {
  const queryClient = useQueryClient();

  const professionalsQuery = useQuery<Professional[], Error>('professionals', async () => {
    try {
      const response = await axios.get('/api/professionals');
      return response.data;
    } catch (error) {
      console.log('Falha na comunicação com o servidor, usando dados offline');
      // Usa serviço offline apenas em caso de erro de rede
      return offlineService.getProfessionals();
    }
  });

  const addProfessionalMutation = useMutation<
    Professional,
    Error,
    ProfessionalInput
  >(
    async (professionalData) => {
      try {
        const response = await axios.post('/api/professionals', professionalData);
        return response.data;
      } catch (error) {
        if ((error as AxiosError).isAxiosError) {
          // Se for um erro do Axios, tentamos salvar offline e notificamos
          const result = await offlineService.addProfessional(professionalData);
          console.log('Profissional salvo offline');
          return result;
        }
        throw error; // Se for outro tipo de erro, propagamos
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('professionals');
      },
      onError: (error) => {
        const errorMessage = error instanceof AxiosError 
          ? error.response?.data?.message || 'Erro ao criar profissional'
          : 'Erro ao criar profissional';
        console.error(errorMessage);
      },
    }
  );

  const updateProfessionalMutation = useMutation<void, Error, { id: string; data: ProfessionalInput }>(
    async ({ id, data }) => {
      await axios.put(`/api/professionals/${id}`, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('professionals');
      },
    }
  );

  const deleteProfessionalMutation = useMutation<void, Error, string>(
    async (id) => {
      await axios.delete(`/api/professionals/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('professionals');
      },
    }
  );

  return {
    professionals: professionalsQuery.data || [],
    isLoading: professionalsQuery.isLoading,
    addProfessional: addProfessionalMutation.mutate,
    updateProfessional: (id, data) => updateProfessionalMutation.mutate({ id, data }),
    deleteProfessional: (id) => deleteProfessionalMutation.mutate(id),
    isAdding: addProfessionalMutation.isLoading,
    error: professionalsQuery.error || addProfessionalMutation.error,
    isError: professionalsQuery.isError || addProfessionalMutation.isError,
  };
};