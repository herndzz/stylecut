export type ID = string;

export interface Client { id: ID; name: string; email?: string; phone?: string; created_at?: string; updated_at?: string }
export interface Professional { id: ID; name: string; email?: string; phone?: string; created_at?: string; updated_at?: string }
export interface Service { id: ID; name: string; duration_minutes: number; price_cents: number; description?: string; created_at?: string; updated_at?: string }
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';
export interface Appointment {
  id: ID;
  client_id: ID;
  professional_id: ID;
  service_id: ID;
  start_time: string;
  status: AppointmentStatus;
  client_name?: string;
  professional_name?: string;
  service_name?: string;
  duration_minutes?: number;
  price_cents?: number;
}
