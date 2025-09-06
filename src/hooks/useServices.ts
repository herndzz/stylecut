import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { Service } from '../types';
import { offlineService } from '../services/offlineService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useServices = () => {
  const queryClient = useQueryClient();

  const { data: services, isLoading, error } = useQuery<Service[]>('services', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/services`);
      return response.data;
    } catch (error) {
      return offlineService.getServices();
    }
  });

  const addServiceMutation = useMutation(
    async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await axios.post(`${API_URL}/api/services`, serviceData);
        return response.data;
      } catch (error) {
        return await offlineService.addService(serviceData);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
      },
    }
  );

  const updateServiceMutation = useMutation(
    async ({ id, data }: { id: string; data: Partial<Service> }) => {
      try {
        const response = await axios.put(`${API_URL}/api/services/${id}`, data);
        return response.data;
      } catch (error) {
        throw new Error('Falha ao atualizar serviço');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
      },
    }
  );

  const deleteServiceMutation = useMutation(
    async (id: string) => {
      try {
        await axios.delete(`${API_URL}/api/services/${id}`);
      } catch (error) {
        throw new Error('Falha ao excluir serviço');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
      },
    }
  );

  return {
    services,
    isLoading,
    error,
    addService: addServiceMutation.mutate,
    updateService: (id: string, data: Partial<Service>) => updateServiceMutation.mutate({ id, data }),
    deleteService: deleteServiceMutation.mutate,
    isAdding: addServiceMutation.isLoading,
  };
};