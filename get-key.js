const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      include: {
        company: {
          select: {
            name: true,
          }
        }
      }
    })

    if (apiKeys.length === 0) {
      console.log('No hay API Keys. Creando una nueva...\n')

      // Buscar empresa
      const company = await prisma.company.findFirst()

      if (!company) {
        console.log('ERROR: No hay empresas creadas. Ejecuta: npm run prisma:seed')
        return
      }

      // Crear nueva API Key
      const newKey = await prisma.apiKey.create({
        data: {
          companyId: company.id,
          key: `ak_${Buffer.from(`${company.id}-${Date.now()}`).toString('base64')}`,
          name: 'API Key para Vercel',
          permissions: {
            products: ['read'],
            leads: ['create'],
          },
          isActive: true,
        }
      })

      console.log('✅ NUEVA API KEY CREADA:')
      console.log(newKey.key)
      console.log('\nCopia este valor en Vercel para WATER_CRM_API_KEY')
    } else {
      console.log('🔑 API KEYS ENCONTRADAS:\n')
      apiKeys.forEach((key) => {
        console.log('━'.repeat(60))
        console.log(`Empresa: ${key.company.name}`)
        console.log(`Nombre: ${key.name}`)
        console.log(`API Key: ${key.key}`)
        console.log('━'.repeat(60))
        console.log('')
      })
      console.log('\n⚠️  Copia el API Key de arriba y úsalo en Vercel para WATER_CRM_API_KEY')
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
