import { z } from 'zod';

export const contactRoles = [
  'wlasciciel',
  'kupiec',
  'architekt',
  'projektant',
  'project_manager',
  'techniczny',
  'finanse',
  'montaz',
  'inna',
] as const;

export const contactConsents = ['zgoda', 'brak_danych', 'zakaz'] as const;

export const contactSchema = z.object({
  company_id: z.string().uuid('Wybierz firmę'),
  first_name: z.string().trim().optional().or(z.literal('')),
  last_name: z.string().trim().optional().or(z.literal('')),
  position: z.string().trim().optional().or(z.literal('')),
  role: z.enum(contactRoles).optional().nullable(),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || z.string().email().safeParse(v).success, 'Nieprawidłowy e-mail'),
  phone: z.string().trim().optional().or(z.literal('')),
  language: z.string().trim().optional().or(z.literal('')),
  contact_consent: z.enum(contactConsents).default('brak_danych'),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
