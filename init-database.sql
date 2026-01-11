-- ============================================
-- Water CRM - PostgreSQL Database Schema
-- Generated from Prisma Schema
-- ============================================

-- Drop existing schema if needed (CAREFUL in production!)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- ============================================
-- 1. CREATE ENUMS
-- ============================================

CREATE TYPE "UserRole" AS ENUM (
  'SUPERADMIN',
  'ADMIN',
  'DIRECTOR_SALES',
  'DIRECTOR_INSTALLATIONS',
  'DIRECTOR_MARKETING',
  'SALES',
  'TECHNICIAN',
  'MARKETING',
  'WAREHOUSE',
  'CUSTOM'
);

CREATE TYPE "UserStatus" AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED'
);

CREATE TYPE "CompanyStatus" AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'TRIAL',
  'SUSPENDED'
);

CREATE TYPE "ProductStatus" AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'DISCONTINUED'
);

CREATE TYPE "AttributeType" AS ENUM (
  'TEXT',
  'NUMBER',
  'SELECT',
  'BOOLEAN',
  'TEXTAREA'
);

CREATE TYPE "Language" AS ENUM (
  'ES',
  'EN'
);

CREATE TYPE "ContactType" AS ENUM (
  'INDIVIDUAL',
  'BUSINESS'
);

CREATE TYPE "LeadSource" AS ENUM (
  'WEB',
  'TELEMARKETING',
  'MANUAL',
  'REFERRAL',
  'OTHER'
);

CREATE TYPE "LeadStatus" AS ENUM (
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'CONVERTED',
  'LOST'
);

CREATE TYPE "LeadInterestLevel" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH'
);

CREATE TYPE "ClientStatus" AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'VIP'
);

CREATE TYPE "ClientType" AS ENUM (
  'INDIVIDUAL',
  'COMPANY'
);

CREATE TYPE "TimelineAction" AS ENUM (
  'CREATED',
  'CONTACTED',
  'EMAIL_SENT',
  'CALL_MADE',
  'MEETING_SCHEDULED',
  'PROPOSAL_SENT',
  'PROPOSAL_VIEWED',
  'CONVERTED',
  'NOTE_ADDED',
  'STATUS_CHANGED',
  'ASSIGNED',
  'OTHER'
);

CREATE TYPE "ProposalStatus" AS ENUM (
  'DRAFT',
  'SENT',
  'VIEWED',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED'
);

CREATE TYPE "PaymentType" AS ENUM (
  'SALE',
  'RENTAL'
);

CREATE TYPE "SaleStatus" AS ENUM (
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE "GoalType" AS ENUM (
  'INDIVIDUAL',
  'TEAM'
);

CREATE TYPE "GoalPeriod" AS ENUM (
  'MONTHLY',
  'YEARLY'
);

CREATE TYPE "InstallationStatus" AS ENUM (
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'POSTPONED'
);

CREATE TYPE "InstallationPhotoType" AS ENUM (
  'BEFORE',
  'DURING',
  'AFTER'
);

CREATE TYPE "MaintenanceType" AS ENUM (
  'PERIODIC',
  'INCIDENT',
  'EMERGENCY'
);

CREATE TYPE "MaintenanceStatus" AS ENUM (
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE "IncidentPriority" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
);

CREATE TYPE "IncidentStatus" AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED'
);

CREATE TYPE "WarehouseType" AS ENUM (
  'CENTRAL',
  'VEHICLE',
  'EXTERNAL'
);

CREATE TYPE "WarehouseMovementType" AS ENUM (
  'IN',
  'OUT',
  'TRANSFER',
  'ADJUSTMENT'
);

CREATE TYPE "MovementType" AS ENUM (
  'TRANSFER',
  'SALE',
  'PURCHASE',
  'ADJUSTMENT',
  'INSTALLATION',
  'MAINTENANCE',
  'RETURN'
);

CREATE TYPE "LoadingOrderStatus" AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE "AlertType" AS ENUM (
  'LOW_STOCK',
  'OUT_OF_STOCK',
  'OVERSTOCK'
);

CREATE TYPE "TransactionType" AS ENUM (
  'COLLECTION',
  'DELIVERY',
  'EXPENSE',
  'ADJUSTMENT'
);

CREATE TYPE "PaymentMethod" AS ENUM (
  'CASH',
  'CARD',
  'TRANSFER',
  'OTHER'
);

CREATE TYPE "TransactionStatus" AS ENUM (
  'PENDING',
  'VALIDATED',
  'REJECTED'
);

CREATE TYPE "EventType" AS ENUM (
  'VISIT',
  'INSTALLATION',
  'MAINTENANCE',
  'CALL',
  'MEETING',
  'OTHER'
);

CREATE TYPE "EventStatus" AS ENUM (
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED'
);

CREATE TYPE "CampaignStatus" AS ENUM (
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'COMPLETED'
);

CREATE TYPE "CallListItemStatus" AS ENUM (
  'PENDING',
  'CALLED',
  'INTERESTED',
  'NOT_INTERESTED',
  'NO_ANSWER',
  'INVALID'
);

CREATE TYPE "CallOutcome" AS ENUM (
  'ANSWERED',
  'NO_ANSWER',
  'BUSY',
  'VOICEMAIL',
  'INTERESTED',
  'NOT_INTERESTED',
  'CALLBACK_REQUESTED',
  'INVALID_NUMBER'
);

CREATE TYPE "ExpenseStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- ============================================
-- 2.1 USUARIOS, EMPRESAS Y AUTENTICACIÓN
-- ============================================

CREATE TABLE "companies" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "subdomain" TEXT UNIQUE,
  "logo" TEXT,
  "status" "CompanyStatus" DEFAULT 'TRIAL' NOT NULL,
  "settings" JSONB,
  "superadminId" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "companies_slug_idx" ON "companies"("slug");
CREATE INDEX "companies_subdomain_idx" ON "companies"("subdomain");

CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT,
  "avatar" TEXT,
  "companyId" TEXT NOT NULL,
  "role" "UserRole" DEFAULT 'CUSTOM' NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "permissions" JSONB,
  "forcePasswordChange" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "lastLogin" TIMESTAMP(3),
  CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "users_companyId_idx" ON "users"("companyId");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");

CREATE TABLE "roles" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "permissions" JSONB NOT NULL,
  "isDefault" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "roles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "roles_companyId_name_key" UNIQUE ("companyId", "name")
);

CREATE TABLE "user_permissions" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "canView" BOOLEAN DEFAULT false NOT NULL,
  "canCreate" BOOLEAN DEFAULT false NOT NULL,
  "canEdit" BOOLEAN DEFAULT false NOT NULL,
  "canDelete" BOOLEAN DEFAULT false NOT NULL,
  "canViewSubordinates" BOOLEAN DEFAULT false NOT NULL,
  "canViewAll" BOOLEAN DEFAULT false NOT NULL,
  CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "user_permissions_userId_module_key" UNIQUE ("userId", "module")
);

CREATE TABLE "user_hierarchies" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "supervisorId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "user_hierarchies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "user_hierarchies_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "user_hierarchies_userId_supervisorId_key" UNIQUE ("userId", "supervisorId")
);

CREATE INDEX "user_hierarchies_userId_idx" ON "user_hierarchies"("userId");
CREATE INDEX "user_hierarchies_supervisorId_idx" ON "user_hierarchies"("supervisorId");

-- ============================================
-- 2.2 PRODUCTOS
-- ============================================

CREATE TABLE "product_categories" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT,
  "name" TEXT NOT NULL,
  "parentId" TEXT,
  "order" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "product_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "product_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "product_categories_companyId_idx" ON "product_categories"("companyId");

CREATE TABLE "products" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "internalReference" TEXT,
  "manufacturerReference" TEXT,
  "categoryId" TEXT,
  "basePrice" DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  "status" "ProductStatus" DEFAULT 'ACTIVE' NOT NULL,
  "isMaster" BOOLEAN DEFAULT false NOT NULL,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "products_companyId_idx" ON "products"("companyId");
CREATE INDEX "products_isMaster_idx" ON "products"("isMaster");

CREATE TABLE "product_attributes" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" "AttributeType" DEFAULT 'TEXT' NOT NULL,
  "options" JSONB,
  "companyId" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "product_attribute_values" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "attributeId" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  CONSTRAINT "product_attribute_values_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "product_attribute_values_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "product_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "product_attribute_values_productId_attributeId_key" UNIQUE ("productId", "attributeId")
);

CREATE TABLE "product_images" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "isPrimary" BOOLEAN DEFAULT false NOT NULL,
  "order" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "product_images_productId_idx" ON "product_images"("productId");

CREATE TABLE "product_prices" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT UNIQUE NOT NULL,
  "salePrice1" DECIMAL(10, 2),
  "salePrice12" DECIMAL(10, 2),
  "salePrice24" DECIMAL(10, 2),
  "salePrice36" DECIMAL(10, 2),
  "salePrice48" DECIMAL(10, 2),
  "salePrice60" DECIMAL(10, 2),
  "rentalPrice1" DECIMAL(10, 2),
  "rentalPrice12" DECIMAL(10, 2),
  "rentalPrice24" DECIMAL(10, 2),
  "rentalPrice36" DECIMAL(10, 2),
  "rentalPrice48" DECIMAL(10, 2),
  "rentalPrice60" DECIMAL(10, 2),
  "minPriceThreshold" DECIMAL(10, 2),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "product_datasheets" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "language" "Language" DEFAULT 'ES' NOT NULL,
  "pdfUrl" TEXT,
  "htmlContent" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_datasheets_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "product_datasheets_productId_language_key" UNIQUE ("productId", "language")
);

-- ============================================
-- 2.3 LEADS Y CLIENTES
-- ============================================

CREATE TABLE "leads" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "source" "LeadSource" DEFAULT 'MANUAL' NOT NULL,
  "contactType" "ContactType" DEFAULT 'INDIVIDUAL' NOT NULL,
  "contactName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT NOT NULL,
  "position" TEXT,
  "businessName" TEXT,
  "businessContact" TEXT,
  "businessEmail" TEXT,
  "businessPhone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "latitude" DECIMAL(10, 8),
  "longitude" DECIMAL(11, 8),
  "assignedToUserId" TEXT,
  "status" "LeadStatus" DEFAULT 'NEW' NOT NULL,
  "interestLevel" "LeadInterestLevel",
  "estimatedValue" DECIMAL(10, 2),
  "convertedToClient" BOOLEAN DEFAULT false NOT NULL,
  "clientId" TEXT UNIQUE,
  "notes" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "lastContactDate" TIMESTAMP(3),
  "daysWithoutAction" INTEGER DEFAULT 0 NOT NULL,
  CONSTRAINT "leads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "leads_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "leads_companyId_idx" ON "leads"("companyId");
CREATE INDEX "leads_assignedToUserId_idx" ON "leads"("assignedToUserId");
CREATE INDEX "leads_status_idx" ON "leads"("status");
CREATE INDEX "leads_source_idx" ON "leads"("source");

CREATE TABLE "clients" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "leadId" TEXT UNIQUE,
  "name" TEXT NOT NULL,
  "type" "ClientType" DEFAULT 'INDIVIDUAL' NOT NULL,
  "contactType" "ContactType" DEFAULT 'INDIVIDUAL' NOT NULL,
  "contactName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT NOT NULL,
  "businessName" TEXT,
  "businessContact" TEXT,
  "businessEmail" TEXT,
  "businessPhone" TEXT,
  "vatNumber" TEXT,
  "taxId" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "latitude" DECIMAL(10, 8),
  "longitude" DECIMAL(11, 8),
  "assignedToUserId" TEXT,
  "status" "ClientStatus" DEFAULT 'ACTIVE' NOT NULL,
  "clientCode" TEXT UNIQUE,
  "paymentMethod" TEXT,
  "billingAddress" TEXT,
  "notes" TEXT,
  "totalRevenue" DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  "convertedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "clients_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "clients_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "clients_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "clients_companyId_idx" ON "clients"("companyId");
CREATE INDEX "clients_assignedToUserId_idx" ON "clients"("assignedToUserId");
CREATE INDEX "clients_status_idx" ON "clients"("status");

CREATE TABLE "contact_timeline" (
  "id" TEXT PRIMARY KEY,
  "entityType" TEXT NOT NULL,
  "leadId" TEXT,
  "clientId" TEXT,
  "userId" TEXT,
  "actionType" "TimelineAction" DEFAULT 'OTHER' NOT NULL,
  "description" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "contact_timeline_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "contact_timeline_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "contact_timeline_leadId_idx" ON "contact_timeline"("leadId");
CREATE INDEX "contact_timeline_clientId_idx" ON "contact_timeline"("clientId");
CREATE INDEX "contact_timeline_createdAt_idx" ON "contact_timeline"("createdAt");

-- ============================================
-- 2.4 PROPUESTAS Y PRESUPUESTOS
-- ============================================

CREATE TABLE "proposal_templates" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "headerHtml" TEXT,
  "footerHtml" TEXT,
  "stylesJson" JSONB,
  "isDefault" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "proposal_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "proposal_templates_companyId_idx" ON "proposal_templates"("companyId");

CREATE TABLE "proposals" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "proposalNumber" TEXT UNIQUE NOT NULL,
  "leadId" TEXT,
  "clientId" TEXT,
  "createdBy" TEXT NOT NULL,
  "status" "ProposalStatus" DEFAULT 'DRAFT' NOT NULL,
  "templateId" TEXT,
  "notes" TEXT,
  "totalAmount" DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  "paymentType" "PaymentType" DEFAULT 'SALE' NOT NULL,
  "installments" INTEGER DEFAULT 1 NOT NULL,
  "requiresApproval" BOOLEAN DEFAULT false NOT NULL,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "validUntil" TIMESTAMP(3),
  "convertedToSale" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "proposals_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "proposals_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "proposals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "proposals_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "proposals_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "proposal_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "proposals_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "proposals_companyId_idx" ON "proposals"("companyId");
CREATE INDEX "proposals_leadId_idx" ON "proposals"("leadId");
CREATE INDEX "proposals_clientId_idx" ON "proposals"("clientId");
CREATE INDEX "proposals_createdBy_idx" ON "proposals"("createdBy");
CREATE INDEX "proposals_status_idx" ON "proposals"("status");

CREATE TABLE "proposal_items" (
  "id" TEXT PRIMARY KEY,
  "proposalId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER DEFAULT 1 NOT NULL,
  "unitPrice" DECIMAL(10, 2) NOT NULL,
  "discountPercent" DECIMAL(5, 2) DEFAULT 0 NOT NULL,
  "totalPrice" DECIMAL(10, 2) NOT NULL,
  "customDescription" TEXT,
  "notes" TEXT,
  CONSTRAINT "proposal_items_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "proposal_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "proposal_items_proposalId_idx" ON "proposal_items"("proposalId");

CREATE TABLE "proposal_ratings" (
  "id" TEXT PRIMARY KEY,
  "proposalId" TEXT UNIQUE NOT NULL,
  "rating" INTEGER NOT NULL,
  "comments" TEXT,
  "ratedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "proposal_ratings_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- 2.5 VENTAS
-- ============================================

CREATE TABLE "sales" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "saleNumber" TEXT UNIQUE NOT NULL,
  "proposalId" TEXT UNIQUE,
  "clientId" TEXT NOT NULL,
  "totalAmount" DECIMAL(10, 2) NOT NULL,
  "saleType" "PaymentType" DEFAULT 'SALE' NOT NULL,
  "paymentTerms" INTEGER DEFAULT 1 NOT NULL,
  "createdBy" TEXT NOT NULL,
  "saleDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "status" "SaleStatus" DEFAULT 'PENDING' NOT NULL,
  "pointsAwarded" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sales_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sales_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "sales_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "sales_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "sales_companyId_idx" ON "sales"("companyId");
CREATE INDEX "sales_clientId_idx" ON "sales"("clientId");
CREATE INDEX "sales_createdBy_idx" ON "sales"("createdBy");
CREATE INDEX "sales_status_idx" ON "sales"("status");
CREATE INDEX "sales_saleDate_idx" ON "sales"("saleDate");

CREATE TABLE "sale_items" (
  "id" TEXT PRIMARY KEY,
  "saleId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER DEFAULT 1 NOT NULL,
  "unitPrice" DECIMAL(10, 2) NOT NULL,
  "totalPrice" DECIMAL(10, 2) NOT NULL,
  CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "sale_items_saleId_idx" ON "sale_items"("saleId");

CREATE TABLE "sales_goals" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "userId" TEXT,
  "teamId" TEXT,
  "goalType" "GoalType" DEFAULT 'INDIVIDUAL' NOT NULL,
  "period" "GoalPeriod" DEFAULT 'MONTHLY' NOT NULL,
  "year" INTEGER NOT NULL,
  "month" INTEGER,
  "targetAmount" DECIMAL(10, 2) NOT NULL,
  "targetUnits" INTEGER,
  "targetPoints" INTEGER,
  "currentAmount" DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  "currentUnits" INTEGER DEFAULT 0 NOT NULL,
  "currentPoints" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sales_goals_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sales_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "sales_goals_companyId_userId_period_year_month_key" UNIQUE ("companyId", "userId", "period", "year", "month")
);

CREATE INDEX "sales_goals_companyId_idx" ON "sales_goals"("companyId");
CREATE INDEX "sales_goals_userId_idx" ON "sales_goals"("userId");

CREATE TABLE "sales_points_config" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "productId" TEXT,
  "saleType" "PaymentType" DEFAULT 'SALE' NOT NULL,
  "points" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sales_points_config_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sales_points_config_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "sales_points_config_companyId_idx" ON "sales_points_config"("companyId");

-- ============================================
-- 2.6 ALMACÉN E INVENTARIO
-- ============================================

CREATE TABLE "warehouses" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "phone" TEXT,
  "managerId" TEXT,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "warehouses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "warehouses_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "warehouses_companyId_idx" ON "warehouses"("companyId");
CREATE INDEX "warehouses_managerId_idx" ON "warehouses"("managerId");

CREATE TABLE "inventory" (
  "id" TEXT PRIMARY KEY,
  "warehouseId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER DEFAULT 0 NOT NULL,
  "reservedQuantity" INTEGER DEFAULT 0 NOT NULL,
  "minStock" INTEGER DEFAULT 0 NOT NULL,
  "maxStock" INTEGER,
  "lastRestockDate" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "inventory_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "inventory_warehouseId_productId_key" UNIQUE ("warehouseId", "productId")
);

CREATE INDEX "inventory_warehouseId_idx" ON "inventory"("warehouseId");
CREATE INDEX "inventory_productId_idx" ON "inventory"("productId");

CREATE TABLE "warehouse_movements" (
  "id" TEXT PRIMARY KEY,
  "warehouseId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "type" "WarehouseMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "warehouse_movements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "warehouse_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "warehouse_movements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "warehouse_movements_warehouseId_idx" ON "warehouse_movements"("warehouseId");
CREATE INDEX "warehouse_movements_productId_idx" ON "warehouse_movements"("productId");
CREATE INDEX "warehouse_movements_userId_idx" ON "warehouse_movements"("userId");
CREATE INDEX "warehouse_movements_createdAt_idx" ON "warehouse_movements"("createdAt");

CREATE TABLE "inventory_movements" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "fromWarehouseId" TEXT,
  "toWarehouseId" TEXT,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "movementType" "MovementType" DEFAULT 'TRANSFER' NOT NULL,
  "createdBy" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "inventory_movements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "inventory_movements_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "inventory_movements_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "inventory_movements_companyId_idx" ON "inventory_movements"("companyId");
CREATE INDEX "inventory_movements_fromWarehouseId_idx" ON "inventory_movements"("fromWarehouseId");
CREATE INDEX "inventory_movements_toWarehouseId_idx" ON "inventory_movements"("toWarehouseId");
CREATE INDEX "inventory_movements_productId_idx" ON "inventory_movements"("productId");
CREATE INDEX "inventory_movements_createdAt_idx" ON "inventory_movements"("createdAt");

CREATE TABLE "loading_orders" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "status" "LoadingOrderStatus" DEFAULT 'PENDING' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "loadedAt" TIMESTAMP(3),
  CONSTRAINT "loading_orders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "loading_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "loading_orders_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "loading_orders_companyId_idx" ON "loading_orders"("companyId");
CREATE INDEX "loading_orders_userId_idx" ON "loading_orders"("userId");
CREATE INDEX "loading_orders_warehouseId_idx" ON "loading_orders"("warehouseId");

CREATE TABLE "loading_order_items" (
  "id" TEXT PRIMARY KEY,
  "loadingOrderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  CONSTRAINT "loading_order_items_loadingOrderId_fkey" FOREIGN KEY ("loadingOrderId") REFERENCES "loading_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "loading_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "loading_order_items_loadingOrderId_idx" ON "loading_order_items"("loadingOrderId");

CREATE TABLE "stock_alerts" (
  "id" TEXT PRIMARY KEY,
  "warehouseId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "alertType" "AlertType" DEFAULT 'LOW_STOCK' NOT NULL,
  "suggestedReorderQuantity" INTEGER,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "stock_alerts_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "stock_alerts_warehouseId_idx" ON "stock_alerts"("warehouseId");
CREATE INDEX "stock_alerts_productId_idx" ON "stock_alerts"("productId");
CREATE INDEX "stock_alerts_resolvedAt_idx" ON "stock_alerts"("resolvedAt");

-- ============================================
-- 2.7 INSTALACIONES
-- ============================================

CREATE TABLE "installations" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "saleId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "assignedToUserId" TEXT NOT NULL,
  "status" "InstallationStatus" DEFAULT 'SCHEDULED' NOT NULL,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "latitude" DECIMAL(10, 8),
  "longitude" DECIMAL(11, 8),
  "scheduledDate" TIMESTAMP(3) NOT NULL,
  "estimatedDuration" INTEGER,
  "actualStartDate" TIMESTAMP(3),
  "actualEndDate" TIMESTAMP(3),
  "actualDuration" INTEGER,
  "materialsLoaded" BOOLEAN DEFAULT false NOT NULL,
  "materialsLoadedAt" TIMESTAMP(3),
  "startLatitude" DECIMAL(10, 8),
  "startLongitude" DECIMAL(11, 8),
  "startAddress" TEXT,
  "endLatitude" DECIMAL(10, 8),
  "endLongitude" DECIMAL(11, 8),
  "endAddress" TEXT,
  "maxDistanceMeters" INTEGER DEFAULT 1000 NOT NULL,
  "signature" TEXT,
  "clientDni" TEXT,
  "completionNotes" TEXT,
  "notes" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "installations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "installations_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "installations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "installations_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "installations_companyId_idx" ON "installations"("companyId");
CREATE INDEX "installations_saleId_idx" ON "installations"("saleId");
CREATE INDEX "installations_clientId_idx" ON "installations"("clientId");
CREATE INDEX "installations_assignedToUserId_idx" ON "installations"("assignedToUserId");
CREATE INDEX "installations_status_idx" ON "installations"("status");
CREATE INDEX "installations_scheduledDate_idx" ON "installations"("scheduledDate");

CREATE TABLE "installation_materials" (
  "id" TEXT PRIMARY KEY,
  "installationId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "isLoaded" BOOLEAN DEFAULT false NOT NULL,
  "isReserved" BOOLEAN DEFAULT false NOT NULL,
  "isUsed" BOOLEAN DEFAULT false NOT NULL,
  "loadedAt" TIMESTAMP(3),
  "warehouseId" TEXT,
  CONSTRAINT "installation_materials_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "installation_materials_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "installation_materials_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "installation_materials_installationId_idx" ON "installation_materials"("installationId");

CREATE TABLE "installation_photos" (
  "id" TEXT PRIMARY KEY,
  "installationId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT,
  "photoType" "InstallationPhotoType" DEFAULT 'DURING' NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "installation_photos_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "installation_photos_installationId_idx" ON "installation_photos"("installationId");

-- ============================================
-- 2.8 MANTENIMIENTOS
-- ============================================

CREATE TABLE "maintenances" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "installationId" TEXT,
  "maintenanceType" "MaintenanceType" DEFAULT 'PERIODIC' NOT NULL,
  "scheduledDate" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "assignedToUserId" TEXT NOT NULL,
  "status" "MaintenanceStatus" DEFAULT 'SCHEDULED' NOT NULL,
  "nextMaintenanceDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "maintenances_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "maintenances_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "maintenances_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installations"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "maintenances_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "maintenances_companyId_idx" ON "maintenances"("companyId");
CREATE INDEX "maintenances_clientId_idx" ON "maintenances"("clientId");
CREATE INDEX "maintenances_assignedToUserId_idx" ON "maintenances"("assignedToUserId");
CREATE INDEX "maintenances_status_idx" ON "maintenances"("status");
CREATE INDEX "maintenances_scheduledDate_idx" ON "maintenances"("scheduledDate");

CREATE TABLE "maintenance_materials" (
  "id" TEXT PRIMARY KEY,
  "maintenanceId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantityUsed" INTEGER NOT NULL,
  CONSTRAINT "maintenance_materials_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "maintenance_materials_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "maintenance_materials_maintenanceId_idx" ON "maintenance_materials"("maintenanceId");

CREATE TABLE "maintenance_history" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "maintenanceId" TEXT NOT NULL,
  "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "description" TEXT NOT NULL,
  "technicianId" TEXT NOT NULL,
  CONSTRAINT "maintenance_history_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "maintenance_history_clientId_idx" ON "maintenance_history"("clientId");
CREATE INDEX "maintenance_history_maintenanceId_idx" ON "maintenance_history"("maintenanceId");

-- ============================================
-- 2.9 INCIDENCIAS
-- ============================================

CREATE TABLE "incidents" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "installationId" TEXT,
  "reportedByUserId" TEXT NOT NULL,
  "assignedToUserId" TEXT,
  "priority" "IncidentPriority" DEFAULT 'MEDIUM' NOT NULL,
  "status" "IncidentStatus" DEFAULT 'OPEN' NOT NULL,
  "category" TEXT,
  "description" TEXT NOT NULL,
  "resolution" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "incidents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "incidents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "incidents_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installations"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "incidents_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "incidents_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "incidents_companyId_idx" ON "incidents"("companyId");
CREATE INDEX "incidents_clientId_idx" ON "incidents"("clientId");
CREATE INDEX "incidents_assignedToUserId_idx" ON "incidents"("assignedToUserId");
CREATE INDEX "incidents_status_idx" ON "incidents"("status");
CREATE INDEX "incidents_priority_idx" ON "incidents"("priority");

-- ============================================
-- 2.10 WALLET Y TRANSACCIONES
-- ============================================

CREATE TABLE "wallets" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  "companyId" TEXT NOT NULL,
  "balance" DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  "pendingValidation" DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "wallets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "wallets_userId_idx" ON "wallets"("userId");
CREATE INDEX "wallets_companyId_idx" ON "wallets"("companyId");

CREATE TABLE "wallet_transactions" (
  "id" TEXT PRIMARY KEY,
  "walletId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "transactionType" "TransactionType" DEFAULT 'COLLECTION' NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "paymentMethod" "PaymentMethod" DEFAULT 'CASH' NOT NULL,
  "saleId" TEXT,
  "clientId" TEXT,
  "status" "TransactionStatus" DEFAULT 'PENDING' NOT NULL,
  "validatedBy" TEXT,
  "validatedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "wallet_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "wallet_transactions_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "wallet_transactions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "wallet_transactions_walletId_idx" ON "wallet_transactions"("walletId");
CREATE INDEX "wallet_transactions_userId_idx" ON "wallet_transactions"("userId");
CREATE INDEX "wallet_transactions_status_idx" ON "wallet_transactions"("status");
CREATE INDEX "wallet_transactions_createdAt_idx" ON "wallet_transactions"("createdAt");

-- ============================================
-- 2.11 AGENDA Y RUTAS
-- ============================================

CREATE TABLE "calendar_events" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventType" "EventType" DEFAULT 'VISIT' NOT NULL,
  "relatedEntityType" TEXT,
  "leadId" TEXT,
  "clientId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startDatetime" TIMESTAMP(3) NOT NULL,
  "endDatetime" TIMESTAMP(3) NOT NULL,
  "location" TEXT,
  "latitude" DECIMAL(10, 8),
  "longitude" DECIMAL(11, 8),
  "status" "EventStatus" DEFAULT 'SCHEDULED' NOT NULL,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "calendar_events_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "calendar_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "calendar_events_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "calendar_events_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "calendar_events_companyId_idx" ON "calendar_events"("companyId");
CREATE INDEX "calendar_events_userId_idx" ON "calendar_events"("userId");
CREATE INDEX "calendar_events_leadId_idx" ON "calendar_events"("leadId");
CREATE INDEX "calendar_events_clientId_idx" ON "calendar_events"("clientId");
CREATE INDEX "calendar_events_startDatetime_idx" ON "calendar_events"("startDatetime");
CREATE INDEX "calendar_events_status_idx" ON "calendar_events"("status");

CREATE TABLE "routes" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "routeDate" TIMESTAMP(3) NOT NULL,
  "totalDistanceKm" DECIMAL(8, 2),
  "estimatedDurationMinutes" INTEGER,
  "routeDataJson" JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "routes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "routes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "routes_companyId_idx" ON "routes"("companyId");
CREATE INDEX "routes_userId_idx" ON "routes"("userId");
CREATE INDEX "routes_routeDate_idx" ON "routes"("routeDate");

CREATE TABLE "route_stops" (
  "id" TEXT PRIMARY KEY,
  "routeId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "entityType" TEXT NOT NULL,
  "leadId" TEXT,
  "clientId" TEXT,
  "address" TEXT NOT NULL,
  "latitude" DECIMAL(10, 8) NOT NULL,
  "longitude" DECIMAL(11, 8) NOT NULL,
  "estimatedArrival" TIMESTAMP(3),
  "actualArrival" TIMESTAMP(3),
  CONSTRAINT "route_stops_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "route_stops_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "route_stops_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "route_stops_routeId_idx" ON "route_stops"("routeId");

-- ============================================
-- 2.12 TELEMARKETING
-- ============================================

CREATE TABLE "tmk_campaigns" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "status" "CampaignStatus" DEFAULT 'DRAFT' NOT NULL,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tmk_campaigns_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "tmk_campaigns_companyId_idx" ON "tmk_campaigns"("companyId");
CREATE INDEX "tmk_campaigns_status_idx" ON "tmk_campaigns"("status");

CREATE TABLE "tmk_call_lists" (
  "id" TEXT PRIMARY KEY,
  "campaignId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "totalContacts" INTEGER DEFAULT 0 NOT NULL,
  "completedCalls" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "tmk_call_lists_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "tmk_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "tmk_call_lists_campaignId_idx" ON "tmk_call_lists"("campaignId");

CREATE TABLE "tmk_call_list_items" (
  "id" TEXT PRIMARY KEY,
  "callListId" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "status" "CallListItemStatus" DEFAULT 'PENDING' NOT NULL,
  "callAttempts" INTEGER DEFAULT 0 NOT NULL,
  "lastCallAt" TIMESTAMP(3),
  CONSTRAINT "tmk_call_list_items_callListId_fkey" FOREIGN KEY ("callListId") REFERENCES "tmk_call_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "tmk_call_list_items_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "tmk_call_list_items_callListId_idx" ON "tmk_call_list_items"("callListId");
CREATE INDEX "tmk_call_list_items_leadId_idx" ON "tmk_call_list_items"("leadId");
CREATE INDEX "tmk_call_list_items_status_idx" ON "tmk_call_list_items"("status");

CREATE TABLE "tmk_calls" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "callListItemId" TEXT,
  "callDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "durationSeconds" INTEGER,
  "outcome" "CallOutcome",
  "notes" TEXT,
  "scheduledCallback" TIMESTAMP(3),
  CONSTRAINT "tmk_calls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "tmk_calls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "tmk_calls_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "tmk_calls_companyId_idx" ON "tmk_calls"("companyId");
CREATE INDEX "tmk_calls_userId_idx" ON "tmk_calls"("userId");
CREATE INDEX "tmk_calls_leadId_idx" ON "tmk_calls"("leadId");
CREATE INDEX "tmk_calls_callDate_idx" ON "tmk_calls"("callDate");

CREATE TABLE "tmk_scripts" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tmk_scripts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "tmk_scripts_companyId_idx" ON "tmk_scripts"("companyId");

-- ============================================
-- 2.13 MENSAJERÍA INTERNA
-- ============================================

CREATE TABLE "internal_messages" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "senderUserId" TEXT NOT NULL,
  "recipientUserId" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT false NOT NULL,
  "sentAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "readAt" TIMESTAMP(3),
  CONSTRAINT "internal_messages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "internal_messages_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "internal_messages_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "internal_messages_companyId_idx" ON "internal_messages"("companyId");
CREATE INDEX "internal_messages_senderUserId_idx" ON "internal_messages"("senderUserId");
CREATE INDEX "internal_messages_recipientUserId_idx" ON "internal_messages"("recipientUserId");
CREATE INDEX "internal_messages_sentAt_idx" ON "internal_messages"("sentAt");

CREATE TABLE "message_attachments" (
  "id" TEXT PRIMARY KEY,
  "messageId" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  CONSTRAINT "message_attachments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "internal_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "message_attachments_messageId_idx" ON "message_attachments"("messageId");

-- ============================================
-- 2.14 GASTOS
-- ============================================

CREATE TABLE "expenses" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expenseType" TEXT NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "currency" TEXT DEFAULT 'EUR' NOT NULL,
  "expenseDate" TIMESTAMP(3) NOT NULL,
  "description" TEXT,
  "receiptUrl" TEXT,
  "status" "ExpenseStatus" DEFAULT 'PENDING' NOT NULL,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "expenses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "expenses_companyId_idx" ON "expenses"("companyId");
CREATE INDEX "expenses_userId_idx" ON "expenses"("userId");
CREATE INDEX "expenses_status_idx" ON "expenses"("status");
CREATE INDEX "expenses_expenseDate_idx" ON "expenses"("expenseDate");

-- ============================================
-- 2.15 CONFIGURACIÓN Y LOGS
-- ============================================

CREATE TABLE "company_settings" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "settingKey" TEXT NOT NULL,
  "settingValue" TEXT NOT NULL,
  "updatedBy" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "company_settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "company_settings_companyId_settingKey_key" UNIQUE ("companyId", "settingKey")
);

CREATE INDEX "company_settings_companyId_idx" ON "company_settings"("companyId");

CREATE TABLE "activity_logs" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "activity_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "activity_logs_companyId_idx" ON "activity_logs"("companyId");
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

CREATE TABLE "api_keys" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "key" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "permissions" JSONB,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "lastUsedAt" TIMESTAMP(3),
  CONSTRAINT "api_keys_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "api_keys_companyId_idx" ON "api_keys"("companyId");
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Script execution complete
-- This script creates all tables, enums, indexes, and foreign keys
-- from the Water CRM Prisma schema
