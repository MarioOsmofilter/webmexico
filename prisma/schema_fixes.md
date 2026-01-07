# Schema Corrections Needed for Production

## Critical Fixes Required:

### 1. User Model
- Change `passwordHash` to `password` (used in APIs)
- Add missing `isActive` field

### 2. Lead Model
- Add `company` String?
- Add `position` String?
- Add `source` enum should be LeadSource
- Add `interestLevel` enum (LOW, MEDIUM, HIGH)
- Add `estimatedValue` Decimal?
- Add `state` String?
- Add `convertedToClient` Boolean
- Add `clientId` String? @unique

### 3. Client Model
- Rename `contactName` to keep consistency
- Add `name` String (business or person name)
- Add `type` enum (INDIVIDUAL, COMPANY)
- Add `state` String?
- Add `taxId` String?

### 4. Proposal Model
- Add `templateId` String?
- Add `notes` String?

### 5. ProposalItem Model
- Rename `discountPercent` to `discount` for consistency

### 6. Installation Model
- Add `address` String?
- Add `city` String?
- Add `state` String?
- Add `postalCode` String?
- Add `latitude` Decimal?
- Add `longitude` Decimal?
- Add `estimatedDuration` Int (minutes)
- Add `actualStartDate` DateTime?
- Add `actualEndDate` DateTime?
- Add `actualDuration` Int?
- Add `materialsLoaded` Boolean
- Add `materialsLoadedAt` DateTime?
- Add `signature` String? (base64)
- Add `clientDni` String?
- Add `completionNotes` String?
- Add `notes` String?
- Add `metadata` Json?

### 7. InstallationMaterial Model
- Change `quantityUsed` to `quantity`
- Add `isLoaded` Boolean
- Add `isReserved` Boolean
- Add `isUsed` Boolean
- Add `loadedAt` DateTime?

### 8. InstallationPhoto Model
- Change `caption` to `description`
- Change `takenAt` to `createdAt`
- Add `photoType` enum (BEFORE, DURING, AFTER)
- Add `uploadedBy` String

### 9. Warehouse Model
- Add `address` String?
- Add `city` String?
- Add `state` String?
- Add `postalCode` String?
- Add `phone` String?
- Add `managerId` String?
- Add `manager` relation to User

### 10. Inventory Model
- Add `reservedQuantity` Int @default(0)

### 11. WarehouseMovement Model
- Add `userId` String
- Add `user` relation
- Add `reason` String
- Remove `createdBy` String
- Remove `notes`

## Enums to Add:

```prisma
enum LeadInterestLevel {
  LOW
  MEDIUM
  HIGH
}

enum InstallationPhotoType {
  BEFORE
  DURING
  AFTER
}

enum WarehouseMovementType {
  IN
  OUT
  TRANSFER
  ADJUSTMENT
}
```
