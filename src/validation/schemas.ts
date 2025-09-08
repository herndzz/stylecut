import { z } from 'zod';

export const ClientFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('').transform(() => undefined)),
  phone: z
    .string()
    .regex(/^[0-9()+\-\s]{8,20}$/i, 'Telefone inválido')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
export type ClientForm = z.infer<typeof ClientFormSchema>;

export const ProfessionalFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('').transform(() => undefined)),
  phone: z
    .string()
    .regex(/^[0-9()+\-\s]{8,20}$/i, 'Telefone inválido')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
export type ProfessionalForm = z.infer<typeof ProfessionalFormSchema>;

export const ServiceFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  duration_minutes: z
    .number({ invalid_type_error: 'Duração deve ser um número' })
    .int('Duração deve ser inteira')
    .positive('Duração deve ser maior que 0'),
  price_cents: z
    .number({ invalid_type_error: 'Preço deve ser um número' })
    .int('Preço deve ser inteiro (centavos)')
    .min(0, 'Preço deve ser >= 0'),
  description: z.string().optional().or(z.literal('').transform(() => undefined)),
});
export type ServiceForm = z.infer<typeof ServiceFormSchema>;

export const AppointmentFormSchema = z.object({
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  professional_id: z.string().min(1, 'Profissional é obrigatório'),
  service_id: z.string().min(1, 'Serviço é obrigatório'),
  start_time: z.string().min(1, 'Início é obrigatório'), // convertido para ISO no submit
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
});
export type AppointmentForm = z.infer<typeof AppointmentFormSchema>;
