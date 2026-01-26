import app from './app.js';
import prisma from './config/database.js';
import { config } from './config/env.js';

// Función de arranque asíncrona
const startServer = async () => {
  try {
    // 1. Verificar conexión a Base de Datos
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL');

    // 2. Iniciar el servidor Express
    const server = app.listen(config.port, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${config.port}/api/v1`);
      console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

    // 3. Manejo de cierre elegante (Graceful Shutdown)
    const shutdown = async () => {
      console.log('🛑 Cerrando servidor...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Base de datos desconectada. Proceso terminado.');
        process.exit(0);
      });
    };

    // Escuchar señales de terminación (Ctrl+C, Docker stop, etc.)
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();