import { z } from "zod";

/**
 * Schemas Zod para validação do módulo Company Employees
 */

// Schema para criação de funcionário
export const createCompanyEmployeeSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  specialties: z.array(z.string()).default([]),
});

// Schema para atualização de funcionário
export const updateCompanyEmployeeSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Schema para parâmetros de ID
export const companyEmployeeIdSchema = z.object({
  id: z.string().min(1, "ID inválido"),
});

// Schema para query de listagem
export const listCompanyEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

// Schema para agendamento de funcionário
export const createCompanyEmployeeAppointmentSchema = z.object({
  employeeId: z.string().min(1, "ID do funcionário é obrigatório"),
  clientId: z.string().min(1, "ID do cliente é obrigatório"),
  serviceId: z.string().min(1, "ID do serviço é obrigatório"),
  scheduledDate: z.string().datetime("Data inválida"),
  locationType: z.enum(["AT_LOCATION", "AT_DOMICILE", "BOTH"]),
  clientAddress: z.string().optional(),
  clientNotes: z.string().optional(),
});

// Schema para atualização de agendamento
export const updateCompanyEmployeeAppointmentSchema = z.object({
  scheduledDate: z.string().datetime("Data inválida").optional(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"]).optional(),
  locationType: z.enum(["AT_LOCATION", "AT_DOMICILE", "BOTH"]).optional(),
  clientAddress: z.string().optional(),
  clientNotes: z.string().optional(),
});

// Schema para review de funcionário
export const createCompanyEmployeeReviewSchema = z.object({
  appointmentId: z.string().min(1, "ID do agendamento é obrigatório"),
  rating: z.number().int().min(1, "Rating deve ser pelo menos 1").max(5, "Rating deve ser no máximo 5"),
  comment: z.string().optional(),
});

// Tipos inferidos dos schemas
export type CreateCompanyEmployeeInput = z.infer<typeof createCompanyEmployeeSchema>;
export type UpdateCompanyEmployeeInput = z.infer<typeof updateCompanyEmployeeSchema>;
export type CompanyEmployeeIdParams = z.infer<typeof companyEmployeeIdSchema>;
export type ListCompanyEmployeesQuery = z.infer<typeof listCompanyEmployeesQuerySchema>;
export type CreateCompanyEmployeeAppointmentInput = z.infer<typeof createCompanyEmployeeAppointmentSchema>;
export type UpdateCompanyEmployeeAppointmentInput = z.infer<typeof updateCompanyEmployeeAppointmentSchema>;
export type CreateCompanyEmployeeReviewInput = z.infer<typeof createCompanyEmployeeReviewSchema>;
