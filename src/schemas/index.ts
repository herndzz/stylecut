import { z } from 'zod';

// Schema para clientes
export const clientSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  phone: z
    .string()
    .min(10, 'Telefone é obrigatório')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato de telefone inválido'),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
});

// Schema para serviços
export const serviceSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome do serviço deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do serviço deve ter no máximo 100 caracteres'),
  price: z
    .number()
    .min(0.01, 'Preço deve ser maior que zero')
    .max(9999.99, 'Preço deve ser menor que R$ 10.000'),
  duration: z
    .number()
    .min(15, 'Duração mínima é de 15 minutos')
    .max(480, 'Duração máxima é de 8 horas')
    .multipleOf(15, 'Duração deve ser múltipla de 15 minutos'),
});

// Schema para profissionais
export const professionalSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  phone: z
    .string()
    .min(10, 'Telefone é obrigatório')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato de telefone inválido'),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  services: z
    .array(z.string())
    .min(1, 'Selecione pelo menos um serviço'),
});

// Schema para agendamentos
export const appointmentSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  professionalId: z.string().min(1, 'Selecione um profissional'),
  serviceId: z.string().min(1, 'Selecione um serviço'),
  date: z.string().min(1, 'Selecione uma data'),
  time: z.string().min(1, 'Selecione um horário'),
});
