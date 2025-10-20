-- AlterTable
ALTER TABLE "professional_profiles" ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "portfolioImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "workingHours" JSONB,
ADD COLUMN     "yearsOfExperience" INTEGER;
