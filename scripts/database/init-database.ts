import { initDatabase } from '../lib/database'

async function main() {
  console.log('🚀 Initializing database...')

  try {
    await initDatabase()
    console.log('✅ Database initialized successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  }
}

main()
