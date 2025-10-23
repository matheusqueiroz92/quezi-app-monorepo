/**
 * Schemas de Validação para ProfileController
 *
 * Define os schemas JSON para validação de requisições
 * Seguindo os princípios de validação e documentação
 */

/**
 * Schema para criação de perfil de cliente
 */
export const createClientProfileSchema = {
  body: {
    type: "object",
    required: ["cpf"],
    properties: {
      cpf: {
        type: "string",
        pattern: "^\\d{11}$",
        description: "CPF do cliente (11 dígitos)",
      },
      addresses: {
        type: "array",
        items: {
          type: "object",
          required: [
            "street",
            "number",
            "neighborhood",
            "city",
            "state",
            "zipCode",
          ],
          properties: {
            street: { type: "string", minLength: 1 },
            number: { type: "string", minLength: 1 },
            complement: { type: "string" },
            neighborhood: { type: "string", minLength: 1 },
            city: { type: "string", minLength: 1 },
            state: { type: "string", minLength: 2, maxLength: 2 },
            zipCode: { type: "string", pattern: "^\\d{8}$" },
            isDefault: { type: "boolean", default: false },
          },
        },
        default: [],
      },
      paymentMethods: {
        type: "array",
        items: {
          type: "object",
          required: ["type", "name"],
          properties: {
            type: {
              type: "string",
              enum: ["CREDIT_CARD", "DEBIT_CARD", "PIX", "BANK_TRANSFER"],
            },
            name: { type: "string", minLength: 1 },
            isDefault: { type: "boolean", default: false },
            details: { type: "object" },
          },
        },
        default: [],
      },
      favoriteServices: {
        type: "array",
        items: { type: "string" },
        default: [],
      },
      preferences: {
        type: "object",
        properties: {
          notifications: {
            type: "object",
            properties: {
              email: { type: "boolean" },
              sms: { type: "boolean" },
              push: { type: "boolean" },
            },
          },
          marketing: { type: "boolean", default: false },
          language: { type: "string", default: "pt-BR" },
          timezone: { type: "string", default: "America/Sao_Paulo" },
        },
        default: {},
      },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        userId: { type: "string" },
        cpf: { type: "string" },
        addresses: { type: "array" },
        paymentMethods: { type: "array" },
        favoriteServices: { type: "array" },
        preferences: { type: "object" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
      },
    },
  },
};

/**
 * Schema para criação de perfil de profissional
 */
export const createProfessionalProfileSchema = {
  body: {
    type: "object",
    required: ["address", "city", "serviceMode"],
    properties: {
      cpf: {
        type: "string",
        pattern: "^\\d{11}$",
        description: "CPF do profissional (11 dígitos)",
      },
      cnpj: {
        type: "string",
        pattern: "^\\d{14}$",
        description: "CNPJ do profissional (14 dígitos)",
      },
      address: { type: "string", minLength: 5 },
      city: { type: "string", minLength: 2 },
      serviceMode: {
        type: "string",
        enum: ["AT_LOCATION", "AT_DOMICILE", "BOTH"],
      },
      specialties: {
        type: "array",
        items: { type: "string" },
        default: [],
      },
      workingHours: {
        type: "object",
        properties: {
          monday: { $ref: "#/definitions/DayHours" },
          tuesday: { $ref: "#/definitions/DayHours" },
          wednesday: { $ref: "#/definitions/DayHours" },
          thursday: { $ref: "#/definitions/DayHours" },
          friday: { $ref: "#/definitions/DayHours" },
          saturday: { $ref: "#/definitions/DayHours" },
          sunday: { $ref: "#/definitions/DayHours" },
        },
        default: {},
      },
      certifications: {
        type: "array",
        items: {
          type: "object",
          required: ["name", "institution", "date"],
          properties: {
            name: { type: "string", minLength: 1 },
            institution: { type: "string", minLength: 1 },
            date: { type: "string", format: "date" },
            documentUrl: { type: "string", format: "uri" },
            isVerified: { type: "boolean", default: false },
          },
        },
        default: [],
      },
      portfolio: {
        type: "array",
        items: { type: "string", format: "uri" },
        default: [],
      },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        userId: { type: "string" },
        cpf: { type: "string" },
        cnpj: { type: "string" },
        address: { type: "string" },
        city: { type: "string" },
        serviceMode: { type: "string" },
        specialties: { type: "array" },
        workingHours: { type: "object" },
        certifications: { type: "array" },
        portfolio: { type: "array" },
        isActive: { type: "boolean" },
        isVerified: { type: "boolean" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
      },
    },
  },
  definitions: {
    DayHours: {
      type: "object",
      required: ["isAvailable"],
      properties: {
        isAvailable: { type: "boolean" },
        start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
        end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
      },
    },
  },
};

/**
 * Schema para criação de perfil de empresa
 */
export const createCompanyProfileSchema = {
  body: {
    type: "object",
    required: ["cnpj", "address", "city"],
    properties: {
      cnpj: {
        type: "string",
        pattern: "^\\d{14}$",
        description: "CNPJ da empresa (14 dígitos)",
      },
      address: { type: "string", minLength: 5 },
      city: { type: "string", minLength: 2 },
      businessHours: {
        type: "object",
        properties: {
          monday: { $ref: "#/definitions/BusinessDayHours" },
          tuesday: { $ref: "#/definitions/BusinessDayHours" },
          wednesday: { $ref: "#/definitions/BusinessDayHours" },
          thursday: { $ref: "#/definitions/BusinessDayHours" },
          friday: { $ref: "#/definitions/BusinessDayHours" },
          saturday: { $ref: "#/definitions/BusinessDayHours" },
          sunday: { $ref: "#/definitions/BusinessDayHours" },
        },
        default: {},
      },
      description: { type: "string", maxLength: 500 },
      photos: {
        type: "array",
        items: { type: "string", format: "uri" },
        default: [],
      },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        userId: { type: "string" },
        cnpj: { type: "string" },
        address: { type: "string" },
        city: { type: "string" },
        businessHours: { type: "object" },
        description: { type: "string" },
        photos: { type: "array" },
        isActive: { type: "boolean" },
        isVerified: { type: "boolean" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
      },
    },
  },
  definitions: {
    BusinessDayHours: {
      type: "object",
      required: ["isOpen"],
      properties: {
        isOpen: { type: "boolean" },
        start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
        end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
      },
    },
  },
};

/**
 * Schema para buscar perfil por ID
 */
export const getProfileByIdSchema = {
  params: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string", format: "uuid" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        userId: { type: "string" },
        cpf: { type: "string" },
        addresses: { type: "array" },
        paymentMethods: { type: "array" },
        favoriteServices: { type: "array" },
        preferences: { type: "object" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
      },
    },
    404: {
      type: "object",
      properties: {
        error: { type: "string" },
        message: { type: "string" },
      },
    },
  },
};
