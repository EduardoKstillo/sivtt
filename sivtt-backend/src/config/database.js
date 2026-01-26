// src/config/database.js

// IMPORTS
import { createRequire } from 'module';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Workaround requerido por Prisma 7 en ESM
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');

// Configuración PostgreSQL
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// Singleton para evitar múltiples instancias en desarrollo
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Funciones de conexión
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Base de datos conectada');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await prisma.$disconnect();
  console.log('🔌 Base de datos desconectada');
}

export default prisma;
