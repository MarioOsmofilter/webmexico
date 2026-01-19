import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔑 Consultando API Keys...\n')

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
    console.log('❌ No hay API Keys creadas aún.')
    console.log('💡 Ejecuta: npm run prisma:seed para crear una.\n')
    return
  }

  apiKeys.forEach((apiKey) => {
    console.log('━'.repeat(60))
    console.log(`📋 Nombre: ${apiKey.name}`)
    console.log(`🏢 Empresa: ${apiKey.company.name}`)
    console.log(`🔑 API Key: ${apiKey.key}`)
    console.log(`✅ Activa: ${apiKey.isActive ? 'Sí' : 'No'}`)
    console.log(`📅 Último uso: ${apiKey.lastUsedAt || 'Nunca'}`)
    console.log(`🔐 Permisos:`, JSON.stringify(apiKey.permissions, null, 2))
    console.log('━'.repeat(60))
    console.log('')
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
