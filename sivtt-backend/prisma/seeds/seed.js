import { createRequire } from 'module';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// 1. Cargar variables de entorno para acceder a DATABASE_URL
dotenv.config();

// 2. Importar PrismaClient usando createRequire (Fix para Node 22 ESM)
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');

// 3. Configurar el Adaptador (Igual que en tu database.js)
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 4. Instanciar Prisma CON el adaptador (Esto soluciona tu error)
const prisma = new PrismaClient({ 
  adapter 
});


async function main() {
  console.log('🌱 Iniciando el proceso de seeding...');

  // 0. Limpiar base de datos (Orden inverso a las relaciones)
  await prisma.participanteReunion.deleteMany();
  await prisma.reunionActividad.deleteMany();
  await prisma.evidenciaActividad.deleteMany();
  await prisma.historialActividad.deleteMany();
  await prisma.usuarioActividad.deleteMany();
  await prisma.actividadFase.deleteMany();
  await prisma.decisionFase.deleteMany();
  await prisma.postulacionGrupo.deleteMany();
  await prisma.convocatoria.deleteMany();
  await prisma.miembroGrupo.deleteMany();
  await prisma.grupoInvestigacion.deleteMany();
  await prisma.retoTecnologico.deleteMany();
  await prisma.procesoEmpresa.deleteMany();
  await prisma.empresa.deleteMany();
  await prisma.faseProceso.deleteMany();
  await prisma.procesoUsuario.deleteMany();
  await prisma.procesoVinculacion.deleteMany();
  await prisma.usuarioRol.deleteMany();
  await prisma.rol.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('✅ Base de datos limpia.');

  // 1. Crear Roles del Sistema
  const roles = await Promise.all([
    prisma.rol.create({ data: { codigo: 'ADMIN_SISTEMA', nombre: 'Administrador del Sistema' } }),
    prisma.rol.create({ data: { codigo: 'GESTOR_VINCULACION', nombre: 'Gestor de Vinculación' } }),
    prisma.rol.create({ data: { codigo: 'INVESTIGADOR', nombre: 'Investigador Principal' } }),
    prisma.rol.create({ data: { codigo: 'REVISOR', nombre: 'Revisor Técnico' } }),
    prisma.rol.create({ data: { codigo: 'EMPRESA', nombre: 'Representante de Empresa' } }),
  ]);

  // 2. Crear Usuarios
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('eduardo', salt);

  const uBryan = await prisma.usuario.create({
    data: {
      nombres: 'Bryan',
      apellidos: 'Alvarez Osorio',
      email: 'balvarez@unsa.edu.pe',
      password: passwordHash,
      roles: { create: { rolId: roles[0].id } }
    }
  });

  const uEduardo = await prisma.usuario.create({
    data: {
      nombres: 'Eduardo',
      apellidos: 'Perez',
      email: 'eperez@unsa.edu.pe',
      password: passwordHash,
      roles: { create: { rolId: roles[1].id } }
    }
  });

  const uCristhian = await prisma.usuario.create({
    data: {
      nombres: 'Cristhian',
      apellidos: 'Rodriguez',
      email: 'crodriguez@unsa.edu.pe',
      password: passwordHash,
      roles: { create: { rolId: roles[2].id } }
    }
  });

  // 3. Crear Empresas
  const eMineria = await prisma.empresa.create({
    data: {
      razonSocial: 'Minería Global S.A.C.',
      ruc: '20123456789',
      sector: 'MINERIA',
      verificada: true,
      contactoPrincipal: 'Ing. Marco Polo'
    }
  });

  // ============================================================
  // PROCESO 1: PATENTE (Flujo de maduración técnica)
  // ============================================================
  const pPatente = await prisma.procesoVinculacion.create({
    data: {
      codigo: 'PROC-2026-001',
      tipoActivo: 'PATENTE',
      sistemaOrigen: 'CRIS-UNSA',
      evaluacionId: 1001,
      titulo: 'Sistema de Purificación de Agua con Grafeno',
      descripcion: 'Tecnología de filtrado de metales pesados para minería.',
      trlInicial: 2,
      trlActual: 4,
      estado: 'ACTIVO',
      faseActual: 'MATCH',
      usuarios: {
        create: [
          { usuarioId: uBryan.id, rolProceso: 'RESPONSABLE_PROCESO' },
          { usuarioId: uEduardo.id, rolProceso: 'APOYO' }
        ]
      }
    }
  });

  // Fases del Proceso 1
  const faseMatch = await prisma.faseProceso.create({
    data: {
      procesoId: pPatente.id,
      fase: 'MATCH',
      estado: 'ABIERTA',
      responsableId: uBryan.id
    }
  });

  // Actividad y Evidencia
  const actNDA = await prisma.actividadFase.create({
    data: {
      procesoId: pPatente.id,
      fase: 'MATCH',
      faseProcesoId: faseMatch.id,
      tipo: 'DOCUMENTO',
      nombre: 'Firma de NDA con socio estratégico',
      estado: 'EN_REVISION',
      obligatoria: true,
      asignaciones: {
        create: { usuarioId: uBryan.id, rol: 'RESPONSABLE' }
      }
    }
  });

  await prisma.evidenciaActividad.create({
    data: {
      actividadId: actNDA.id,
      tipoEvidencia: 'DOCUMENTO',
      nombreArchivo: 'NDA_MineriaGlobal_V1.pdf',
      urlArchivo: 'https://storage.unsa.edu.pe/ndas/123.pdf',
      fase: 'MATCH',
      subidoPorId: uBryan.id,
      estado: 'PENDIENTE'
    }
  });

  // Vincular Empresa a la Patente
  await prisma.procesoEmpresa.create({
    data: {
      procesoId: pPatente.id,
      empresaId: eMineria.id,
      rolEmpresa: 'INTERESADA',
      interesConfirmado: true,
      estado: 'ACTIVA'
    }
  });

  // ============================================================
  // PROCESO 2: REQUERIMIENTO (Innovación Abierta)
  // ============================================================
  const pReq = await prisma.procesoVinculacion.create({
    data: {
      codigo: 'PROC-2026-002',
      tipoActivo: 'REQUERIMIENTO_EMPRESARIAL',
      sistemaOrigen: 'SIRI-EMPRESAS',
      evaluacionId: 2002,
      titulo: 'Optimización Energética de Molinos de Bolas',
      estado: 'ACTIVO',
      faseActual: 'SELECCION',
      usuarios: {
        create: { usuarioId: uEduardo.id, rolProceso: 'RESPONSABLE_PROCESO' }
      }
    }
  });

  const faseSeleccion = await prisma.faseProceso.create({
    data: {
      procesoId: pReq.id,
      fase: 'SELECCION',
      estado: 'ABIERTA'
    }
  });

  // Crear Reto Tecnológico
  const reto = await prisma.retoTecnologico.create({
    data: {
      procesoId: pReq.id,
      titulo: 'Eficiencia en Molinos',
      problema: 'Alto consumo eléctrico en hora punta.',
      descripcion: 'Buscamos algoritmos de IA para optimizar carga.',
      fichaTecnica: { motores: "Siemens 500HP", capacidad: "20 Ton/h" },
      prioridad: 1
    }
  });

  // Crear Convocatoria
  const convocatoria = await prisma.convocatoria.create({
    data: {
      retoId: reto.id,
      codigo: 'CONV-2026-01',
      titulo: 'Call for Solutions: IA Minera',
      descripcion: 'Bases del concurso para grupos investigadores.',
      estatus: 'PUBLICADA',
      fechaApertura: new Date(),
      fechaCierre: new Date(new Date().getTime() + 1000*60*60*24*30), // +30 días
      criteriosSeleccion: { tecnico: 60, economico: 40 }
    }
  });

  // Crear Grupo de Investigación y Postulación
  const grupoAI = await prisma.grupoInvestigacion.create({
    data: {
      codigo: 'GI-AI-01',
      nombre: 'Grupo de Inteligencia Artificial Aplicada',
      facultad: 'Sistemas',
      coordinador: 'Dr. Alan Turing',
      email: 'ai.grupo@unsa.edu.pe',
      miembros: {
        create: { nombre: 'Cristhian Rodriguez', rol: 'Investigador', email: 'crodriguez@unsa.edu.pe' }
      }
    }
  });

  await prisma.postulacionGrupo.create({
    data: {
      retoId: reto.id,
      grupoId: grupoAI.id,
      convocatoriaId: convocatoria.id,
      notaInteres: 'Propuesta basada en Deep Learning.',
      capacidadesTecnicas: 'Laboratorio de supercomputación disponible.',
      propuestaTecnica: 'Nuestra solución reduce el consumo en 12%...',
      presupuestoEstimado: 45000.00
    }
  });

  // 4. Auditoría base (Historial de creación)
  await prisma.historialEstadoProceso.createMany({
    data: [
      { procesoId: pPatente.id, estadoNuevo: 'ACTIVO', modificadoPor: uBryan.id, motivo: 'Creación inicial' },
      { procesoId: pReq.id, estadoNuevo: 'ACTIVO', modificadoPor: uEduardo.id, motivo: 'Requerimiento de empresa minera' }
    ]
  });

  console.log('🚀 Seeding completado con éxito.');
  console.log(`
    CREDENTIALS PARA PRUEBAS:
    ------------------------
    Admin: balvarez@unsa.edu.pe / Admin123!
    Gestor: eperez@unsa.edu.pe / Admin123!
    Investigador: crodriguez@unsa.edu.pe / Admin123!
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });