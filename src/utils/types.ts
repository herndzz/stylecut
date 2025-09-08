export type Client = {
  id: number | string;
  name: string;
  phone?: string;
};

export type Professional = {
  id: number | string;
  name: string;
  phone?: string;
};

export type Service = {
  id: number | string;
  name: string;
  price: number; // currency in BRL
  duration: number; // minutes
};

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export type Appointment = {
  id: number | string;
  clientId: Client['id'];
  professionalId: Professional['id'];
  serviceId: Service['id'];
  startAt: string; // ISO 8601
  status: AppointmentStatus;
  // Optional denormalized data
  client?: { id: Client['id']; name: string };
  professional?: { id: Professional['id']; name: string };
  service?: { id: Service['id']; name: string };
};
