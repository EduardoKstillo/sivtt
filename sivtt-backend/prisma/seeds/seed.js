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
    { codigo: 'acceso:basico', modulo: 'SISTEMA', descripcion: 'Acceso mínimo (Login, Perfil)' },
    { codigo: 'ver:todo', modulo: 'SISTEMA', descripcion: 'Pase libre de solo lectura a toda la BD' },
    { codigo: 'ver:dashboard', modulo: 'SISTEMA', descripcion: 'Ver métricas e indicadores globales' },
    { codigo: 'ver:procesos', modulo: 'SISTEMA', descripcion: 'Ver listados generales de Procesos' },
    { codigo: 'ver:convocatorias', modulo: 'SISTEMA', descripcion: 'Ver listados generales de Retos y Grupos' },
    { codigo: 'ver:usuarios', modulo: 'SISTEMA', descripcion: 'Ver listado de usuarios del sistema' },
    { codigo: 'gestionar:usuarios', modulo: 'SISTEMA', descripcion: 'Crear, editar y desactivar cuentas de usuario' },
    { codigo: 'ver:roles', modulo: 'SISTEMA', descripcion: 'Ver catálogo de roles y permisos' },
    { codigo: 'gestionar:roles', modulo: 'SISTEMA', descripcion: 'Crear roles y asignar permisos a roles/usuarios' },
    { codigo: 'crear:proceso', modulo: 'SISTEMA', descripcion: 'Iniciar un nuevo proceso de vinculación' },
    { codigo: 'gestionar:empresas', modulo: 'SISTEMA', descripcion: 'Administrar el catálogo de empresas global' },
    { codigo: 'gestionar:grupos', modulo: 'SISTEMA', descripcion: 'Administrar el catálogo de grupos de investigación' },

    // --- PROCESO (Contextuales) ---
    { codigo: 'ver:proceso', modulo: 'PROCESO', descripcion: 'Ver el detalle de un proceso específico' },
    { codigo: 'editar:proceso', modulo: 'PROCESO', descripcion: 'Modificar cabecera, cambiar estado y TRL' },
    { codigo: 'gestionar:fases', modulo: 'PROCESO', descripcion: 'Abrir, cerrar o retroceder fases' },
    { codigo: 'asignar:equipo', modulo: 'PROCESO', descripcion: 'Agregar usuarios al equipo del proyecto' },

    // --- ACTIVIDAD (Contextuales) ---
    { codigo: 'ver:actividad', modulo: 'ACTIVIDAD', descripcion: 'Ver detalles de una tarea' },
    { codigo: 'crear:actividad', modulo: 'ACTIVIDAD', descripcion: 'Añadir nuevas tareas a una fase' },
    { codigo: 'editar:actividad', modulo: 'ACTIVIDAD', descripcion: 'Modificar info y estado de la tarea' },
    { codigo: 'eliminar:actividad', modulo: 'ACTIVIDAD', descripcion: 'Borrar una tarea' },

    // --- EVIDENCIAS (Contextuales) ---
    { codigo: 'subir:evidencia', modulo: 'EVIDENCIAS', descripcion: 'Subir archivos y links' },
    { codigo: 'aprobar:evidencia', modulo: 'EVIDENCIAS', descripcion: 'Dar visto bueno a evidencias' },
    { codigo: 'rechazar:evidencia', modulo: 'EVIDENCIAS', descripcion: 'Observar o rechazar evidencias' },
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
      permisos: ['acceso:basico', 'ver:todo', 'ver:dashboard', 'ver:procesos', 'ver:convocatorias', 'ver:usuarios', 'gestionar:usuarios', 'ver:roles', 'gestionar:roles', 'crear:proceso', 'gestionar:empresas', 'gestionar:grupos']
    },
    {
      nombre: 'Coordinador de Vinculación', codigo: 'COORDINADOR_VINCULACION', ambito: 'SISTEMA',
      permisos: ['acceso:basico', 'ver:dashboard', 'ver:procesos', 'ver:convocatorias', 'ver:usuarios', 'ver:roles', 'crear:proceso', 'gestionar:empresas', 'gestionar:grupos']
    },
    {
      nombre: 'Especialista de Sistema', codigo: 'ESPECIALISTA_SISTEMA', ambito: 'SISTEMA',
      permisos: ['acceso:basico', 'ver:dashboard', 'ver:procesos', 'ver:convocatorias']
    },
    {
      nombre: 'Observador Global', codigo: 'OBSERVADOR_GLOBAL', ambito: 'SISTEMA',
      permisos: ['acceso:basico', 'ver:dashboard', 'ver:procesos', 'ver:convocatorias']
    },
    {
      nombre: 'Usuario Base', codigo: 'USUARIO_BASE', ambito: 'SISTEMA',
      permisos: ['acceso:basico']
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
  // 3. CREACIÓN DE USUARIOS REALES (Equipo DITT)
  // ============================================================
  console.log('👤 4. Registrando equipo de la DITT...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('eduardo', salt);

  // 1. Administrador del sistema
  await prisma.usuario.create({
    data: {
      nombres: 'Eduardo Hugo',
      apellidos: 'Cutipa Castillo',
      email: 'ecutipacas@unsa.edu.pe',
      password: passwordHash,
      roles: { create: { rolId: rolesMap.get('ADMIN_SISTEMA') } }
    }
  });

  // 2. Coordinadora (Gestora Principal)
  await prisma.usuario.create({
    data: {
      nombres: 'Giussi Alba',
      apellidos: 'Huarcaya Lizarraga',
      email: 'ghuarcayal@unsa.edu.pe',
      password: passwordHash,
      roles: { create: { rolId: rolesMap.get('COORDINADOR_VINCULACION') } }
    }
  });

  // 3. Equipo de Especialistas
  const especialistasInfo = [
    { nombres: 'Arturo', apellidos: 'Valcárcel Chávez', email: 'avalcarcelc@unsa.edu.pe' },
    { nombres: 'Patricia Antuanette', apellidos: 'Jimenez Huarca', email: 'pjimenezh@unsa.edu.pe' },
    { nombres: 'Cecilia Ysabel', apellidos: 'Nuñez Cárdenas', email: 'cnunezcar@unsa.edu.pe' },
    { nombres: 'Bryan', apellidos: 'Alvarez Osorio', email: 'balvarez@unsa.edu.pe' },
    { nombres: 'Cristhian Jevinson', apellidos: 'Ramirez Machaca', email: 'cramirez@unsa.edu.pe' },
    { nombres: 'Juan Richard Alain', apellidos: 'Tecsi Llerena', email: 'jtecsi@unsa.edu.pe' },
    { nombres: 'Julia Amparo', apellidos: 'Vizcarra Valdivia de Coayla', email: 'jvizcarrav@unsa.edu.pe' },
    { nombres: 'Rosse Mary Geraldine', apellidos: 'Medina Cano', email: 'rmedina@unsa.edu.pe' },
  ];

  for (const info of especialistasInfo) {
    await prisma.usuario.create({
      data: {
        nombres: info.nombres,
        apellidos: info.apellidos,
        email: info.email,
        password: passwordHash,
        roles: { create: { rolId: rolesMap.get('ESPECIALISTA_SISTEMA') } }
      }
    });
  }

  // 4. Observador
  await prisma.usuario.create({
    data: {
      nombres: 'Jesús Martin',
      apellidos: 'Silva Fernández',
      email: 'jsilvaf@unsa.edu.pe',
      password: passwordHash,
      roles: { create: { rolId: rolesMap.get('OBSERVADOR_GLOBAL') } }
    }
  });

  // 5. Usuarios Base (Ejecutores / Externos)
  await prisma.usuario.create({
    data: {
      nombres: 'Eduardo',
      apellidos: 'Castillo',
      email: 'eduardo@gmail.com',
      password: passwordHash,
      roles: { create: { rolId: rolesMap.get('USUARIO_BASE') } }
    }
  });

  await prisma.usuario.create({
    data: {
      nombres: 'Dominic',
      apellidos: 'Toreo',
      email: 'dominic@gmail.com',
      password: passwordHash,
      roles: { create: { rolId: rolesMap.get('USUARIO_BASE') } }
    }
  });

  console.log(`
  ======================================================
  ✅ SISTEMA SIVTT INICIALIZADO CORRECTAMENTE
  ======================================================
  La base de datos cuenta con toda la estructura de
  seguridad ReBAC y el equipo de trabajo registrado.

  🔐 Contraseña para todos los usuarios: eduardo
  
  RESUMEN DE CUENTAS:
  - Administrador:     ecutipacas@unsa.edu.pe
  - Coordinadora:      ghuarcayal@unsa.edu.pe
  - Especialistas (8): avalcarcelc, balvarez, etc.
  - Observador (1):    jsilvaf@unsa.edu.pe
  - Usuarios Base (2): eduardo@gmail.com, dominic...
  ======================================================
  `);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });