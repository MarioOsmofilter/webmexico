import { z } from "zod"

// Validador de email
export const emailSchema = z
  .string()
  .email("Email inválido")
  .min(1, "El email es requerido")

// Validador de contraseña
export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial")

// Validador de teléfono español
export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{8}$/, "Teléfono español inválido (debe ser 9 dígitos comenzando por 6-9)")
  .or(z.string().length(0))
  .optional()

// Validador de DNI/NIE español
export const dniSchema = z
  .string()
  .regex(/^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$/, "DNI/NIE inválido")
  .optional()

// Validador de CIF español
export const cifSchema = z
  .string()
  .regex(/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/, "CIF inválido")
  .optional()

// Schema de login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es requerida"),
})

// Schema de cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

// Schema de usuario
export const userSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "Los apellidos son requeridos"),
  phone: phoneSchema,
  role: z.enum([
    "SUPERADMIN",
    "ADMIN",
    "DIRECTOR_SALES",
    "DIRECTOR_INSTALLATIONS",
    "DIRECTOR_MARKETING",
    "SALES",
    "TECHNICIAN",
    "MARKETING",
    "WAREHOUSE",
    "CUSTOM"
  ]),
})

// Schema de empresa
export const companySchema = z.object({
  name: z.string().min(1, "El nombre de la empresa es requerido"),
  slug: z.string().min(1, "El slug es requerido").regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  subdomain: z.string().min(1, "El subdominio es requerido").regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones").optional(),
})

// Schema de producto
export const productSchema = z.object({
  name: z.string().min(1, "El nombre del producto es requerido"),
  description: z.string().optional(),
  internalReference: z.string().optional(),
  manufacturerReference: z.string().optional(),
  basePrice: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  categoryId: z.string().optional(),
})

// Schema de lead
export const leadSchema = z.object({
  contactName: z.string().min(1, "El nombre de contacto es requerido"),
  email: emailSchema.optional().or(z.literal("")),
  phone: z.string().min(1, "El teléfono es requerido"),
  contactType: z.enum(["INDIVIDUAL", "BUSINESS"]),
  businessName: z.string().optional(),
  businessContact: z.string().optional(),
  businessEmail: emailSchema.optional().or(z.literal("")),
  businessPhone: phoneSchema,
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
})

// Schema de propuesta
export const proposalSchema = z.object({
  leadId: z.string().optional(),
  clientId: z.string().optional(),
  paymentType: z.enum(["SALE", "RENTAL"]),
  installments: z.number().min(1).max(60),
  validUntil: z.date().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    discountPercent: z.number().min(0).max(100).optional(),
  })).min(1, "Debe agregar al menos un producto"),
})

// Schema de instalación
export const installationSchema = z.object({
  saleId: z.string(),
  clientId: z.string(),
  assignedToUserId: z.string(),
  scheduledDate: z.date(),
  notes: z.string().optional(),
})

// Schema de mantenimiento
export const maintenanceSchema = z.object({
  clientId: z.string(),
  installationId: z.string().optional(),
  maintenanceType: z.enum(["PERIODIC", "INCIDENT", "EMERGENCY"]),
  assignedToUserId: z.string(),
  scheduledDate: z.date(),
  notes: z.string().optional(),
})

// Tipos TypeScript derivados de schemas
export type LoginInput = z.infer<typeof loginSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UserInput = z.infer<typeof userSchema>
export type CompanyInput = z.infer<typeof companySchema>
export type ProductInput = z.infer<typeof productSchema>
export type LeadInput = z.infer<typeof leadSchema>
export type ProposalInput = z.infer<typeof proposalSchema>
export type InstallationInput = z.infer<typeof installationSchema>
export type MaintenanceInput = z.infer<typeof maintenanceSchema>
