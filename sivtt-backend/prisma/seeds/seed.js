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
  console.log('🧹 1. Limpiando base de datos (orden inverso de dependencias)...');
  await prisma.historialActividad.deleteMany();
  await prisma.historialEmpresaProceso.deleteMany();
  await prisma.historialFaseProceso.deleteMany();
  await prisma.historialEstadoProceso.deleteMany();
  await prisma.historialTRL.deleteMany();
  await prisma.participanteReunion.deleteMany();
  await prisma.reunionActividad.deleteMany();
  await prisma.evidenciaActividad.deleteMany();
  await prisma.requisitoActividad.deleteMany();
  await prisma.usuarioActividad.deleteMany();
  await prisma.decisionFase.deleteMany();
  await prisma.actividadFase.deleteMany();
  await prisma.faseProceso.deleteMany();
  await prisma.postulacionGrupo.deleteMany();
  await prisma.convocatoria.deleteMany();
  await prisma.retoTecnologico.deleteMany();
  await prisma.financiamiento.deleteMany();
  await prisma.procesoEmpresa.deleteMany();
  await prisma.empresa.deleteMany();
  await prisma.procesoUsuario.deleteMany();
  await prisma.procesoVinculacion.deleteMany();
  await prisma.miembroGrupo.deleteMany();
  await prisma.grupoInvestigacion.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.rolPermiso.deleteMany();
  await prisma.usuarioRol.deleteMany();
  await prisma.permiso.deleteMany();
  await prisma.rol.deleteMany();
  await prisma.usuario.deleteMany();
  console.log('✅ Base limpia.\n');

  // ============================================================
  // 1. DICCIONARIO DE PERMISOS DEFINITIVO
  // ============================================================
  console.log('🔑 2. Generando matriz de permisos...');

  const permisosData = [
    // --- SISTEMA (Globales) ---
    { codigo: 'acceso:basico',       modulo: 'SISTEMA', descripcion: 'Acceso mínimo (Login, Perfil)' },
    { codigo: 'ver:todo',            modulo: 'SISTEMA', descripcion: 'Pase libre de solo lectura a toda la BD' },
    { codigo: 'ver:dashboard',       modulo: 'SISTEMA', descripcion: 'Ver métricas e indicadores globales' },
    { codigo: 'ver:procesos',        modulo: 'SISTEMA', descripcion: 'Ver listados generales de Procesos y Empresas' },
    { codigo: 'ver:convocatorias',   modulo: 'SISTEMA', descripcion: 'Ver listados generales de Retos y Grupos' },
    { codigo: 'gestionar:usuarios',  modulo: 'SISTEMA', descripcion: 'Crear, editar y desactivar usuarios y roles' },
    { codigo: 'crear:proceso',       modulo: 'SISTEMA', descripcion: 'Iniciar un nuevo proceso de vinculación' },
    { codigo: 'gestionar:empresas',  modulo: 'SISTEMA', descripcion: 'Crear, editar y verificar empresas en el catálogo global' },
    
    // --- PROCESO (Contextuales) ---
    { codigo: 'ver:proceso',         modulo: 'PROCESO', descripcion: 'Ver el detalle de un proceso específico' },
    { codigo: 'editar:proceso',      modulo: 'PROCESO', descripcion: 'Modificar cabecera, cambiar estado y TRL' },
    { codigo: 'gestionar:fases',     modulo: 'PROCESO', descripcion: 'Abrir, cerrar o retroceder fases' },
    { codigo: 'asignar:equipo',      modulo: 'PROCESO', descripcion: 'Agregar usuarios al equipo del proyecto' },
    
    // --- ACTIVIDAD (Contextuales) ---
    { codigo: 'ver:actividad',       modulo: 'ACTIVIDAD', descripcion: 'Ver detalles de una tarea' },
    { codigo: 'crear:actividad',     modulo: 'ACTIVIDAD', descripcion: 'Añadir nuevas tareas a una fase' },
    { codigo: 'editar:actividad',    modulo: 'ACTIVIDAD', descripcion: 'Modificar info y estado de la tarea' },
    { codigo: 'eliminar:actividad',  modulo: 'ACTIVIDAD', descripcion: 'Borrar una tarea' },
    
    // --- EVIDENCIAS (Contextuales) ---
    { codigo: 'subir:evidencia',     modulo: 'EVIDENCIAS', descripcion: 'Subir archivos y links' },
    { codigo: 'aprobar:evidencia',   modulo: 'EVIDENCIAS', descripcion: 'Dar visto bueno a evidencias' },
    { codigo: 'rechazar:evidencia',  modulo: 'EVIDENCIAS', descripcion: 'Observar o rechazar evidencias' },
  ];

  const permisosMap = new Map();
  for (const p of permisosData) {
    const creado = await prisma.permiso.upsert({ where: { codigo: p.codigo }, update: p, create: p });
    permisosMap.set(creado.codigo, creado.id);
  }

  // ============================================================
  // 2. CATÁLOGO DE ROLES (ReBAC)
  // ============================================================
  console.log('🎭 3. Estructurando roles globales y locales...');

  const rolesData = [
    // ---------------- ROLES DE SISTEMA ----------------
    {
      nombre: 'Administrador IT', codigo: 'ADMIN_SISTEMA', ambito: 'SISTEMA',
      permisos: ['acceso:basico', 'ver:todo', 'ver:dashboard', 'ver:procesos', 'ver:convocatorias', 'gestionar:usuarios', 'crear:proceso']
    },
    {
      nombre: 'Director DITT', codigo: 'DIRECTOR_DITT', ambito: 'SISTEMA',
      permisos: ['acceso:basico', 'ver:todo', 'ver:dashboard', 'ver:procesos', 'ver:convocatorias']
    },
    {
      nombre: 'Coordinador de Vinculación', codigo: 'COORDINADOR_VINCULACION', ambito: 'SISTEMA',
      permisos: ['acceso:basico', 'ver:dashboard', 'ver:procesos', 'ver:convocatorias', 'crear:proceso']
    },
    {
      nombre: 'Especialista de Sistema', codigo: 'ESPECIALISTA_SISTEMA', ambito: 'SISTEMA',
      permisos: ['acceso:basico', 'ver:procesos', 'ver:convocatorias'] // Ve listados, no puede crear proceso maestro
    },
    {
      nombre: 'Usuario Base', codigo: 'USUARIO_BASE', ambito: 'SISTEMA',
      permisos: ['acceso:basico'] // El más restringido. Solo ve "Mis Actividades".
    },

    // ---------------- ROLES DE PROCESO ----------------
    {
      nombre: 'Gestor de Proceso', codigo: 'GESTOR_PROCESO', ambito: 'PROCESO',
      permisos: ['ver:proceso', 'editar:proceso', 'gestionar:fases', 'asignar:equipo', 'ver:actividad', 'crear:actividad', 'editar:actividad', 'eliminar:actividad']
    },
    {
      nombre: 'Líder de Fase', codigo: 'LIDER_FASE', ambito: 'PROCESO',
      permisos: ['ver:proceso', 'gestionar:fases', 'ver:actividad', 'crear:actividad', 'editar:actividad']
    },

    // ---------------- ROLES DE ACTIVIDAD ----------------
    {
      nombre: 'Responsable de Tarea', codigo: 'RESPONSABLE_TAREA', ambito: 'ACTIVIDAD',
      permisos: ['ver:actividad', 'subir:evidencia']
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
  // 3. CREACIÓN DE USUARIOS (Tus 5 Perfiles)
  // ============================================================
  console.log('👤 4. Registrando equipo de la DITT...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('eduardo', salt);

  // 1. Admin
  const uAdmin = await prisma.usuario.create({
    data: { nombres: 'Admin', apellidos: 'Sistemas', email: 'admin@unsa.edu.pe', password: passwordHash, roles: { create: { rolId: rolesMap.get('ADMIN_SISTEMA') } } }
  });

  // 2. Ejecutor Aislado (Solo tareas)
  const uEjecutor = await prisma.usuario.create({
    data: { nombres: 'Lucia', apellidos: 'Torres (Ejecutora)', email: 'ltorres@unsa.edu.pe', password: passwordHash, roles: { create: { rolId: rolesMap.get('USUARIO_BASE') } } }
  });

  // 3. Gestor Operativo (Puede crear procesos)
  const uCoordinador = await prisma.usuario.create({
    data: { nombres: 'Bryan', apellidos: 'Alvarez (Coordinador)', email: 'balvarez@unsa.edu.pe', password: passwordHash, roles: { create: { rolId: rolesMap.get('COORDINADOR_VINCULACION') } } }
  });

  // 4. Auditor Global (Solo lectura)
  const uDirector = await prisma.usuario.create({
    data: { nombres: 'Marco', apellidos: 'Polo (Director)', email: 'mdirector@unsa.edu.pe', password: passwordHash, roles: { create: { rolId: rolesMap.get('DIRECTOR_DITT') } } }
  });

  // 5. Perfil Híbrido (Ve listas globales, gestiona sus tareas/fases)
  const uEspecialista = await prisma.usuario.create({
    data: { nombres: 'Eduardo', apellidos: 'Becerra (Híbrido)', email: 'ebecerra@unsa.edu.pe', password: passwordHash, roles: { create: { rolId: rolesMap.get('ESPECIALISTA_SISTEMA') } } }
  });

  // ============================================================
  // 4. CASOS DE PRUEBA: ECOSISTEMA VINCULACIÓN
  // ============================================================
  console.log('📋 5. Desplegando ecosistema de proyectos...');

  // ----------------------------------------------------
  // PROCESO 1: PATENTE (Flujo completo con todos los roles)
  // ----------------------------------------------------
  const p1 = await prisma.procesoVinculacion.create({
    data: {
      codigo: 'PROC-2026-001', tipoActivo: 'PATENTE', sistemaOrigen: 'CRIS-UNSA', evaluacionId: 101,
      titulo: 'Membrana de Grafeno para Filtros Mineros', estado: 'ACTIVO', faseActual: 'CARACTERIZACION'
    }
  });

  // Bryan crea el proceso y es el GESTOR maestro
  await prisma.procesoUsuario.create({ data: { procesoId: p1.id, usuarioId: uCoordinador.id, rolId: rolesMap.get('GESTOR_PROCESO') } });
  
  // Eduardo es invitado como LIDER DE FASE (Puede crear actividades aquí, pero no editar el título de la patente)
  await prisma.procesoUsuario.create({ data: { procesoId: p1.id, usuarioId: uEspecialista.id, rolId: rolesMap.get('LIDER_FASE') } });

  const f1 = await prisma.faseProceso.create({ data: { procesoId: p1.id, fase: 'CARACTERIZACION', estado: 'ABIERTA', responsableId: uEspecialista.id } });

  const act1 = await prisma.actividadFase.create({
    data: { procesoId: p1.id, fase: 'CARACTERIZACION', faseProcesoId: f1.id, tipo: 'DOCUMENTO', nombre: 'Redactar Ficha Técnica', estado: 'EN_REVISION', obligatoria: true }
  });

  // Lucía es la RESPONSABLE (Sube el documento). Como es USUARIO_BASE, esto es lo único que verá al loguearse.
  await prisma.usuarioActividad.create({ data: { actividadId: act1.id, usuarioId: uEjecutor.id, rolId: rolesMap.get('RESPONSABLE_TAREA') } });
  // Eduardo es el REVISOR
  await prisma.usuarioActividad.create({ data: { actividadId: act1.id, usuarioId: uEspecialista.id, rolId: rolesMap.get('REVISOR_TAREA') } });

  const req1 = await prisma.requisitoActividad.create({ data: { actividadId: act1.id, nombre: 'Ficha en PDF', obligatorio: true } });
  
  // Evidencia subida por Lucía, esperando revisión
  await prisma.evidenciaActividad.create({
    data: { actividadId: act1.id, requisitoId: req1.id, tipoEvidencia: 'DOCUMENTO', nombreArchivo: 'Ficha_Tecnica_v1.pdf', urlArchivo: 'http://docs.unsa.edu.pe/ficha1.pdf', fase: 'CARACTERIZACION', estado: 'PENDIENTE', subidoPorId: uEjecutor.id }
  });

  // ----------------------------------------------------
  // PROCESO 2: REQUERIMIENTO (Aislado)
  // ----------------------------------------------------
  const p2 = await prisma.procesoVinculacion.create({
    data: {
      codigo: 'PROC-2026-002', tipoActivo: 'REQUERIMIENTO_EMPRESARIAL', sistemaOrigen: 'SIRI', evaluacionId: 202,
      titulo: 'Optimización de Consumo en Molinos SAG', estado: 'ACTIVO', faseActual: 'POSTULACION'
    }
  });

  // Bryan también es Gestor aquí. Ni Eduardo ni Lucía están en este proyecto.
  // Si intentan acceder a la URL de este proceso, el backend devolverá 403.
  await prisma.procesoUsuario.create({ data: { procesoId: p2.id, usuarioId: uCoordinador.id, rolId: rolesMap.get('GESTOR_PROCESO') } });

  console.log(`
  ======================================================
  ✅ SISTEMA VINCULACIÓN INICIALIZADO
  ======================================================
  🔐 Password universal: Sivtt2026*
  
  PERFILES CREADOS:
  1. admin@unsa.edu.pe     (Admin Total)
  2. balvarez@unsa.edu.pe  (Coordinador PMO - Crea Procesos)
  3. ebecerra@unsa.edu.pe  (Especialista Híbrido - Ve lista de procesos, gestiona fase)
  4. mdirector@unsa.edu.pe (Auditor - Ve todo, no edita nada)
  5. ltorres@unsa.edu.pe   (Ejecutora - Su menú no tiene "Procesos", solo ve su tarea)
  ======================================================
  `);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });