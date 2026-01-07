import { PrismaClient, UserRole, CompanyStatus, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Limpiando datos existentes...')
    await prisma.activityLog.deleteMany()
    await prisma.userPermission.deleteMany()
    await prisma.userHierarchy.deleteMany()
    await prisma.user.deleteMany()
    await prisma.company.deleteMany()
  }

  // Crear Superadmin
  console.log('👑 Creando Superadmin...')
  const hashedPassword = await bcrypt.hash('Admin123!', 10)

  const superadmin = await prisma.user.create({
    data: {
      email: 'superadmin@watercrm.com',
      passwordHash: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
      forcePasswordChange: false,
      company: {
        create: {
          name: 'Water CRM - Central',
          slug: 'central',
          subdomain: 'admin',
          status: CompanyStatus.ACTIVE,
        }
      }
    },
    include: {
      company: true
    }
  })

  console.log('✅ Superadmin creado:')
  console.log(`   Email: ${superadmin.email}`)
  console.log(`   Contraseña: Admin123!`)
  console.log(`   Empresa: ${superadmin.company.name}`)

  // Crear empresa de ejemplo
  console.log('\n🏢 Creando empresa de ejemplo...')

  const demoCompany = await prisma.company.create({
    data: {
      name: 'Aguas Puras S.L.',
      slug: 'aguas-puras',
      subdomain: 'aguas-puras',
      status: CompanyStatus.ACTIVE,
      superadminId: superadmin.id,
    }
  })

  // Crear Admin de la empresa
  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@aguaspuras.com',
      passwordHash: adminPassword,
      firstName: 'Juan',
      lastName: 'García',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      forcePasswordChange: true,
      companyId: demoCompany.id,
    }
  })

  console.log('✅ Admin de empresa creado:')
  console.log(`   Email: ${admin.email}`)
  console.log(`   Contraseña: Admin123! (debe cambiarla en primer login)`)

  // Crear Director Comercial
  const directorPassword = await bcrypt.hash('Director123!', 10)
  const directorSales = await prisma.user.create({
    data: {
      email: 'director.comercial@aguaspuras.com',
      passwordHash: directorPassword,
      firstName: 'María',
      lastName: 'López',
      role: UserRole.DIRECTOR_SALES,
      status: UserStatus.ACTIVE,
      forcePasswordChange: true,
      companyId: demoCompany.id,
    }
  })

  console.log('✅ Director Comercial creado:')
  console.log(`   Email: ${directorSales.email}`)

  // Crear Comerciales
  const commercial1 = await prisma.user.create({
    data: {
      email: 'comercial1@aguaspuras.com',
      passwordHash: await bcrypt.hash('Comercial123!', 10),
      firstName: 'Pedro',
      lastName: 'Martínez',
      role: UserRole.SALES,
      status: UserStatus.ACTIVE,
      forcePasswordChange: true,
      companyId: demoCompany.id,
    }
  })

  const commercial2 = await prisma.user.create({
    data: {
      email: 'comercial2@aguaspuras.com',
      passwordHash: await bcrypt.hash('Comercial123!', 10),
      firstName: 'Ana',
      lastName: 'Rodríguez',
      role: UserRole.SALES,
      status: UserStatus.ACTIVE,
      forcePasswordChange: true,
      companyId: demoCompany.id,
    }
  })

  // Establecer jerarquía
  await prisma.userHierarchy.createMany({
    data: [
      {
        userId: commercial1.id,
        supervisorId: directorSales.id,
        companyId: demoCompany.id,
      },
      {
        userId: commercial2.id,
        supervisorId: directorSales.id,
        companyId: demoCompany.id,
      }
    ]
  })

  console.log('✅ Comerciales creados y asignados al director')

  // Crear Director de Instalaciones
  const directorTech = await prisma.user.create({
    data: {
      email: 'director.instalaciones@aguaspuras.com',
      passwordHash: await bcrypt.hash('Director123!', 10),
      firstName: 'Carlos',
      lastName: 'Sánchez',
      role: UserRole.DIRECTOR_INSTALLATIONS,
      status: UserStatus.ACTIVE,
      forcePasswordChange: true,
      companyId: demoCompany.id,
    }
  })

  // Crear Instalador
  const technician = await prisma.user.create({
    data: {
      email: 'instalador1@aguaspuras.com',
      passwordHash: await bcrypt.hash('Tecnico123!', 10),
      firstName: 'Luis',
      lastName: 'Fernández',
      role: UserRole.TECHNICIAN,
      status: UserStatus.ACTIVE,
      forcePasswordChange: true,
      companyId: demoCompany.id,
    }
  })

  // Jerarquía instaladores
  await prisma.userHierarchy.create({
    data: {
      userId: technician.id,
      supervisorId: directorTech.id,
      companyId: demoCompany.id,
    }
  })

  console.log('✅ Equipo de instalaciones creado')

  // Crear usuario de Marketing
  const marketing = await prisma.user.create({
    data: {
      email: 'marketing@aguaspuras.com',
      passwordHash: await bcrypt.hash('Marketing123!', 10),
      firstName: 'Laura',
      lastName: 'Pérez',
      role: UserRole.MARKETING,
      status: UserStatus.ACTIVE,
      forcePasswordChange: true,
      companyId: demoCompany.id,
    }
  })

  console.log('✅ Usuario de marketing creado')

  // Crear usuario de Almacén
  const warehouse = await prisma.user.create({
    data: {
      email: 'almacen@aguaspuras.com',
      passwordHash: await bcrypt.hash('Almacen123!', 10),
      firstName: 'Jorge',
      lastName: 'Torres',
      role: UserRole.WAREHOUSE,
      status: UserStatus.ACTIVE,
      forcePasswordChange: true,
      companyId: demoCompany.id,
    }
  })

  console.log('✅ Usuario de almacén creado')

  // Crear almacén central
  const centralWarehouse = await prisma.warehouse.create({
    data: {
      name: 'Almacén Central',
      location: 'Polígono Industrial, Nave 5',
      warehouseType: 'CENTRAL',
      companyId: demoCompany.id,
      managerUserId: warehouse.id,
    }
  })

  console.log('✅ Almacén central creado')

  // Crear categorías de productos
  const categoryFilter = await prisma.productCategory.create({
    data: {
      name: 'Filtros y Purificadores',
      companyId: null, // Categoría global del superadmin
      order: 1,
    }
  })

  const categoryAccessory = await prisma.productCategory.create({
    data: {
      name: 'Accesorios',
      companyId: null,
      order: 2,
    }
  })

  console.log('✅ Categorías de productos creadas')

  // Crear productos maestros (del superadmin)
  const product1 = await prisma.product.create({
    data: {
      name: 'Purificador de Agua Modelo Pro-500',
      description: 'Sistema de purificación de agua por ósmosis inversa de 5 etapas. Capacidad 500L/día.',
      internalReference: 'PRO-500',
      manufacturerReference: 'OSM-PRO500-2024',
      categoryId: categoryFilter.id,
      basePrice: 599.99,
      isMaster: true,
      status: 'ACTIVE',
      companyId: null, // Producto maestro
    }
  })

  // Crear precios para el producto
  await prisma.productPrice.create({
    data: {
      productId: product1.id,
      salePrice1: 599.99,
      salePrice12: 650.00,
      salePrice24: 700.00,
      salePrice36: 750.00,
      rentalPrice12: 45.00,
      rentalPrice24: 40.00,
      rentalPrice36: 35.00,
      minPriceThreshold: 500.00,
    }
  })

  const product2 = await prisma.product.create({
    data: {
      name: 'Filtro de Sedimentos Estándar',
      description: 'Filtro de sedimentos de 5 micras. Compatible con la mayoría de sistemas.',
      internalReference: 'FILT-SED-5',
      manufacturerReference: 'FS-STD-5M',
      categoryId: categoryAccessory.id,
      basePrice: 12.50,
      isMaster: true,
      status: 'ACTIVE',
      companyId: null,
    }
  })

  await prisma.productPrice.create({
    data: {
      productId: product2.id,
      salePrice1: 12.50,
      minPriceThreshold: 10.00,
    }
  })

  console.log('✅ Productos maestros creados')

  // Crear API Key para la empresa demo
  const apiKey = await prisma.apiKey.create({
    data: {
      companyId: demoCompany.id,
      key: `ak_${Buffer.from(`${demoCompany.id}-${Date.now()}`).toString('base64')}`,
      name: 'API Key para Web',
      permissions: {
        products: ['read'],
        leads: ['create'],
      },
      isActive: true,
    }
  })

  console.log('✅ API Key creada para integraciones web')

  console.log('\n' + '='.repeat(60))
  console.log('🎉 Seed completado exitosamente!')
  console.log('='.repeat(60))
  console.log('\n📋 CREDENCIALES DE ACCESO:\n')
  console.log('SUPERADMIN:')
  console.log(`  Email: superadmin@watercrm.com`)
  console.log(`  Contraseña: Admin123!\n`)
  console.log('ADMIN (Aguas Puras):')
  console.log(`  Email: admin@aguaspuras.com`)
  console.log(`  Contraseña: Admin123! (cambio obligatorio)\n`)
  console.log('DIRECTOR COMERCIAL:')
  console.log(`  Email: director.comercial@aguaspuras.com`)
  console.log(`  Contraseña: Director123!\n`)
  console.log('COMERCIAL:')
  console.log(`  Email: comercial1@aguaspuras.com`)
  console.log(`  Contraseña: Comercial123!\n`)
  console.log('INSTALADOR:')
  console.log(`  Email: instalador1@aguaspuras.com`)
  console.log(`  Contraseña: Tecnico123!\n`)
  console.log('MARKETING:')
  console.log(`  Email: marketing@aguaspuras.com`)
  console.log(`  Contraseña: Marketing123!\n`)
  console.log('ALMACÉN:')
  console.log(`  Email: almacen@aguaspuras.com`)
  console.log(`  Contraseña: Almacen123!\n`)
  console.log('API KEY:')
  console.log(`  ${apiKey.key}`)
  console.log('\n' + '='.repeat(60))
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
