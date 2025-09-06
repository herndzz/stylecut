export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Professional {
  id: string;
  name: string;
  phone: string;
  email?: string;
  services: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
