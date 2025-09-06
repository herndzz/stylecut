import { Client, Service, Professional, Appointment } from '../types';
import { v4 as uuidv4 } from 'uuid';

class OfflineService {
  private readonly STORAGE_KEYS = {
    clients: 'stylecut_clients',
    services: 'stylecut_services',
    professionals: 'stylecut_professionals',
    appointments: 'stylecut_appointments',
  };

  // Clientes
  getClients(): Client[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.clients);
    return data ? JSON.parse(data) : [];
  }

  async addClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const clients = this.getClients();
    const newClient: Client = {
      ...clientData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    clients.push(newClient);
    localStorage.setItem(this.STORAGE_KEYS.clients, JSON.stringify(clients));
    return newClient;
  }

  async searchClientByPhone(phone: string): Promise<Client | undefined> {
    const clients = this.getClients();
    return clients.find(client => client.phone === phone);
  }

  // Serviços
  getServices(): Service[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.services);
    return data ? JSON.parse(data) : [];
  }

  async addService(serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const services = this.getServices();
    const newService: Service = {
      ...serviceData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    services.push(newService);
    localStorage.setItem(this.STORAGE_KEYS.services, JSON.stringify(services));
    return newService;
  }

  // Profissionais
  getProfessionals(): Professional[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.professionals);
    return data ? JSON.parse(data) : [];
  }

  async addProfessional(professionalData: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>): Promise<Professional> {
    const professionals = this.getProfessionals();
    const newProfessional: Professional = {
      ...professionalData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    professionals.push(newProfessional);
    localStorage.setItem(this.STORAGE_KEYS.professionals, JSON.stringify(professionals));
    return newProfessional;
  }

  // Agendamentos
  getAppointments(): Appointment[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.appointments);
    return data ? JSON.parse(data) : [];
  }

  async addAppointment(appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const appointments = this.getAppointments();
    
    // Verificar conflitos
    const hasConflict = appointments.some(apt => 
      apt.professionalId === appointmentData.professionalId &&
      apt.date === appointmentData.date &&
      apt.time === appointmentData.time &&
      apt.status !== 'cancelled'
    );

    if (hasConflict) {
      throw new Error('Já existe um agendamento para este profissional neste horário');
    }

    const newAppointment: Appointment = {
      ...appointmentData,
      id: uuidv4(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    appointments.push(newAppointment);
    localStorage.setItem(this.STORAGE_KEYS.appointments, JSON.stringify(appointments));
    return newAppointment;
  }
}

export const offlineService = new OfflineService();