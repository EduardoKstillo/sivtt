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

function dias(n) {
  return new Date(Date.now() + n * 86_400_000);
}

async function main() {
  console.log('🧹 Limpiando base de datos...');

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
  await prisma.usuarioRol.deleteMany();
  await prisma.rolPermiso.deleteMany();
  await prisma.permiso.deleteMany();
  await prisma.rol.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('✅ Base de datos limpia.\n');

  // ============================================================
  // 1. PERMISOS
  // ============================================================
  console.log('🔑 Creando permisos...');

  const permisosData = [
    // SISTEMA
    { codigo: 'ver:todo',              modulo: 'SISTEMA',       descripcion: 'Acceso de solo lectura global' },
    { codigo: 'gestionar:usuarios',    modulo: 'SISTEMA',       descripcion: 'Crear, editar y desactivar usuarios' },
    { codigo: 'ver:usuarios',          modulo: 'SISTEMA',       descripcion: 'Ver listado y detalle de usuarios' },
    { codigo: 'gestionar:roles',       modulo: 'SISTEMA',       descripcion: 'Modificar roles y permisos dinámicos' },
    { codigo: 'ver:roles',             modulo: 'SISTEMA',       descripcion: 'Ver listado de roles y permisos' },
    // PROCESO
    { codigo: 'ver:proceso',           modulo: 'PROCESO',       descripcion: 'Ver detalles del proceso asignado' },
    { codigo: 'editar:proceso',        modulo: 'PROCESO',       descripcion: 'Crear y editar procesos, fases y sus datos' },
    { codigo: 'crear:fase',            modulo: 'PROCESO',       descripcion: 'Crear y gestionar fases del proceso' },
    // ACTIVIDAD
    { codigo: 'ver:actividad',         modulo: 'ACTIVIDAD',     descripcion: 'Ver detalles de la actividad asignada' },
    { codigo: 'crear:actividad',       modulo: 'ACTIVIDAD',     descripcion: 'Crear nuevas actividades en una fase' },
    { codigo: 'editar:actividad',      modulo: 'ACTIVIDAD',     descripcion: 'Modificar actividades existentes' },
    { codigo: 'eliminar:actividad',    modulo: 'ACTIVIDAD',     descripcion: 'Eliminar actividades del proceso' },
    // EVIDENCIAS
    { codigo: 'subir:evidencia',       modulo: 'EVIDENCIAS',    descripcion: 'Subir archivos de evidencia a una tarea' },
    { codigo: 'aprobar:evidencia',     modulo: 'EVIDENCIAS',    descripcion: 'Aprobar evidencias subidas por otros' },
    { codigo: 'rechazar:evidencia',    modulo: 'EVIDENCIAS',    descripcion: 'Observar o rechazar evidencias' },
    // CONVOCATORIAS
    { codigo: 'ver:convocatorias',     modulo: 'CONVOCATORIAS', descripcion: 'Ver el listado de retos y convocatorias' },
    { codigo: 'postular:convocatoria', modulo: 'CONVOCATORIAS', descripcion: 'Enviar postulación de grupo de investigación' },
  ];

  const permisosCreados = [];
  for (const p of permisosData) {
    const creado = await prisma.permiso.upsert({
      where:  { codigo: p.codigo },
      update: { descripcion: p.descripcion, modulo: p.modulo },
      create: p,
    });
    permisosCreados.push(creado);
  }

  const getPid = (codigo) => permisosCreados.find(p => p.codigo === codigo)?.id;

  // ============================================================
  // 2. ROLES
  // ============================================================
  console.log('🎭 Creando roles...');

  const rolesData = [
    // ── SISTEMA ──────────────────────────────────────────────
    {
      nombre: 'Administrador del Sistema',
      codigo: 'ADMIN_SISTEMA',
      ambito: 'SISTEMA',
      descripcion: 'Control total del sistema',
      permisos: [
        'gestionar:usuarios', 'ver:usuarios',
        'gestionar:roles', 'ver:roles',
        'ver:todo',
        'ver:proceso', 'editar:proceso', 'crear:fase',
        'ver:actividad', 'crear:actividad', 'editar:actividad', 'eliminar:actividad',
        'subir:evidencia', 'aprobar:evidencia', 'rechazar:evidencia',
        'ver:convocatorias', 'postular:convocatoria',
      ],
    },
    {
      nombre: 'Observador Global',
      codigo: 'OBSERVADOR',
      ambito: 'SISTEMA',
      descripcion: 'Acceso de solo lectura a la información del sistema',
      permisos: ['ver:todo', 'ver:proceso', 'ver:actividad', 'ver:convocatorias'],
    },
    {
      nombre: 'Investigador',
      codigo: 'INVESTIGADOR',
      ambito: 'SISTEMA',
      descripcion: 'Miembro de grupo de investigación que puede postular a convocatorias',
      permisos: ['ver:convocatorias', 'postular:convocatoria'],
    },

    // ── PROCESO ──────────────────────────────────────────────
    {
      nombre: 'Gestor de Vinculación',
      codigo: 'GESTOR_VINCULACION',
      ambito: 'PROCESO',
      descripcion: 'Gestiona todas las fases y actividades de un proceso específico',
      permisos: [
        'ver:proceso', 'editar:proceso', 'crear:fase',
        'ver:actividad', 'crear:actividad', 'editar:actividad', 'eliminar:actividad',
        'ver:usuarios', 'ver:roles',
        'aprobar:evidencia', 'rechazar:evidencia',
      ],
    },

    // ── ACTIVIDAD ─────────────────────────────────────────────
    {
      nombre: 'Responsable de Tarea',
      codigo: 'RESPONSABLE_TAREA',
      ambito: 'ACTIVIDAD',
      descripcion: 'Asignado para ejecutar una actividad y subir evidencias',
      permisos: ['ver:actividad', 'subir:evidencia', 'editar:actividad'],
    },
    {
      nombre: 'Revisor de Tareas',
      codigo: 'REVISOR_TAREA',
      ambito: 'ACTIVIDAD',
      descripcion: 'Asignado solo para revisar y aprobar/rechazar evidencias de una tarea',
      permisos: ['ver:actividad', 'aprobar:evidencia', 'rechazar:evidencia'],
    },

    // ── EMPRESA ───────────────────────────────────────────────
    {
      nombre: 'Representante de Empresa',
      codigo: 'EMPRESA',
      ambito: 'EMPRESA',
      descripcion: 'Acceso al portal de empresa para seguimiento de procesos',
      permisos: ['ver:proceso', 'ver:convocatorias'],
    },
  ];

  const rolesCreados = {};
  for (const rol of rolesData) {
    const dbRol = await prisma.rol.upsert({
      where:  { codigo: rol.codigo },
      update: { nombre: rol.nombre, descripcion: rol.descripcion, ambito: rol.ambito },
      create: { nombre: rol.nombre, codigo: rol.codigo, ambito: rol.ambito, descripcion: rol.descripcion },
    });
    rolesCreados[rol.codigo] = dbRol;

    for (const permisoCodigo of rol.permisos) {
      const permisoId = getPid(permisoCodigo);
      if (permisoId) {
        await prisma.rolPermiso.upsert({
          where:  { rolId_permisoId: { rolId: dbRol.id, permisoId } },
          update: {},
          create: { rolId: dbRol.id, permisoId },
        });
      }
    }
  }

  // ============================================================
  // 3. USUARIOS
  // ============================================================
  console.log('👤 Creando usuarios...');

  const salt         = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('eduardo', salt);

  // ADMIN — rol de ámbito SISTEMA → va en UsuarioRol
  const uBryan = await prisma.usuario.create({
    data: {
      nombres:   'Bryan',
      apellidos: 'Alvarez Osorio',
      email:     'balvarez@unsa.edu.pe',
      password:  passwordHash,
      roles: { create: { rolId: rolesCreados['ADMIN_SISTEMA'].id } },
    },
  });

  // INVESTIGADOR — rol de ámbito SISTEMA → UsuarioRol
  const uCristhian = await prisma.usuario.create({
    data: {
      nombres:   'Cristhian',
      apellidos: 'Rodriguez Mamani',
      email:     'crodriguez@unsa.edu.pe',
      password:  passwordHash,
      roles: { create: { rolId: rolesCreados['INVESTIGADOR'].id } },
    },
  });

  // REVISOR — rol de ámbito ACTIVIDAD → NO va en UsuarioRol
  // Se asignará a actividades específicas vía UsuarioActividad
  const uLucia = await prisma.usuario.create({
    data: {
      nombres:   'Lucia',
      apellidos: 'Torres Flores',
      email:     'ltorres@unsa.edu.pe',
      password:  passwordHash,
      // Sin rol de sistema — solo tendrá rol en actividades
    },
  });

  // OBSERVADOR — rol de ámbito SISTEMA → UsuarioRol
  const uMarco = await prisma.usuario.create({
    data: {
      nombres:   'Marco',
      apellidos: 'Polo Vargas',
      email:     'mpolo@unsa.edu.pe',
      password:  passwordHash,
      roles: { create: { rolId: rolesCreados['OBSERVADOR'].id } },
    },
  });

  // GESTOR — rol de ámbito PROCESO → NO va en UsuarioRol global
  // Se asignará a procesos específicos vía ProcesoUsuario
  const uEduardo = await prisma.usuario.create({
    data: {
      nombres:   'Eduardo',
      apellidos: 'Perez Quispe',
      email:     'eperez@unsa.edu.pe',
      password:  passwordHash,
      // Sin rol de sistema — solo tendrá rol en procesos
    },
  });

  // ============================================================
  // 4. EMPRESAS
  // ============================================================
  console.log('🏭 Creando empresas...');

  const eMineria = await prisma.empresa.create({
    data: {
      razonSocial:       'Minería Global S.A.C.',
      ruc:               '20123456789',
      nombreComercial:   'MinGlobal',
      sector:            'MINERIA',
      tamaño:           'GRANDE',
      departamento:      'Arequipa',
      provincia:         'Arequipa',
      distrito:          'Cercado',
      direccion:         'Av. Ejército 123, Arequipa',
      contactoPrincipal: 'Ing. Marco Polo',
      cargoContacto:     'Gerente de Innovación',
      email:             'innovacion@minglobal.com.pe',
      telefono:          '054-234567',
      verificada:        true,
      fechaVerificacion: new Date(),
    },
  });

  const eEnergia = await prisma.empresa.create({
    data: {
      razonSocial:       'EnergíaTech Perú S.A.',
      ruc:               '20987654321',
      nombreComercial:   'EnerTech',
      sector:            'ENERGIA',
      tamaño:           'MEDIANA',
      departamento:      'Lima',
      provincia:         'Lima',
      distrito:          'San Isidro',
      direccion:         'Calle Los Pinos 456, San Isidro',
      contactoPrincipal: 'Ing. Ana Gutiérrez',
      cargoContacto:     'Jefe de I+D',
      email:             'id@enertech.pe',
      telefono:          '01-5556789',
      verificada:        true,
      fechaVerificacion: new Date(),
    },
  });

  // ============================================================
  // PROCESO 1: PATENTE (Fase MATCH)
  // ============================================================
  console.log('\n📋 Creando Proceso 1: PATENTE...');

  const pPatente = await prisma.procesoVinculacion.create({
    data: {
      codigo:       'PROC-2026-001',
      tipoActivo:   'PATENTE',
      sistemaOrigen:'CRIS-UNSA',
      evaluacionId: 1001,
      titulo:       'Sistema de Purificación de Agua con Grafeno',
      descripcion:  'Tecnología de filtrado de metales pesados para minería mediante membranas de grafeno funcionalizado.',
      trlInicial:   2,
      trlActual:    4,
      estado:       'ACTIVO',
      faseActual:   'MATCH',
      actividadesTotales:    3,
      actividadesPendientes: 2,
      empresasVinculadas:    1,
    },
  });

  // ✅ ProcesoUsuario ahora usa rolId (ámbito PROCESO)
  await prisma.procesoUsuario.create({
    data: {
      procesoId: pPatente.id,
      usuarioId: uBryan.id,
      rolId:     rolesCreados['GESTOR_VINCULACION'].id,
    },
  });
  await prisma.procesoUsuario.create({
    data: {
      procesoId: pPatente.id,
      usuarioId: uEduardo.id,
      rolId:     rolesCreados['GESTOR_VINCULACION'].id,
    },
  });

  const faseMatch = await prisma.faseProceso.create({
    data: {
      procesoId:    pPatente.id,
      fase:         'MATCH',
      estado:       'ABIERTA',
      responsableId: uEduardo.id,
      observaciones: 'Fase de identificación y match con empresa interesada iniciada.',
    },
  });

  await prisma.historialFaseProceso.create({
    data: {
      procesoId:     pPatente.id,
      faseAnterior:  'CARACTERIZACION',
      faseNueva:     'MATCH',
      motivo:        'Caracterización técnica completada. Se identificaron 3 empresas potenciales.',
      modificadoPor: uBryan.id,
    },
  });

  await prisma.historialTRL.create({
    data: {
      procesoId:     pPatente.id,
      fase:          'MATCH',
      trlAnterior:   2,
      trlNuevo:      4,
      justificacion: 'Validación experimental completada en laboratorio de la UNSA.',
      modificadoPor: uBryan.id,
    },
  });

  // Actividad 1: Firma NDA
  const actNDA = await prisma.actividadFase.create({
    data: {
      procesoId:     pPatente.id,
      fase:          'MATCH',
      faseProcesoId: faseMatch.id,
      tipo:          'DOCUMENTO',
      nombre:        'Firma de NDA con socio estratégico',
      descripcion:   'Suscribir el Acuerdo de Confidencialidad con Minería Global S.A.C.',
      estado:        'EN_REVISION',
      obligatoria:   true,
      orden:         1,
      fechaLimite:   dias(7),
    },
  });

  const reqNDA = await prisma.requisitoActividad.create({
    data: {
      actividadId: actNDA.id,
      nombre:      'NDA firmado por ambas partes',
      descripcion: 'Documento PDF con firmas y sellos de ambas instituciones.',
      obligatorio: true,
      formato:     'PDF',
    },
  });

  // ✅ UsuarioActividad ahora usa rolId (ámbito ACTIVIDAD)
  await prisma.usuarioActividad.create({
    data: {
      actividadId: actNDA.id,
      usuarioId:   uBryan.id,
      rolId:       rolesCreados['RESPONSABLE_TAREA'].id,
    },
  });
  await prisma.usuarioActividad.create({
    data: {
      actividadId: actNDA.id,
      usuarioId:   uLucia.id,
      rolId:       rolesCreados['REVISOR_TAREA'].id,
    },
  });

  const evNDA = await prisma.evidenciaActividad.create({
    data: {
      actividadId:   actNDA.id,
      requisitoId:   reqNDA.id,
      tipoEvidencia: 'DOCUMENTO',
      nombreArchivo: 'NDA_MineriaGlobal_V1.pdf',
      urlArchivo:    'https://storage.unsa.edu.pe/ndas/NDA_MineriaGlobal_V1.pdf',
      tamaño:       204800,
      version:       1,
      fase:          'MATCH',
      descripcion:   'Primera versión del NDA revisada por asesoría legal.',
      estado:        'PENDIENTE',
      subidoPorId:   uBryan.id,
    },
  });

  await prisma.historialActividad.create({
    data: {
      procesoId:      pPatente.id,
      actividadId:    actNDA.id,
      accion:         'EVIDENCIA_SUBIDA',
      estadoAnterior: 'CREADA',
      estadoNuevo:    'EN_REVISION',
      usuarioId:      uBryan.id,
      metadata:       { evidenciaId: evNDA.id, archivo: 'NDA_MineriaGlobal_V1.pdf' },
    },
  });

  // Actividad 2: Reunión de presentación técnica
  const actReunion = await prisma.actividadFase.create({
    data: {
      procesoId:     pPatente.id,
      fase:          'MATCH',
      faseProcesoId: faseMatch.id,
      tipo:          'REUNION',
      nombre:        'Reunión de presentación técnica con empresa',
      descripcion:   'Demo de la tecnología de grafeno ante el equipo técnico de Minería Global.',
      estado:        'EN_PROGRESO',
      obligatoria:   true,
      orden:         2,
      fechaLimite:   dias(14),
    },
  });

  await prisma.usuarioActividad.create({
    data: {
      actividadId: actReunion.id,
      usuarioId:   uEduardo.id,
      rolId:       rolesCreados['RESPONSABLE_TAREA'].id,
    },
  });

  const reunion = await prisma.reunionActividad.create({
    data: {
      actividadId:     actReunion.id,
      fechaProgramada: dias(5),
      duracionMinutos: 90,
      meetLink:        'https://meet.google.com/abc-defg-hij',
      calendarLink:    'https://calendar.google.com/event?id=xyz123',
      resumen:         'Presentación de resultados de laboratorio y plan de escalamiento.',
      acuerdos:        { seguimiento: 'Reunión de seguimiento en 30 días.', pruebasPiloto: 'Se evaluará prueba piloto en mina Cerro Verde.' },
      realizada:       false,
    },
  });

  await prisma.participanteReunion.createMany({
    data: [
      { reunionId: reunion.id, usuarioId: uBryan.id, nombre: 'Bryan Alvarez Osorio', email: 'balvarez@unsa.edu.pe', rol: 'Investigador Principal', confirmado: true },
      { reunionId: reunion.id, nombre: 'Ing. Marco Polo', email: 'innovacion@minglobal.com.pe', rol: 'Representante Empresa', confirmado: true },
    ],
  });

  // Actividad 3: Informe de viabilidad
  const actInforme = await prisma.actividadFase.create({
    data: {
      procesoId:     pPatente.id,
      fase:          'MATCH',
      faseProcesoId: faseMatch.id,
      tipo:          'REVISION',
      nombre:        'Informe de viabilidad comercial',
      descripcion:   'Análisis de mercado y estimación de retorno de inversión para la tecnología.',
      estado:        'CREADA',
      obligatoria:   false,
      orden:         3,
      fechaLimite:   dias(21),
    },
  });

  await prisma.usuarioActividad.create({
    data: {
      actividadId: actInforme.id,
      usuarioId:   uEduardo.id,
      rolId:       rolesCreados['RESPONSABLE_TAREA'].id,
    },
  });

  await prisma.procesoEmpresa.create({
    data: {
      procesoId:            pPatente.id,
      empresaId:            eMineria.id,
      rolEmpresa:           'INTERESADA',
      interesConfirmado:    true,
      ndaFirmado:           false,
      cartaIntencionFirmada:false,
      canalVinculacion:     'EVENTO_TECNOLOGICO',
      estado:               'ACTIVA',
      observaciones:        'Contacto establecido en ExpoMinería 2025.',
    },
  });

  await prisma.historialEmpresaProceso.create({
    data: {
      procesoId:     pPatente.id,
      empresaId:     eMineria.id,
      accion:        'VINCULADA',
      rolNuevo:      'INTERESADA',
      motivo:        'Empresa identificada como potencial aliada en ExpoMinería 2025.',
      modificadoPor: uBryan.id,
    },
  });

  await prisma.financiamiento.create({
    data: {
      procesoId:         pPatente.id,
      tipoFinanciamiento:'MIXTO',
      monto:             250000.00,
      moneda:            'PEN',
      capex:             180000.00,
      opex:              70000.00,
      fuenteDetalle:     'FONDECYT + Aporte empresa',
      estadoGestion:     'EN_TRAMITE',
      observaciones:     'Postulación enviada a CONCYTEC en enero 2026.',
    },
  });

  await prisma.historialEstadoProceso.create({
    data: {
      procesoId:      pPatente.id,
      estadoAnterior: null,
      estadoNuevo:    'ACTIVO',
      motivo:         'Creación inicial del proceso de vinculación.',
      modificadoPor:  uBryan.id,
    },
  });

  // ============================================================
  // PROCESO 2: REQUERIMIENTO EMPRESARIAL (Fase SELECCION)
  // ============================================================
  console.log('📋 Creando Proceso 2: REQUERIMIENTO EMPRESARIAL...');

  const pReq = await prisma.procesoVinculacion.create({
    data: {
      codigo:        'PROC-2026-002',
      tipoActivo:    'REQUERIMIENTO_EMPRESARIAL',
      sistemaOrigen: 'SIRI-EMPRESAS',
      evaluacionId:  2002,
      titulo:        'Optimización Energética de Molinos de Bolas',
      descripcion:   'Buscamos soluciones de IA/ML para reducir el consumo eléctrico de molinos en operaciones mineras.',
      estado:        'ACTIVO',
      faseActual:    'SELECCION',
      actividadesTotales:    2,
      actividadesPendientes: 1,
      empresasVinculadas:    1,
    },
  });

  await prisma.procesoUsuario.create({
    data: {
      procesoId: pReq.id,
      usuarioId: uEduardo.id,
      rolId:     rolesCreados['GESTOR_VINCULACION'].id,
    },
  });

  const fasePostulacion = await prisma.faseProceso.create({
    data: {
      procesoId:     pReq.id,
      fase:          'POSTULACION',
      estado:        'CERRADA',
      responsableId: uEduardo.id,
      fechaFin:      new Date(),
      observaciones: '3 postulaciones recibidas. Plazo cerrado.',
    },
  });

  const faseSeleccion = await prisma.faseProceso.create({
    data: {
      procesoId:     pReq.id,
      fase:          'SELECCION',
      estado:        'ABIERTA',
      responsableId: uEduardo.id,
      observaciones: 'Evaluación de postulaciones en curso.',
    },
  });

  await prisma.decisionFase.create({
    data: {
      procesoId:    pReq.id,
      faseId:       fasePostulacion.id,
      fase:         'POSTULACION',
      decision:     'CONTINUAR',
      justificacion:'Se recibieron 3 postulaciones de calidad. Se procede a la fase de selección.',
      decididorId:  uEduardo.id,
    },
  });

  await prisma.historialFaseProceso.createMany({
    data: [
      { procesoId: pReq.id, faseAnterior: 'CONVOCATORIA', faseNueva: 'POSTULACION', motivo: 'Convocatoria cerrada con 3 postulaciones recibidas.', modificadoPor: uEduardo.id },
      { procesoId: pReq.id, faseAnterior: 'POSTULACION', faseNueva: 'SELECCION', motivo: 'Plazo de postulación vencido. Inicio de evaluación.', modificadoPor: uEduardo.id },
    ],
  });

  const reto = await prisma.retoTecnologico.create({
    data: {
      procesoId:   pReq.id,
      titulo:      'Eficiencia Energética en Molinos de Bolas con IA',
      problema:    'Los molinos de bolas consumen hasta 40% de la energía total de la operación minera.',
      descripcion: 'Buscamos algoritmos de IA/ML que optimicen la carga de los molinos en tiempo real.',
      objetivos:   'Reducir consumo energético en al menos 15%. Mantener throughput de 20 Ton/h.',
      fichaTecnica: { motores: 'Siemens 500HP x 2', capacidad: '20 Ton/h', consumoActual: '3.2 kWh/Ton', software: 'SCADA WinCC', protocolo: 'OPC-UA' },
      resultadosEsperados: 'Dashboard de monitoreo, modelo predictivo, reducción ≥15% en consumo.',
      restricciones:       'No se puede detener la operación. Entorno ATEX zona 2.',
      timelineEstimado:    12,
      nivelConfidencialidad: 'CONFIDENCIAL',
      prioridad:             1,
      areasAcademicas:      ['Ingeniería de Sistemas', 'Ingeniería Eléctrica', 'Matemática Aplicada'],
    },
  });

  const convocatoria = await prisma.convocatoria.create({
    data: {
      retoId:      reto.id,
      codigo:      'CONV-2026-01',
      titulo:      'Call for Solutions: IA para Eficiencia Minera',
      descripcion: 'Convocatoria abierta para grupos de investigación de universidades peruanas.',
      estatus:     'CERRADA',
      fechaApertura: dias(-30),
      fechaCierre:   dias(-1),
      criteriosSeleccion: { tecnico: 60, economico: 25, experiencia: 15 },
      requisitosPostulacion: { documentos: ['Propuesta técnica', 'CV del equipo', 'Carta del decano'], grupoMinimo: 3, trlMinimo: 3 },
    },
  });

  const grupoAI = await prisma.grupoInvestigacion.create({
    data: {
      codigo:               'GI-AI-01',
      nombre:               'Grupo de Inteligencia Artificial Aplicada',
      facultad:             'Ingeniería de Producción y Servicios',
      departamentoAcademico:'Ingeniería de Sistemas e Informática',
      coordinador:          'Dr. Alan Turing',
      email:                'ai.grupo@unsa.edu.pe',
      telefono:             '054-111222',
      lineasInvestigacion:  ['Machine Learning', 'Optimización', 'IoT Industrial'],
      equipamiento:         ['Cluster GPU NVIDIA A100 x4', 'Servidor de simulación', 'Licencias MATLAB'],
      infraestructura:      'Laboratorio de Supercomputación UNSA, 200m², acceso 24/7.',
      miembros: {
        create: [
          { nombre: 'Dr. Alan Turing',     rol: 'Coordinador',  email: 'aturing@unsa.edu.pe',    especialidad: 'Deep Learning' },
          { nombre: 'Cristhian Rodriguez', rol: 'Investigador', email: 'crodriguez@unsa.edu.pe', especialidad: 'Reinforcement Learning' },
          { nombre: 'Dra. Ada Lovelace',   rol: 'Investigador', email: 'alovelace@unsa.edu.pe',  especialidad: 'Optimización Convexa' },
          { nombre: 'Mg. Juan Flores',     rol: 'Asistente',   email: 'jflores@unsa.edu.pe',    especialidad: 'SCADA & OPC-UA' },
        ],
      },
    },
  });

  const grupoEE = await prisma.grupoInvestigacion.create({
    data: {
      codigo:               'GI-EE-02',
      nombre:               'Grupo de Ingeniería Eléctrica y Control',
      facultad:             'Ingeniería de Producción y Servicios',
      departamentoAcademico:'Ingeniería Eléctrica y Electrónica',
      coordinador:          'Dr. Nikola Tesla',
      email:                'ee.grupo@unsa.edu.pe',
      telefono:             '054-333444',
      lineasInvestigacion:  ['Control Predictivo', 'Eficiencia Energética', 'Accionamientos Eléctricos'],
      equipamiento:         ['Analizadores de red Fluke', 'PLC Siemens S7-1500', 'Drives ABB'],
      miembros: {
        create: [
          { nombre: 'Dr. Nikola Tesla', rol: 'Coordinador',  email: 'ntesla@unsa.edu.pe', especialidad: 'Máquinas Eléctricas' },
          { nombre: 'Ing. Marie Curie', rol: 'Investigador', email: 'mcurie@unsa.edu.pe', especialidad: 'Eficiencia Energética' },
        ],
      },
    },
  });

  await prisma.postulacionGrupo.createMany({
    data: [
      {
        retoId: reto.id, grupoId: grupoAI.id, convocatoriaId: convocatoria.id,
        notaInteres: 'Nuestro grupo cuenta con experiencia demostrada en optimización industrial con RL.',
        capacidadesTecnicas: 'Cluster GPU disponible, equipo multidisciplinario.',
        propuestaTecnica: 'Implementaremos un agente de Reinforcement Learning (TD3) integrado con el SCADA via OPC-UA.',
        presupuestoEstimado: 45000.00, seleccionado: false,
        puntajeTotal: 78.5, puntajesDetalle: { tecnico: 52, economico: 18, experiencia: 8.5 },
      },
      {
        retoId: reto.id, grupoId: grupoEE.id, convocatoriaId: convocatoria.id,
        notaInteres: 'Especialistas en accionamientos y control de motores industriales.',
        capacidadesTecnicas: 'Acceso a laboratorio de máquinas eléctricas y drives industriales.',
        propuestaTecnica: 'Proponemos un sistema MPC para optimización de carga.',
        presupuestoEstimado: 38000.00, seleccionado: false,
        puntajeTotal: 71.0, puntajesDetalle: { tecnico: 46, economico: 17, experiencia: 8 },
      },
    ],
  });

  const actEvalPropuestas = await prisma.actividadFase.create({
    data: {
      procesoId: pReq.id, fase: 'SELECCION', faseProcesoId: faseSeleccion.id,
      tipo: 'REVISION', nombre: 'Evaluación técnica de propuestas',
      descripcion: 'Revisión y puntuación de las propuestas recibidas.',
      estado: 'EN_PROGRESO', obligatoria: true, orden: 1, fechaLimite: dias(10),
    },
  });

  await prisma.usuarioActividad.createMany({
    data: [
      { actividadId: actEvalPropuestas.id, usuarioId: uEduardo.id, rolId: rolesCreados['RESPONSABLE_TAREA'].id },
      { actividadId: actEvalPropuestas.id, usuarioId: uLucia.id,   rolId: rolesCreados['REVISOR_TAREA'].id },
    ],
  });

  await prisma.requisitoActividad.create({
    data: {
      actividadId: actEvalPropuestas.id,
      nombre:      'Matriz de evaluación firmada',
      descripcion: 'Formulario oficial de scoring firmado por todos los evaluadores.',
      obligatorio: true,
      formato:     'XLSX/PDF',
    },
  });

  await prisma.historialActividad.create({
    data: {
      procesoId: pReq.id, actividadId: actEvalPropuestas.id,
      accion: 'ESTADO_CAMBIADO', estadoAnterior: 'CREADA', estadoNuevo: 'EN_PROGRESO',
      usuarioId: uEduardo.id, metadata: { postulaciones: 2 },
    },
  });

  const actReunionJurado = await prisma.actividadFase.create({
    data: {
      procesoId: pReq.id, fase: 'SELECCION', faseProcesoId: faseSeleccion.id,
      tipo: 'REUNION', nombre: 'Reunión de jurado para selección final',
      descripcion: 'Sesión deliberativa del comité evaluador para elegir el grupo ganador.',
      estado: 'CREADA', obligatoria: true, orden: 2, fechaLimite: dias(15),
    },
  });

  await prisma.usuarioActividad.create({
    data: { actividadId: actReunionJurado.id, usuarioId: uEduardo.id, rolId: rolesCreados['RESPONSABLE_TAREA'].id },
  });

  const reunionJurado = await prisma.reunionActividad.create({
    data: { actividadId: actReunionJurado.id, fechaProgramada: dias(12), duracionMinutos: 120, meetLink: 'https://meet.google.com/sel-jurado-2026', realizada: false },
  });

  await prisma.participanteReunion.createMany({
    data: [
      { reunionId: reunionJurado.id, usuarioId: uEduardo.id, nombre: 'Eduardo Perez Quispe', email: 'eperez@unsa.edu.pe', rol: 'Presidente del Jurado', confirmado: true },
      { reunionId: reunionJurado.id, usuarioId: uLucia.id,   nombre: 'Lucia Torres Flores',  email: 'ltorres@unsa.edu.pe', rol: 'Evaluadora Técnica', confirmado: true },
    ],
  });

  await prisma.procesoEmpresa.create({
    data: {
      procesoId: pReq.id, empresaId: eEnergia.id, rolEmpresa: 'FINANCIADORA',
      interesConfirmado: true, ndaFirmado: true, ndaFechaFirma: new Date(),
      ndaArchivoUrl: 'https://storage.unsa.edu.pe/ndas/NDA_EnerTech_2026.pdf',
      estado: 'ACTIVA', canalVinculacion: 'SOLICITUD_DIRECTA',
      observaciones: 'Empresa co-financiadora del proyecto. Aporte del 40% del presupuesto.',
    },
  });

  await prisma.historialEmpresaProceso.create({
    data: { procesoId: pReq.id, empresaId: eEnergia.id, accion: 'NDA_FIRMADO', rolNuevo: 'FINANCIADORA', motivo: 'NDA firmado vía plataforma de firma digital.', modificadoPor: uEduardo.id },
  });

  await prisma.financiamiento.create({
    data: {
      procesoId: pReq.id, tipoFinanciamiento: 'MIXTO', monto: 83000.00, moneda: 'PEN',
      capex: 50000.00, opex: 33000.00, fuenteDetalle: 'FONDECYT (60%) + EnergíaTech Perú S.A. (40%)',
      estadoGestion: 'APROBADO', fechaAprobacion: new Date(), observaciones: 'Financiamiento aprobado por comité el 15/01/2026.',
    },
  });

  await prisma.historialEstadoProceso.create({
    data: { procesoId: pReq.id, estadoAnterior: null, estadoNuevo: 'ACTIVO', motivo: 'Requerimiento empresarial ingresado desde SIRI-EMPRESAS.', modificadoPor: uEduardo.id },
  });

  // ============================================================
  // PROCESO 3: PATENTE EN CARACTERIZACION
  // ============================================================
  console.log('📋 Creando Proceso 3: PATENTE en CARACTERIZACION...');

  const pPatenteB = await prisma.procesoVinculacion.create({
    data: {
      codigo: 'PROC-2026-003', tipoActivo: 'PATENTE', sistemaOrigen: 'CRIS-UNSA', evaluacionId: 1003,
      titulo: 'Biorreactor de Flujo Continuo para Producción de Biogás',
      descripcion: 'Diseño innovador de biorreactor para aprovechamiento de residuos orgánicos mineros.',
      trlInicial: 1, trlActual: 2, estado: 'ACTIVO', faseActual: 'CARACTERIZACION',
      actividadesTotales: 2, actividadesPendientes: 2,
    },
  });

  await prisma.procesoUsuario.create({
    data: { procesoId: pPatenteB.id, usuarioId: uCristhian.id, rolId: rolesCreados['GESTOR_VINCULACION'].id },
  });

  const faseCarac = await prisma.faseProceso.create({
    data: { procesoId: pPatenteB.id, fase: 'CARACTERIZACION', estado: 'ABIERTA', responsableId: uCristhian.id },
  });

  await prisma.historialEstadoProceso.create({
    data: { procesoId: pPatenteB.id, estadoNuevo: 'ACTIVO', motivo: 'Patente ingresada desde CRIS-UNSA.', modificadoPor: uBryan.id },
  });

  const actFichaTecnica = await prisma.actividadFase.create({
    data: {
      procesoId: pPatenteB.id, fase: 'CARACTERIZACION', faseProcesoId: faseCarac.id,
      tipo: 'DOCUMENTO', nombre: 'Elaboración de ficha técnica del activo',
      descripcion: 'Completar la ficha técnica estandarizada con características del biorreactor.',
      estado: 'CREADA', obligatoria: true, orden: 1, fechaLimite: dias(14),
    },
  });

  await prisma.requisitoActividad.createMany({
    data: [
      { actividadId: actFichaTecnica.id, nombre: 'Ficha técnica completada', descripcion: 'Formulario UNSA-VT-001 completado en su totalidad.', obligatorio: true, formato: 'PDF' },
      { actividadId: actFichaTecnica.id, nombre: 'Memoria descriptiva de la patente', descripcion: 'Documento de la solicitud de patente ante INDECOPI.', obligatorio: true, formato: 'PDF' },
    ],
  });

  await prisma.usuarioActividad.create({
    data: { actividadId: actFichaTecnica.id, usuarioId: uCristhian.id, rolId: rolesCreados['RESPONSABLE_TAREA'].id },
  });

  const actTRL = await prisma.actividadFase.create({
    data: {
      procesoId: pPatenteB.id, fase: 'CARACTERIZACION', faseProcesoId: faseCarac.id,
      tipo: 'REVISION', nombre: 'Evaluación del nivel TRL',
      descripcion: 'Workshop para determinar el TRL actual y el roadmap de maduración.',
      estado: 'CREADA', obligatoria: true, orden: 2, fechaLimite: dias(21),
    },
  });

  await prisma.usuarioActividad.create({
    data: { actividadId: actTRL.id, usuarioId: uEduardo.id, rolId: rolesCreados['RESPONSABLE_TAREA'].id },
  });

  // ============================================================
  // RESUMEN FINAL
  // ============================================================
  const stats = {
    usuarios:      await prisma.usuario.count(),
    roles:         await prisma.rol.count(),
    permisos:      await prisma.permiso.count(),
    procesos:      await prisma.procesoVinculacion.count(),
    fases:         await prisma.faseProceso.count(),
    actividades:   await prisma.actividadFase.count(),
    evidencias:    await prisma.evidenciaActividad.count(),
    empresas:      await prisma.empresa.count(),
    grupos:        await prisma.grupoInvestigacion.count(),
    postulaciones: await prisma.postulacionGrupo.count(),
  };

  console.log('\n🚀 Seeding completado con éxito.');
  console.log('📊 Estadísticas:', stats);
  console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║              CREDENCIALES PARA PRUEBAS                      ║
  ╠══════════════════════════════════════════════════════════════╣
  ║ ADMIN_SISTEMA:  balvarez@unsa.edu.pe   / eduardo            ║
  ║ INVESTIGADOR:   crodriguez@unsa.edu.pe / eduardo            ║
  ║ OBSERVADOR:     mpolo@unsa.edu.pe      / eduardo            ║
  ║ Gestor (proc):  eperez@unsa.edu.pe     / eduardo            ║
  ║ Revisor (act):  ltorres@unsa.edu.pe    / eduardo            ║
  ╠══════════════════════════════════════════════════════════════╣
  ║ Nota: Eduardo y Lucia solo tienen permisos vía proceso/     ║
  ║ actividad. No tienen rol de sistema asignado.               ║
  ╚══════════════════════════════════════════════════════════════╝
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });