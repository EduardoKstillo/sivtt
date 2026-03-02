import { createRequire } from 'module';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function dias(n) { return new Date(Date.now() + n * 86_400_000); }

async function main() {
  console.log('🧹 1. Limpiando base de datos...');
  await prisma.historialActividad.deleteMany();
  await prisma.historialFaseProceso.deleteMany();
  await prisma.historialEstadoProceso.deleteMany();
  await prisma.evidenciaActividad.deleteMany();
  await prisma.requisitoActividad.deleteMany();
  await prisma.usuarioActividad.deleteMany();
  await prisma.actividadFase.deleteMany();
  await prisma.faseProceso.deleteMany();
  await prisma.procesoUsuario.deleteMany();
  await prisma.procesoVinculacion.deleteMany();
  await prisma.rolPermiso.deleteMany();
  await prisma.usuarioRol.deleteMany();
  await prisma.permiso.deleteMany();
  await prisma.rol.deleteMany();
  await prisma.usuario.deleteMany();
  console.log('✅ Base limpia.\n');

  // ============================================================
  // 1. DICCIONARIO DE PERMISOS
  // ============================================================
  console.log('🔑 2. Generando permisos estructurados...');

  const permisosData = [
    // SISTEMA
    { codigo: 'acceso:basico',      modulo: 'SISTEMA', descripcion: 'Acceso mínimo al portal' },
    { codigo: 'ver:todo',           modulo: 'SISTEMA', descripcion: 'Pase libre de lectura global' },
    { codigo: 'ver:dashboard',      modulo: 'SISTEMA', descripcion: 'Ver métricas globales' },
    { codigo: 'gestionar:usuarios', modulo: 'SISTEMA', descripcion: 'Administrar usuarios y roles' },
    { codigo: 'crear:proceso',      modulo: 'SISTEMA', descripcion: 'Iniciar nuevos procesos de vinculación' },
    
    // PROCESO
    { codigo: 'ver:proceso',        modulo: 'PROCESO', descripcion: 'Ver detalles del proceso' },
    { codigo: 'editar:proceso',     modulo: 'PROCESO', descripcion: 'Alterar cabecera, estados y saltar fases' },
    { codigo: 'gestionar:fases',    modulo: 'PROCESO', descripcion: 'Gestionar el flujo de la fase asignada' },
    { codigo: 'asignar:equipo',     modulo: 'PROCESO', descripcion: 'Agregar usuarios al proceso' },
    
    // ACTIVIDAD
    { codigo: 'ver:actividad',      modulo: 'ACTIVIDAD', descripcion: 'Ver detalle de la actividad' },
    { codigo: 'crear:actividad',    modulo: 'ACTIVIDAD', descripcion: 'Crear nuevas actividades' },
    { codigo: 'editar:actividad',   modulo: 'ACTIVIDAD', descripcion: 'Modificar fechas y datos de actividad' },
    { codigo: 'eliminar:actividad', modulo: 'ACTIVIDAD', descripcion: 'Borrar actividades' },
    
    // EVIDENCIAS
    { codigo: 'subir:evidencia',    modulo: 'EVIDENCIAS', descripcion: 'Cargar entregables' },
    { codigo: 'aprobar:evidencia',  modulo: 'EVIDENCIAS', descripcion: 'Visto bueno a entregables' },
    { codigo: 'rechazar:evidencia', modulo: 'EVIDENCIAS', descripcion: 'Observar entregables' },
  ];

  const permisosMap = new Map();
  for (const p of permisosData) {
    const creado = await prisma.permiso.upsert({ where: { codigo: p.codigo }, update: p, create: p });
    permisosMap.set(creado.codigo, creado.id);
  }

  // ============================================================
  // 2. ROLES (Globales y Contextuales)
  // ============================================================
  console.log('🎭 3. Construyendo Roles...');

  const rolesData = [
    // --- Nivel SISTEMA ---
    {
      nombre: 'Administrador del Sistema', codigo: 'ADMIN_SISTEMA', ambito: 'SISTEMA',
      permisos: ['acceso:basico', 'ver:todo', 'ver:dashboard', 'gestionar:usuarios', 'crear:proceso']
    },
    {
      nombre: 'Coordinador de Portafolio', codigo: 'COORDINADOR_PORTAFOLIO', ambito: 'SISTEMA',
      permisos: ['acceso:basico', 'ver:dashboard', 'crear:proceso'] // <--- Tu Perfil 1
    },
    {
      nombre: 'Observador Global', codigo: 'OBSERVADOR_GLOBAL', ambito: 'SISTEMA',
      permisos: ['acceso:basico', 'ver:todo', 'ver:dashboard'] // <--- Tu Perfil 4
    },
    {
      nombre: 'Usuario Estándar', codigo: 'USUARIO_ESTANDAR', ambito: 'SISTEMA',
      permisos: ['acceso:basico'] // <--- Base para Perfiles 2 y 3
    },

    // --- Nivel PROCESO ---
    {
      nombre: 'Gestor de Vinculación', codigo: 'GESTOR_VINCULACION', ambito: 'PROCESO',
      permisos: ['ver:proceso', 'editar:proceso', 'gestionar:fases', 'asignar:equipo', 'ver:actividad', 'crear:actividad', 'editar:actividad', 'eliminar:actividad']
    },
    {
      nombre: 'Especialista de Proceso', codigo: 'ESPECIALISTA_PROCESO', ambito: 'PROCESO',
      permisos: ['ver:proceso', 'gestionar:fases', 'ver:actividad', 'crear:actividad'] // <--- Tu Perfil 2 (Líder de Fase)
    },

    // --- Nivel ACTIVIDAD ---
    {
      nombre: 'Responsable de Tarea', codigo: 'RESPONSABLE_TAREA', ambito: 'ACTIVIDAD',
      permisos: ['ver:actividad', 'subir:evidencia'] // <--- Tu Perfil 3 (Ejecutor Aislado)
    },
    {
      nombre: 'Revisor de Tareas', codigo: 'REVISOR_TAREA', ambito: 'ACTIVIDAD',
      permisos: ['ver:actividad', 'aprobar:evidencia', 'rechazar:evidencia']
    }
  ];

  const rolesMap = new Map();
  for (const r of rolesData) {
    const dbRol = await prisma.rol.upsert({
      where: { codigo: r.codigo }, update: { nombre: r.nombre, ambito: r.ambito },
      create: { nombre: r.nombre, codigo: r.codigo, ambito: r.ambito }
    });
    rolesMap.set(r.codigo, dbRol.id);
    for (const pCodigo of r.permisos) {
      await prisma.rolPermiso.upsert({
        where: { rolId_permisoId: { rolId: dbRol.id, permisoId: permisosMap.get(pCodigo) } },
        update: {}, create: { rolId: dbRol.id, permisoId: permisosMap.get(pCodigo) }
      });
    }
  }

  // ============================================================
  // 3. USUARIOS (Tus 4 Perfiles)
  // ============================================================
  console.log('👤 4. Registrando Usuarios...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Sivtt2026*', salt);

  const uAdmin = await prisma.usuario.create({
    data: { nombres: 'Admin', apellidos: 'Sistemas', email: 'admin@unsa.edu.pe', password: passwordHash, roles: { create: { rolId: rolesMap.get('ADMIN_SISTEMA') } } }
  });

  // Perfil 1: Coordinador (Puede crear procesos)
  const uCoordinador = await prisma.usuario.create({
    data: { nombres: 'Bryan', apellidos: 'Alvarez', email: 'balvarez@unsa.edu.pe', password: passwordHash, roles: { create: { rolId: rolesMap.get('COORDINADOR_PORTAFOLIO') } } }
  });

  // Perfil 2: Líder de Fase (Ve proceso, gestiona su fase, NO edita proyecto)
  const uEspecialista = await prisma.usuario.create({
    data: { nombres: 'Eduardo', apellidos: 'Becerra', email: 'ebecerra@unsa.edu.pe', password: passwordHash, roles: { create: { rolId: rolesMap.get('USUARIO_ESTANDAR') } } }
  });

  // Perfil 3: Ejecutor Aislado (Solo ve su tarea)
  const uTecnico = await prisma.usuario.create({
    data: { nombres: 'Lucia', apellidos: 'Torres', email: 'ltorres@unsa.edu.pe', password: passwordHash, roles: { create: { rolId: rolesMap.get('USUARIO_ESTANDAR') } } }
  });

  // Perfil 4: Observador (Ve todo, no toca nada)
  const uDirector = await prisma.usuario.create({
    data: { nombres: 'Marco', apellidos: 'Director', email: 'mdirector@unsa.edu.pe', password: passwordHash, roles: { create: { rolId: rolesMap.get('OBSERVADOR_GLOBAL') } } }
  });

  // ============================================================
  // 4. CASOS DE PRUEBA: ESCENARIO REAL
  // ============================================================
  console.log('📋 5. Generando Escenarios de Prueba...');

  // --- PROCESO 1: Creado por Coordinador ---
  const proceso1 = await prisma.procesoVinculacion.create({
    data: {
      codigo: 'PROC-2026-001', tipoActivo: 'PATENTE', sistemaOrigen: 'CRIS-UNSA', evaluacionId: 101,
      titulo: 'Purificador de Grafeno', estado: 'ACTIVO', faseActual: 'CARACTERIZACION'
    }
  });

  // Bryan (Coordinador) se auto-asigna como GESTOR del proceso que creó
  await prisma.procesoUsuario.create({
    data: { procesoId: proceso1.id, usuarioId: uCoordinador.id, rolId: rolesMap.get('GESTOR_VINCULACION') }
  });

  // Bryan asigna a Eduardo como ESPECIALISTA (Líder) para que vea el proceso y cree tareas
  await prisma.procesoUsuario.create({
    data: { procesoId: proceso1.id, usuarioId: uEspecialista.id, rolId: rolesMap.get('ESPECIALISTA_PROCESO') }
  });

  const faseCarac = await prisma.faseProceso.create({
    data: { procesoId: proceso1.id, fase: 'CARACTERIZACION', estado: 'ABIERTA', responsableId: uEspecialista.id }
  });

  // Actividad 1: Asignada a Lucía (Ella solo verá esto, no el proceso completo)
  const act1 = await prisma.actividadFase.create({
    data: {
      procesoId: proceso1.id, fase: 'CARACTERIZACION', faseProcesoId: faseCarac.id,
      tipo: 'DOCUMENTO', nombre: 'Subir memoria descriptiva', estado: 'EN_PROGRESO', obligatoria: true
    }
  });

  // Lucía es RESPONSABLE (Sube)
  await prisma.usuarioActividad.create({
    data: { actividadId: act1.id, usuarioId: uTecnico.id, rolId: rolesMap.get('RESPONSABLE_TAREA') }
  });
  // Eduardo es REVISOR (Aprueba/Rechaza)
  await prisma.usuarioActividad.create({
    data: { actividadId: act1.id, usuarioId: uEspecialista.id, rolId: rolesMap.get('REVISOR_TAREA') }
  });

  const req1 = await prisma.requisitoActividad.create({
    data: { actividadId: act1.id, nombre: 'PDF Memoria', obligatorio: true }
  });

  // --- PROCESO 2: Aislado ---
  const proceso2 = await prisma.procesoVinculacion.create({
    data: {
      codigo: 'PROC-2026-002', tipoActivo: 'REQUERIMIENTO_EMPRESARIAL', sistemaOrigen: 'SIRI', evaluacionId: 202,
      titulo: 'Optimización de Motores', estado: 'ACTIVO', faseActual: 'SELECCION'
    }
  });
  
  // Aquí Bryan es gestor, pero Eduardo NO está invitado. Eduardo recibirá 403 si intenta entrar.
  await prisma.procesoUsuario.create({
    data: { procesoId: proceso2.id, usuarioId: uCoordinador.id, rolId: rolesMap.get('GESTOR_VINCULACION') }
  });

  console.log(`
  ======================================================
  ✅ SISTEMA ReBAC INICIALIZADO (Password para todos: Sivtt2026*)
  ======================================================
  1. balvarez@unsa.edu.pe (Coordinador) -> Puede crear procesos. Es dueño del Proceso 1 y 2.
  2. ebecerra@unsa.edu.pe (Especialista) -> Ve Proceso 1, gestiona su fase. NO ve el Proceso 2.
  3. ltorres@unsa.edu.pe  (Técnica)      -> NO ve procesos. Solo ve la Actividad 1 ("Subir memoria").
  4. mdirector@unsa.edu.pe(Director)     -> Ve TODO el sistema, pero no tiene botones de editar/crear.
  ======================================================
  `);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });