import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (99) 99999-9999"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

export const professionalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (99) 99999-9999"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  services: z.array(z.string()).min(1, "Selecione pelo menos um serviço"),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.number().min(0.01, "Preço deve ser maior que zero"),
  duration: z.number().min(15, "Duração mínima de 15 minutos"),
});

export const appointmentSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  professionalId: z.string().min(1, "Profissional é obrigatório"),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
});
