/**
 * Interfaces de Repositório
 *
 * Seguindo os princípios SOLID:
 * - I: Interface Segregation Principle
 * - D: Dependency Inversion Principle
 */

import {
  IUser,
  IClientProfile,
  IProfessionalProfile,
  ICompanyProfile,
  ICompanyEmployee,
} from "./user.interface";

// ========================================
// REPOSITORY INTERFACES
// ========================================

export interface IUserRepository {
  // Métodos básicos
  create(data: CreateUserData): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  update(id: string, data: UpdateUserData): Promise<IUser>;
  delete(id: string): Promise<void>;

  // Métodos de busca
  findByUserType(userType: string): Promise<IUser[]>;
  findMany(filters: UserFilters): Promise<PaginatedResult<IUser>>;
  exists(id: string): Promise<boolean>;

  // Métodos de perfil
  createClientProfile(data: CreateClientProfileData): Promise<IClientProfile>;
  createProfessionalProfile(
    data: CreateProfessionalProfileData
  ): Promise<IProfessionalProfile>;
  createCompanyProfile(
    data: CreateCompanyProfileData
  ): Promise<ICompanyProfile>;

  // Métodos de atualização de perfil
  updateClientProfile(
    userId: string,
    data: UpdateClientProfileData
  ): Promise<IClientProfile>;
  updateProfessionalProfile(
    userId: string,
    data: UpdateProfessionalProfileData
  ): Promise<IProfessionalProfile>;
  updateCompanyProfile(
    userId: string,
    data: UpdateCompanyProfileData
  ): Promise<ICompanyProfile>;
}

export interface IClientProfileRepository {
  // Métodos básicos
  create(data: CreateClientProfileData): Promise<IClientProfile>;
  findByUserId(userId: string): Promise<IClientProfile | null>;
  update(
    userId: string,
    data: UpdateClientProfileData
  ): Promise<IClientProfile>;
  delete(userId: string): Promise<void>;

  // Métodos específicos
  addAddress(userId: string, address: Address): Promise<void>;
  removeAddress(userId: string, addressId: string): Promise<void>;
  addPaymentMethod(userId: string, method: PaymentMethod): Promise<void>;
  removePaymentMethod(userId: string, methodId: string): Promise<void>;
  addFavoriteService(userId: string, serviceId: string): Promise<void>;
  removeFavoriteService(userId: string, serviceId: string): Promise<void>;
}

export interface IProfessionalProfileRepository {
  // Métodos básicos
  create(data: CreateProfessionalProfileData): Promise<IProfessionalProfile>;
  findByUserId(userId: string): Promise<IProfessionalProfile | null>;
  update(
    userId: string,
    data: UpdateProfessionalProfileData
  ): Promise<IProfessionalProfile>;
  delete(userId: string): Promise<void>;

  // Métodos específicos
  addSpecialty(userId: string, specialty: string): Promise<void>;
  removeSpecialty(userId: string, specialty: string): Promise<void>;
  addCertification(userId: string, certification: Certification): Promise<void>;
  removeCertification(userId: string, certificationId: string): Promise<void>;
  updateRating(userId: string, rating: number): Promise<void>;
  findAvailableProfessionals(
    filters: ProfessionalFilters
  ): Promise<IProfessionalProfile[]>;
}

export interface ICompanyProfileRepository {
  // Métodos básicos
  create(data: CreateCompanyProfileData): Promise<ICompanyProfile>;
  findByUserId(userId: string): Promise<ICompanyProfile | null>;
  update(
    userId: string,
    data: UpdateCompanyProfileData
  ): Promise<ICompanyProfile>;
  delete(userId: string): Promise<void>;

  // Métodos específicos
  addPhoto(userId: string, photoUrl: string): Promise<void>;
  removePhoto(userId: string, photoUrl: string): Promise<void>;
  updateBusinessHours(userId: string, hours: BusinessHours): Promise<void>;
  findAvailableCompanies(filters: CompanyFilters): Promise<ICompanyProfile[]>;
}

export interface ICompanyEmployeeRepository {
  // Métodos básicos
  create(data: CreateCompanyEmployeeData): Promise<ICompanyEmployee>;
  findById(id: string): Promise<ICompanyEmployee | null>;
  findByCompanyId(companyId: string): Promise<ICompanyEmployee[]>;
  update(
    id: string,
    data: UpdateCompanyEmployeeData
  ): Promise<ICompanyEmployee>;
  delete(id: string): Promise<void>;

  // Métodos específicos
  updateSpecialties(id: string, specialties: string[]): Promise<void>;
  updateWorkingHours(id: string, hours: WorkingHours): Promise<void>;
  findAvailableEmployees(
    companyId: string,
    date: Date,
    time: string
  ): Promise<ICompanyEmployee[]>;
}

// ========================================
// SERVICE INTERFACES
// ========================================

export interface IUserService {
  // Métodos básicos
  createUser(data: CreateUserData): Promise<IUser>;
  getUserById(id: string): Promise<IUser>;
  updateUser(id: string, data: UpdateUserData): Promise<IUser>;
  deleteUser(id: string): Promise<void>;

  // Métodos de perfil
  createClientProfile(
    userId: string,
    data: CreateClientProfileData
  ): Promise<IClientProfile>;
  createProfessionalProfile(
    userId: string,
    data: CreateProfessionalProfileData
  ): Promise<IProfessionalProfile>;
  createCompanyProfile(
    userId: string,
    data: CreateCompanyProfileData
  ): Promise<ICompanyProfile>;

  // Métodos de busca
  findUsersByType(userType: string): Promise<IUser[]>;
  searchUsers(filters: UserFilters): Promise<PaginatedResult<IUser>>;

  // Métodos de validação
  validateUserCreation(data: CreateUserData): Promise<ValidationResult>;
  validateProfileCreation(
    userId: string,
    profileData: any
  ): Promise<ValidationResult>;
}

export interface IClientProfileService {
  createProfile(
    userId: string,
    data: CreateClientProfileData
  ): Promise<IClientProfile>;
  getProfile(userId: string): Promise<IClientProfile>;
  updateProfile(
    userId: string,
    data: UpdateClientProfileData
  ): Promise<IClientProfile>;
  deleteProfile(userId: string): Promise<void>;

  // Métodos específicos
  addAddress(userId: string, address: Address): Promise<void>;
  removeAddress(userId: string, addressId: string): Promise<void>;
  addPaymentMethod(userId: string, method: PaymentMethod): Promise<void>;
  removePaymentMethod(userId: string, methodId: string): Promise<void>;
  addFavoriteService(userId: string, serviceId: string): Promise<void>;
  removeFavoriteService(userId: string, serviceId: string): Promise<void>;
}

export interface IProfessionalProfileService {
  createProfile(
    userId: string,
    data: CreateProfessionalProfileData
  ): Promise<IProfessionalProfile>;
  getProfile(userId: string): Promise<IProfessionalProfile>;
  updateProfile(
    userId: string,
    data: UpdateProfessionalProfileData
  ): Promise<IProfessionalProfile>;
  deleteProfile(userId: string): Promise<void>;

  // Métodos específicos
  addSpecialty(userId: string, specialty: string): Promise<void>;
  removeSpecialty(userId: string, specialty: string): Promise<void>;
  addCertification(userId: string, certification: Certification): Promise<void>;
  removeCertification(userId: string, certificationId: string): Promise<void>;
  updateRating(userId: string, rating: number): Promise<void>;
  findAvailableProfessionals(
    filters: ProfessionalFilters
  ): Promise<IProfessionalProfile[]>;
}

export interface ICompanyProfileService {
  createProfile(
    userId: string,
    data: CreateCompanyProfileData
  ): Promise<ICompanyProfile>;
  getProfile(userId: string): Promise<ICompanyProfile>;
  updateProfile(
    userId: string,
    data: UpdateCompanyProfileData
  ): Promise<ICompanyProfile>;
  deleteProfile(userId: string): Promise<void>;

  // Métodos específicos
  addPhoto(userId: string, photoUrl: string): Promise<void>;
  removePhoto(userId: string, photoUrl: string): Promise<void>;
  updateBusinessHours(userId: string, hours: BusinessHours): Promise<void>;
  findAvailableCompanies(filters: CompanyFilters): Promise<ICompanyProfile[]>;
}

export interface ICompanyEmployeeService {
  createEmployee(
    companyId: string,
    data: CreateCompanyEmployeeData
  ): Promise<ICompanyEmployee>;
  getEmployeeById(id: string): Promise<ICompanyEmployee>;
  getEmployeesByCompany(companyId: string): Promise<ICompanyEmployee[]>;
  updateEmployee(
    id: string,
    data: UpdateCompanyEmployeeData
  ): Promise<ICompanyEmployee>;
  deleteEmployee(id: string): Promise<void>;

  // Métodos específicos
  updateSpecialties(id: string, specialties: string[]): Promise<void>;
  updateWorkingHours(id: string, hours: WorkingHours): Promise<void>;
  findAvailableEmployees(
    companyId: string,
    date: Date,
    time: string
  ): Promise<ICompanyEmployee[]>;
}

// ========================================
// TYPES E INTERFACES AUXILIARES
// ========================================

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserFilters {
  userType?: string;
  city?: string;
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProfessionalFilters {
  specialties?: string[];
  city?: string;
  serviceMode?: string;
  isAvailable?: boolean;
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CompanyFilters {
  city?: string;
  services?: string[];
  isAvailable?: boolean;
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ========================================
// DTOs
// ========================================

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  isEmailVerified?: boolean;
}

export interface CreateClientProfileData {
  cpf: string;
  addresses: Address[];
  paymentMethods?: PaymentMethod[];
  preferences?: ClientPreferences;
}

export interface UpdateClientProfileData {
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
  preferences?: ClientPreferences;
}

export interface CreateProfessionalProfileData {
  cpf?: string;
  cnpj?: string;
  address: string;
  city: string;
  serviceMode: string;
  workingHours: WorkingHours;
  specialties: string[];
  certifications?: Certification[];
}

export interface UpdateProfessionalProfileData {
  address?: string;
  city?: string;
  serviceMode?: string;
  workingHours?: WorkingHours;
  specialties?: string[];
  certifications?: Certification[];
}

export interface CreateCompanyProfileData {
  cnpj: string;
  address: string;
  city: string;
  businessHours: BusinessHours;
  description?: string;
  photos?: string[];
}

export interface UpdateCompanyProfileData {
  address?: string;
  city?: string;
  businessHours?: BusinessHours;
  description?: string;
  photos?: string[];
}

export interface CreateCompanyEmployeeData {
  name: string;
  email?: string;
  phone?: string;
  position: string;
  specialties: string[];
  workingHours?: WorkingHours;
}

export interface UpdateCompanyEmployeeData {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  specialties?: string[];
  workingHours?: WorkingHours;
  isActive?: boolean;
}

// ========================================
// IMPORTS NECESSÁRIOS
// ========================================

import {
  Address,
  PaymentMethod,
  ClientPreferences,
  WorkingHours,
  BusinessHours,
  Certification,
} from "./user.interface";

// ========================================
// APPOINTMENT REPOSITORY INTERFACE
// ========================================

export interface IAppointmentRepository {
  // Métodos básicos
  create(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;

  // Métodos de busca
  findByUserId(userId: string): Promise<any[]>;
  findByProfessionalId(professionalId: string): Promise<any[]>;
  findByCompanyEmployeeId(companyEmployeeId: string): Promise<any[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<any[]>;
  findByStatus(status: string): Promise<any[]>;
  findMany(filters: any): Promise<any[]>;
  count(filters: any): Promise<number>;
}

// ========================================
// OFFERED SERVICE REPOSITORY INTERFACE
// ========================================

export interface IOfferedServiceRepository {
  // Métodos básicos
  create(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;

  // Métodos de busca
  findByUserId(userId: string): Promise<any[]>;
  findByProfessionalId(professionalId: string): Promise<any[]>;
  findByCompanyEmployeeId(companyEmployeeId: string): Promise<any[]>;
  findByCategory(category: string): Promise<any[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<any[]>;
  search(searchTerm: string): Promise<any[]>;
  findMany(filters: any): Promise<any[]>;
  count(filters: any): Promise<number>;
}

// ========================================
// COMPANY EMPLOYEE REVIEW REPOSITORY INTERFACE
// ========================================

export interface ICompanyEmployeeReviewRepository {
  // Métodos básicos
  create(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;

  // Métodos de busca
  findByAppointmentId(appointmentId: string): Promise<any | null>;
  findByEmployeeId(employeeId: string): Promise<any[]>;
  findByReviewerId(reviewerId: string): Promise<any[]>;
  findMany(filters?: any): Promise<any[]>;

  // Métodos de estatísticas
  getAverageRating(employeeId: string): Promise<number>;
  getRatingDistribution(employeeId: string): Promise<any[]>;
  count(filters?: any): Promise<number>;
}
