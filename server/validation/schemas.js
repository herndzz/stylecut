const { z } = require('zod');

const id = z.string().uuid().optional();

const clientSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email('invalid email').optional(),
  phone: z.string().regex(/^[0-9()+\-\s]{8,20}$/).optional(),
});

const professionalSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email('invalid email').optional(),
  phone: z.string().regex(/^[0-9()+\-\s]{8,20}$/).optional(),
});

const serviceSchema = z.object({
  name: z.string().min(1, 'name is required'),
  duration_minutes: z.number().int().positive(),
  price_cents: z.number().int().min(0),
  description: z.string().optional(),
});

const appointmentCreateSchema = z.object({
  client_id: z.string().uuid(),
  professional_id: z.string().uuid(),
  service_id: z.string().uuid(),
  start_time: z.string().min(1),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

const appointmentUpdateSchema = appointmentCreateSchema.partial();

module.exports = {
  clientSchema,
  professionalSchema,
  serviceSchema,
  appointmentCreateSchema,
  appointmentUpdateSchema,
};
