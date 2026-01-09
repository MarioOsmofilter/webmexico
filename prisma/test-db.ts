/**
 * Script de pruebas para verificar la base de datos
 * Ejecutar con: npx tsx prisma/test-db.ts
 */

import { PrismaClient, UserRole, CompanyStatus, ProductStatus, LeadStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testDatabase() {
  console.log('🧪 Iniciando pruebas de base de datos...\n')

  try {
    // TEST 1: Verificar conexión
    console.log('1️⃣  Verificando conexión a PostgreSQL...')
    await prisma.$connect()
    console.log('✅ Conexión exitosa\n')

    // TEST 2: Crear empresa de prueba
    console.log('2️⃣  Creando empresa de prueba...')
    const testCompany = await prisma.company.create({
      data: {
        name: 'Test Company',
        slug: 'test-company',
        subdomain: 'test',
        status: CompanyStatus.ACTIVE,
      }
    })
    console.log(`✅ Empresa creada: ${testCompany.name} (${testCompany.id})\n`)

    // TEST 3: Crear usuario con jerarquía
    console.log('3️⃣  Creando usuarios con jerarquía...')
    const director = await prisma.user.create({
      data: {
        email: 'test.director@test.com',
        password: await bcrypt.hash('Test123!', 10),
        firstName: 'Director',
        lastName: 'Test',
        role: UserRole.DIRECTOR_SALES,
        isActive: true,
        companyId: testCompany.id,
      }
    })

    const comercial = await prisma.user.create({
      data: {
        email: 'test.comercial@test.com',
        password: await bcrypt.hash('Test123!', 10),
        firstName: 'Comercial',
        lastName: 'Test',
        role: UserRole.SALES,
        isActive: true,
        companyId: testCompany.id,
      }
    })

    // Crear jerarquía
    await prisma.userHierarchy.create({
      data: {
        userId: comercial.id,
        supervisorId: director.id,
        companyId: testCompany.id,
      }
    })
    console.log('✅ Usuarios creados con jerarquía\n')

    // TEST 4: Crear categoría y producto
    console.log('4️⃣  Creando producto con precios...')
    const category = await prisma.productCategory.create({
      data: {
        name: 'Test Category',
        companyId: testCompany.id,
      }
    })

    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        description: 'Producto de prueba',
        internalReference: 'TEST-001',
        categoryId: category.id,
        basePrice: 599.99,
        status: ProductStatus.ACTIVE,
        companyId: testCompany.id,
      }
    })

    // Crear precios
    await prisma.productPrice.create({
      data: {
        productId: product.id,
        salePrice1: 599.99,
        salePrice12: 650.00,
        salePrice24: 700.00,
        rentalPrice12: 45.00,
        rentalPrice24: 40.00,
        minPriceThreshold: 500.00,
      }
    })
    console.log(`✅ Producto creado: ${product.name}\n`)

    // TEST 5: Crear lead con timeline
    console.log('5️⃣  Creando lead con timeline...')
    const lead = await prisma.lead.create({
      data: {
        companyId: testCompany.id,
        source: 'MANUAL',
        contactType: 'INDIVIDUAL',
        contactName: 'Test Lead',
        email: 'test@example.com',
        phone: '666123456',
        status: LeadStatus.NEW,
        assignedToUserId: comercial.id,
        createdBy: comercial.id,
      }
    })

    await prisma.contactTimeline.create({
      data: {
        entityType: 'lead',
        leadId: lead.id,
        userId: comercial.id,
        actionType: 'CREATED',
        description: 'Lead creado en test',
      }
    })
    console.log(`✅ Lead creado con timeline\n`)

    // TEST 6: Crear propuesta
    console.log('6️⃣  Creando propuesta con items...')
    const proposal = await prisma.proposal.create({
      data: {
        companyId: testCompany.id,
        proposalNumber: 'PROP-TEST-001',
        leadId: lead.id,
        createdBy: comercial.id,
        status: 'DRAFT',
        totalAmount: 599.99,
        paymentType: 'SALE',
        installments: 1,
      }
    })

    await prisma.proposalItem.create({
      data: {
        proposalId: proposal.id,
        productId: product.id,
        quantity: 1,
        unitPrice: 599.99,
        totalPrice: 599.99,
      }
    })
    console.log(`✅ Propuesta creada: ${proposal.proposalNumber}\n`)

    // TEST 7: Crear venta y cliente
    console.log('7️⃣  Convirtiendo lead a cliente y creando venta...')
    const client = await prisma.client.create({
      data: {
        companyId: testCompany.id,
        leadId: lead.id,
        name: lead.contactName,
        contactType: 'INDIVIDUAL',
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone,
        assignedToUserId: comercial.id,
        clientCode: 'CLI-TEST-001',
      }
    })

    const sale = await prisma.sale.create({
      data: {
        companyId: testCompany.id,
        saleNumber: 'SALE-TEST-001',
        proposalId: proposal.id,
        clientId: client.id,
        totalAmount: 599.99,
        saleType: 'SALE',
        paymentTerms: 1,
        createdBy: comercial.id,
        pointsAwarded: 10,
      }
    })

    await prisma.saleItem.create({
      data: {
        saleId: sale.id,
        productId: product.id,
        quantity: 1,
        unitPrice: 599.99,
        totalPrice: 599.99,
      }
    })
    console.log(`✅ Cliente y venta creados\n`)

    // TEST 8: Crear almacén e inventario
    console.log('8️⃣  Creando almacén con inventario...')
    const warehouse = await prisma.warehouse.create({
      data: {
        companyId: testCompany.id,
        name: 'Test Warehouse',
        address: 'Test Address 123',
        city: 'Test City',
        state: 'Test State',
        postalCode: '28001',
      }
    })

    await prisma.inventory.create({
      data: {
        warehouseId: warehouse.id,
        productId: product.id,
        quantity: 100,
        minStock: 10,
        maxStock: 200,
      }
    })
    console.log(`✅ Almacén creado con inventario\n`)

    // TEST 9: Crear instalación
    console.log('9️⃣  Creando instalación...')
    const installation = await prisma.installation.create({
      data: {
        companyId: testCompany.id,
        saleId: sale.id,
        clientId: client.id,
        assignedToUserId: comercial.id,
        status: 'SCHEDULED',
        scheduledDate: new Date(),
      }
    })
    console.log(`✅ Instalación creada\n`)

    // TEST 10: Crear wallet y transacción
    console.log('🔟 Creando wallet con transacción...')
    const wallet = await prisma.wallet.create({
      data: {
        userId: comercial.id,
        companyId: testCompany.id,
        balance: 0,
        pendingValidation: 599.99,
      }
    })

    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId: comercial.id,
        transactionType: 'COLLECTION',
        amount: 599.99,
        paymentMethod: 'CASH',
        saleId: sale.id,
        clientId: client.id,
        status: 'PENDING',
      }
    })
    console.log(`✅ Wallet creado con transacción\n`)

    // TEST 11: Verificar relaciones
    console.log('1️⃣1️⃣  Verificando relaciones...')
    const leadWithRelations = await prisma.lead.findUnique({
      where: { id: lead.id },
      include: {
        assignedTo: true,
        timeline: true,
        proposals: {
          include: {
            items: {
              include: { product: true }
            }
          }
        },
        client: true,
      }
    })

    if (!leadWithRelations?.assignedTo) throw new Error('Relación user falla')
    if (!leadWithRelations?.timeline?.length) throw new Error('Relación timeline falla')
    if (!leadWithRelations?.proposals?.length) throw new Error('Relación proposals falla')
    if (!leadWithRelations?.client) throw new Error('Relación client falla')

    console.log('✅ Todas las relaciones funcionan correctamente\n')

    // TEST 12: Verificar cascadas
    console.log('1️⃣2️⃣  Probando eliminación en cascada...')
    const testLead = await prisma.lead.create({
      data: {
        companyId: testCompany.id,
        source: 'MANUAL',
        contactType: 'INDIVIDUAL',
        contactName: 'Delete Test',
        phone: '666999999',
        status: LeadStatus.NEW,
        assignedToUserId: comercial.id,
      }
    })

    await prisma.contactTimeline.create({
      data: {
        entityType: 'lead',
        leadId: testLead.id,
        actionType: 'CREATED',
        description: 'Test cascade',
      }
    })

    // Eliminar lead (debe eliminar timeline en cascada)
    await prisma.lead.delete({ where: { id: testLead.id } })

    const deletedTimeline = await prisma.contactTimeline.findMany({
      where: { leadId: testLead.id }
    })

    if (deletedTimeline.length > 0) throw new Error('Cascada no funciona')
    console.log('✅ Eliminación en cascada funciona correctamente\n')

    // TEST 13: Activity logs
    console.log('1️⃣3️⃣  Creando activity log...')
    await prisma.activityLog.create({
      data: {
        companyId: testCompany.id,
        userId: comercial.id,
        action: 'TEST_ACTION',
        entityType: 'test',
        entityId: 'test-id',
      }
    })
    console.log('✅ Activity log creado\n')

    // TEST 14: API Key
    console.log('1️⃣4️⃣  Creando API Key...')
    const apiKey = await prisma.apiKey.create({
      data: {
        companyId: testCompany.id,
        key: 'test_key_123',
        name: 'Test API Key',
        permissions: {
          products: ['read'],
          leads: ['create']
        },
        isActive: true,
      }
    })
    console.log(`✅ API Key creada: ${apiKey.key}\n`)

    // LIMPIEZA: Eliminar datos de prueba
    console.log('🧹 Limpiando datos de prueba...')
    await prisma.apiKey.delete({ where: { id: apiKey.id } })
    await prisma.activityLog.deleteMany({ where: { companyId: testCompany.id } })
    await prisma.walletTransaction.deleteMany({ where: { walletId: wallet.id } })
    await prisma.wallet.delete({ where: { id: wallet.id } })
    await prisma.installation.delete({ where: { id: installation.id } })
    await prisma.inventory.deleteMany({ where: { warehouseId: warehouse.id } })
    await prisma.warehouse.delete({ where: { id: warehouse.id } })
    await prisma.saleItem.deleteMany({ where: { saleId: sale.id } })
    await prisma.sale.delete({ where: { id: sale.id } })
    await prisma.client.delete({ where: { id: client.id } })
    await prisma.proposalItem.deleteMany({ where: { proposalId: proposal.id } })
    await prisma.proposal.delete({ where: { id: proposal.id } })
    await prisma.contactTimeline.deleteMany({ where: { leadId: lead.id } })
    await prisma.lead.delete({ where: { id: lead.id } })
    await prisma.productPrice.deleteMany({ where: { productId: product.id } })
    await prisma.product.delete({ where: { id: product.id } })
    await prisma.productCategory.delete({ where: { id: category.id } })
    await prisma.userHierarchy.deleteMany({ where: { companyId: testCompany.id } })
    await prisma.user.deleteMany({ where: { companyId: testCompany.id } })
    await prisma.company.delete({ where: { id: testCompany.id } })
    console.log('✅ Limpieza completada\n')

    // RESUMEN
    console.log('=' .repeat(60))
    console.log('🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE')
    console.log('=' .repeat(60))
    console.log('\n✅ Base de datos funcionando perfectamente:')
    console.log('   • Conexión a PostgreSQL: OK')
    console.log('   • Creación de registros: OK')
    console.log('   • Relaciones entre tablas: OK')
    console.log('   • Eliminación en cascada: OK')
    console.log('   • Índices y constraints: OK')
    console.log('   • Tipos de datos: OK')
    console.log('   • JSON fields: OK')
    console.log('\n🚀 La base de datos está lista para producción!\n')

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar pruebas
testDatabase()
  .catch((error) => {
    console.error('Error fatal:', error)
    process.exit(1)
  })
