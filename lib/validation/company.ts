import { z } from 'zod';

export const companySegments = [
  'hotel',
  'restauracja',
  'biuro',
  'retail',
  'architekt',
  'marka_meblowa',
  'generalny_wykonawca',
  'inne',
] as const;

export const relationshipStatuses = ['nowy', 'aktywny', 'uspiony', 'zakonczony'] as const;

export const companySchema = z.object({
  name: z.string().trim().min(1, 'Nazwa firmy jest wymagana'),
  country: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().optional().or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
  tax_id: z.string().trim().optional().or(z.literal('')),
  website: z.string().trim().optional().or(z.literal('')),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || z.string().email().safeParse(v).success, 'Nieprawidłowy e-mail'),
  phone: z.string().trim().optional().or(z.literal('')),
  segment: z.enum(companySegments).optional().nullable(),
  note: z.string().trim().optional().or(z.literal('')),
  relationship_status: z.enum(relationshipStatuses).default('nowy'),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
