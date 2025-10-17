import { z } from 'zod'

export const leadFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  phone: z.string()
    .regex(/^(\+27|0)[0-9]{9}$/, 'Please enter a valid South African phone number (e.g., 0821234567 or +27821234567)')
    .transform(val => {
      // Normalize phone numbers to +27 format
      if (val.startsWith('0')) {
        return '+27' + val.slice(1)
      }
      return val
    }),
  
  vehicleMake: z.string()
    .min(1, 'Please select a vehicle make')
})

export type LeadFormData = z.infer<typeof leadFormSchema>