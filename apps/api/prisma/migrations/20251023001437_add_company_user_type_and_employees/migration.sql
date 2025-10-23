-- AlterEnum
ALTER TYPE "UserType" ADD VALUE 'COMPANY';

-- CreateTable
CREATE TABLE "company_employees" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_employee_appointments" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "locationType" "ServiceMode" NOT NULL,
    "clientAddress" TEXT,
    "clientNotes" TEXT,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_employee_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_services" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" MONEY NOT NULL,
    "priceType" "ServicePriceType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_employee_reviews" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_employee_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_employees_companyId_idx" ON "company_employees"("companyId");

-- CreateIndex
CREATE INDEX "company_employees_email_idx" ON "company_employees"("email");

-- CreateIndex
CREATE INDEX "company_employee_appointments_employeeId_scheduledDate_idx" ON "company_employee_appointments"("employeeId", "scheduledDate");

-- CreateIndex
CREATE INDEX "company_services_companyId_idx" ON "company_services"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_employee_reviews_appointmentId_key" ON "company_employee_reviews"("appointmentId");

-- AddForeignKey
ALTER TABLE "company_employees" ADD CONSTRAINT "company_employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_employee_appointments" ADD CONSTRAINT "company_employee_appointments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "company_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_employee_appointments" ADD CONSTRAINT "company_employee_appointments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_employee_appointments" ADD CONSTRAINT "company_employee_appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "company_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_services" ADD CONSTRAINT "company_services_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_services" ADD CONSTRAINT "company_services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_employee_reviews" ADD CONSTRAINT "company_employee_reviews_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "company_employee_appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_employee_reviews" ADD CONSTRAINT "company_employee_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
