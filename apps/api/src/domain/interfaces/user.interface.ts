/**
 * Interfaces de Domínio - User
 *
 * Seguindo os princípios SOLID:
 * - I: Interface Segregation Principle
 * - D: Dependency Inversion Principle
 */

// ========================================
// ENTIDADES DE DOMÍNIO
// ========================================

export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: UserType;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Métodos de domínio
  canCreateAppointment(): boolean;
  canReceiveAppointments(): boolean;
  getProfileType(): string;
}

export interface IClientProfile {
  userId: string;
  cpf: string;
  addresses: Address[];
  paymentMethods?: PaymentMethod[];
  favoriteServices?: string[];
  preferences?: ClientPreferences;

  // Métodos de domínio
  addAddress(address: Address): void;
  removeAddress(addressId: string): void;
  addPaymentMethod(method: PaymentMethod): void;
  addFavoriteService(serviceId: string): void;
  removeFavoriteService(serviceId: string): void;
}

export interface IProfessionalProfile {
  userId: string;
  cpf?: string;
  cnpj?: string;
  address: string;
  city: string;
  serviceMode: ServiceMode;
  workingHours: WorkingHours;
  specialties: string[];
  certifications: Certification[];
  portfolio: string[];
  averageRating: number;
  totalRatings: number;
  isActive: boolean;
  isVerified: boolean;

  // Métodos de domínio
  addSpecialty(specialty: string): void;
  removeSpecialty(specialty: string): void;
  addCertification(certification: Certification): void;
  updateRating(rating: number): void;
  isAvailable(date: Date, time: string): boolean;
}

export interface ICompanyProfile {
  userId: string;
  cnpj: string;
  address: string;
  city: string;
  businessHours: BusinessHours;
  description?: string;
  photos: string[];
  averageRating: number;
  totalRatings: number;
  isActive: boolean;
  isVerified: boolean;

  // Métodos de domínio
  addEmployee(employee: ICompanyEmployee): void;
  removeEmployee(employeeId: string): void;
  updateBusinessHours(hours: BusinessHours): void;
  addPhoto(photoUrl: string): void;
  removePhoto(photoUrl: string): void;
}

export interface ICompanyEmployee {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  specialties: string[];
  isActive: boolean;
  workingHours?: WorkingHours;
  createdAt: Date;
  updatedAt: Date;

  // Métodos de domínio
  updateSpecialties(specialties: string[]): void;
  updateWorkingHours(hours: WorkingHours): void;
  isAvailable(date: Date, time: string): boolean;
}

// ========================================
// VALUE OBJECTS
// ========================================

export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "credit_card" | "debit_card" | "pix" | "bank_transfer";
  name: string;
  isDefault: boolean;
  details?: Record<string, any>;
}

export interface ClientPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  marketing: boolean;
  language: string;
  timezone: string;
}

export interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    isAvailable: boolean;
  };
}

export interface BusinessHours {
  [key: string]: {
    start: string;
    end: string;
    isOpen: boolean;
  };
}

export interface Certification {
  id: string;
  name: string;
  institution: string;
  date: Date;
  documentUrl?: string;
  isVerified: boolean;
}

// ========================================
// ENUMS
// ========================================

export enum UserType {
  CLIENT = "CLIENT",
  PROFESSIONAL = "PROFESSIONAL",
  COMPANY = "COMPANY",
}

export enum ServiceMode {
  AT_LOCATION = "AT_LOCATION",
  AT_DOMICILE = "AT_DOMICILE",
  BOTH = "BOTH",
}

// ========================================
// FACTORY INTERFACES
// ========================================

export interface IUserFactory {
  createClient(data: CreateClientData): IUser;
  createProfessional(data: CreateProfessionalData): IUser;
  createCompany(data: CreateCompanyData): IUser;
}

export interface IProfileFactory {
  createClientProfile(data: CreateClientProfileData): IClientProfile;
  createProfessionalProfile(
    data: CreateProfessionalProfileData
  ): IProfessionalProfile;
  createCompanyProfile(data: CreateCompanyProfileData): ICompanyProfile;
}

// ========================================
// DTOs
// ========================================

export interface CreateClientData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  clientProfile: CreateClientProfileData;
}

export interface CreateProfessionalData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  professionalProfile: CreateProfessionalProfileData;
}

export interface CreateCompanyData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  companyProfile: CreateCompanyProfileData;
}

export interface CreateClientProfileData {
  cpf: string;
  addresses: Omit<Address, "id">[];
  paymentMethods?: Omit<PaymentMethod, "id">[];
  preferences?: ClientPreferences;
}

export interface CreateProfessionalProfileData {
  cpf?: string;
  cnpj?: string;
  address: string;
  city: string;
  serviceMode: ServiceMode;
  workingHours: WorkingHours;
  specialties: string[];
  certifications?: Omit<Certification, "id">[];
}

export interface CreateCompanyProfileData {
  cnpj: string;
  address: string;
  city: string;
  businessHours: BusinessHours;
  description?: string;
  photos?: string[];
}
