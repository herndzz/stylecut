import { Client, Professional, Service, Appointment } from '../types';

// Interface para operações pendentes de sincronização
interface PendingSyncOperation {
  type: 'CREATE_CLIENT' | 'CREATE_PROFESSIONAL' | 'CREATE_SERVICE' | 'CREATE_APPOINTMENT';
  data: any;
  timestamp: string;
}

class OfflineService {
  private storageKeys = {
    clients: 'stylecut_clients',
    professionals: 'stylecut_professionals',
    services: 'stylecut_services',
    appointments: 'stylecut_appointments',
    pendingSync: 'stylecut_pending_sync',
  };

  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Erro ao ler do localStorage: ${error}`);
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Erro ao salvar no localStorage: ${error}`);
      // Poderia adicionar notificação ao usuário sobre falha de armazenamento
    }
  }

  private addToPendingSync(operation: Omit<PendingSyncOperation, 'timestamp'>): void {
    const pending = this.getFromStorage<PendingSyncOperation>(this.storageKeys.pendingSync);
    pending.push({ ...operation, timestamp: new Date().toISOString() });
    this.saveToStorage(this.storageKeys.pendingSync, pending);
  }

  getClients(): Client[] {
    return this.getFromStorage<Client>(this.storageKeys.clients);
  }

  addClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
    const clients = this.getClients();
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    clients.push(newClient);
    this.saveToStorage(this.storageKeys.clients, clients);
    this.addToPendingSync({ type: 'CREATE_CLIENT', data: newClient });
    return newClient;
  }

  searchClientByPhone(phone: string): Client | undefined {
    const clients = this.getClients();
    const formattedPhone = phone.replace(/\D/g, ''); // Remove caracteres não numéricos
    return clients.find(client => client.phone.replace(/\D/g, '').includes(formattedPhone));
  }

  getProfessionals(): Professional[] {
    return this.getFromStorage<Professional>(this.storageKeys.professionals);
  }

  addProfessional(professional: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>): Professional {
    const professionals = this.getProfessionals();
    const newProfessional: Professional = {
      ...professional,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    professionals.push(newProfessional);
    this.saveToStorage(this.storageKeys.professionals, professionals);
    this.addToPendingSync({ type: 'CREATE_PROFESSIONAL', data: newProfessional });
    return newProfessional;
  }

  getServices(): Service[] {
    return this.getFromStorage<Service>(this.storageKeys.services);
  }

  addService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Service {
    const services = this.getServices();
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    services.push(newService);
    this.saveToStorage(this.storageKeys.services, services);
    this.addToPendingSync({ type: 'CREATE_SERVICE', data: newService });
    return newService;
  }

  getAppointments(): Appointment[] {
    return this.getFromStorage<Appointment>(this.storageKeys.appointments);
  }

  addAppointment(appointment: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Appointment {
    const appointments = this.getAppointments();
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const hasConflict = appointments.some(apt => 
      apt.professionalId === newAppointment.professionalId &&
      apt.date === newAppointment.date &&
      apt.time === newAppointment.time &&
      apt.status !== 'cancelled'
    );

    if (hasConflict) {
      throw new Error('Já existe um agendamento para este horário');
    }

    appointments.push(newAppointment);
    this.saveToStorage(this.storageKeys.appointments, appointments);
    this.addToPendingSync({ type: 'CREATE_APPOINTMENT', data: newAppointment });
    return newAppointment;
  }

  getPendingSync(): PendingSyncOperation[] {
    return this.getFromStorage<PendingSyncOperation>(this.storageKeys.pendingSync);
  }

  clearPendingSync(): void {
    this.saveToStorage(this.storageKeys.pendingSync, []);
  }
}

// Exporta uma instância única do serviço
export const offlineService = new OfflineService();