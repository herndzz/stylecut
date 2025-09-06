import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { Professional } from '../types';
import { offlineService } from '../services/offlineService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useProfessionals = () => {
  const queryClient = useQueryClient();

  const { data: professionals, isLoading, error } = useQuery<Professional[]>(
    'professionals',
    async () => {
      try {
        const response = await axios.get(`${API_URL}/api/professionals`);
        return response.data;
      } catch (error) {
        console.log('Falha na comunicação com o servidor, usando dados offline');
        return offlineService.getProfessionals();
      }
    }
  );

  const addProfessionalMutation = useMutation(
    async (professionalData: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await axios.post(`${API_URL}/api/professionals`, professionalData);
        return response.data;
      } catch (error) {
        console.log('Profissional salvo offline');
        return await offlineService.addProfessional(professionalData);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('professionals');
      },
    }
  );

  const updateProfessionalMutation = useMutation(
    async ({ id, data }: { id: string; data: Partial<Professional> }) => {
      try {
        const response = await axios.put(`${API_URL}/api/professionals/${id}`, data);
        return response.data;
      } catch (error) {
        throw new Error('Falha ao atualizar profissional');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('professionals');
      },
    }
  );

  const deleteProfessionalMutation = useMutation(
    async (id: string) => {
      try {
        await axios.delete(`${API_URL}/api/professionals/${id}`);
      } catch (error) {
        throw new Error('Falha ao excluir profissional');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('professionals');
      },
    }
  );

  return {
    professionals,
    isLoading,
    error,
    addProfessional: addProfessionalMutation.mutate,
    updateProfessional: (id: string, data: Partial<Professional>) => updateProfessionalMutation.mutate({ id, data }),
    deleteProfessional: deleteProfessionalMutation.mutate,
    isAdding: addProfessionalMutation.isLoading,
  };
};