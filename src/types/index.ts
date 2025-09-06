export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // em minutos
  createdAt?: string;
  updatedAt?: string;
}

export interface Professional {
  id: string;
  name: string;
  phone: string;
  email?: string;
  services: string[]; // IDs dos serviços que o profissional oferece
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: string; // formato YYYY-MM-DD
  time: string; // formato HH:MM
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface OfflineData {
  clients: Client[];
  professionals: Professional[];
  services: Service[];
  appointments: Appointment[];
  lastSync?: string;
}
