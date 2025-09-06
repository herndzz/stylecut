import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Service } from '../types';
import { offlineService } from '../services/offlineService';
import axios, { AxiosError } from 'axios';

// Tipo para o retorno da função
interface UseServicesReturn {
  services: Service[];
  isLoading: boolean;
  addService: (data: ServiceInput) => void;
  updateService: (id: string, data: ServiceInput) => void;
  deleteService: (id: string) => void;
  isAdding: boolean;
  error: Error | null;
  isError: boolean;
}

// Tipo para os dados de entrada de um novo serviço
type ServiceInput = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;

const LOCAL_STORAGE_KEY = 'services';

const getServicesFromLocalStorage = (): Service[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveServicesToLocalStorage = (services: Service[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(services));
};

export const useServices = (): UseServicesReturn => {
  const queryClient = useQueryClient();

  const servicesQuery = useQuery<Service[], Error>('services', async () => {
    try {
      return getServicesFromLocalStorage();
    } catch (error) {
      console.error("Erro ao carregar serviços do armazenamento local:", error);
      throw error;
    }
  });

  const addServiceMutation = useMutation<
    Service,
    Error,
    ServiceInput
  >(
    async (serviceData) => {
      const services = getServicesFromLocalStorage();
      const newService = { ...serviceData, id: Date.now().toString() };
      const updatedServices = [...services, newService];
      saveServicesToLocalStorage(updatedServices);
      return newService;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
      },
    }
  );

  const updateServiceMutation = useMutation<void, Error, { id: string; data: ServiceInput }>(
    async ({ id, data }) => {
      const services = getServicesFromLocalStorage();
      const updatedServices = services.map((service) =>
        service.id === id ? { ...service, ...data } : service
      );
      saveServicesToLocalStorage(updatedServices);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
      },
    }
  );

  const deleteServiceMutation = useMutation<void, Error, string>(
    async (id) => {
      try {
        const services = getServicesFromLocalStorage();
        const updatedServices = services.filter((service) => service.id !== id);
        saveServicesToLocalStorage(updatedServices);
      } catch (error) {
        console.error(`Erro ao excluir serviço com ID ${id}:`, error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
      },
    }
  );

  return {
    services: servicesQuery.data || [],
    isLoading: servicesQuery.isLoading,
    addService: addServiceMutation.mutate,
    updateService: (id, data) => updateServiceMutation.mutate({ id, data }),
    deleteService: (id) => deleteServiceMutation.mutate(id),
    isAdding: addServiceMutation.isLoading,
    error: servicesQuery.error || addServiceMutation.error,
    isError: servicesQuery.isError || addServiceMutation.isError,
  };
};