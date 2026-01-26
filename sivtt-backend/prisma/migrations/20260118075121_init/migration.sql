-- CreateEnum
CREATE TYPE "TipoActivoVinculable" AS ENUM ('PATENTE', 'REQUERIMIENTO_EMPRESARIAL');

-- CreateEnum
CREATE TYPE "EstadoProceso" AS ENUM ('ACTIVO', 'PAUSADO', 'FINALIZADO', 'CANCELADO', 'ARCHIVADO');

-- CreateEnum
CREATE TYPE "FaseVinculacion" AS ENUM ('CARACTERIZACION', 'ENRIQUECIMIENTO', 'MATCH', 'ESCALAMIENTO', 'TRANSFERENCIA', 'FORMULACION_RETO', 'CONVOCATORIA', 'POSTULACION', 'SELECCION', 'ANTEPROYECTO', 'EJECUCION', 'CIERRE');

-- CreateEnum
CREATE TYPE "EstadoFase" AS ENUM ('ABIERTA', 'CERRADA', 'EN_ESPERA');

-- CreateEnum
CREATE TYPE "TipoActividad" AS ENUM ('DOCUMENTO', 'REUNION', 'TAREA', 'REVISION', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoActividad" AS ENUM ('CREADA', 'EN_PROGRESO', 'EN_REVISION', 'OBSERVADA', 'LISTA_PARA_CIERRE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoEvidencia" AS ENUM ('DOCUMENTO', 'IMAGEN', 'VIDEO', 'ACTA', 'INFORME', 'PRESENTACION', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoEvidencia" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "DecisionFaseTipo" AS ENUM ('CONTINUAR', 'RETROCEDER', 'PAUSAR', 'CANCELAR', 'FINALIZAR', 'RELANZAR_CONVOCATORIA');

-- CreateEnum
CREATE TYPE "RolSistema" AS ENUM ('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE', 'EVALUADOR', 'REVISOR', 'INVESTIGADOR', 'EMPRESA', 'OBSERVADOR');

-- CreateEnum
CREATE TYPE "RolProceso" AS ENUM ('RESPONSABLE_PROCESO', 'APOYO', 'OBSERVADOR');

-- CreateEnum
CREATE TYPE "RolActividad" AS ENUM ('RESPONSABLE', 'REVISOR', 'PARTICIPANTE');

-- CreateEnum
CREATE TYPE "RolEmpresa" AS ENUM ('INTERESADA', 'ALIADA', 'FINANCIADORA');

-- CreateEnum
CREATE TYPE "EstatusConvocatoria" AS ENUM ('BORRADOR', 'PUBLICADA', 'CERRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoFinanciamiento" AS ENUM ('PUBLICO', 'PRIVADO', 'MIXTO', 'EMPRESA', 'INTERNO');

-- CreateEnum
CREATE TYPE "EstadoGestionFinanciamiento" AS ENUM ('PROPUESTO', 'EN_TRAMITE', 'APROBADO', 'RECHAZADO', 'DESEMBOLSADO');

-- CreateEnum
CREATE TYPE "AccionEmpresaProceso" AS ENUM ('VINCULADA', 'RETIRADA', 'REACTIVADA', 'ROL_CAMBIADO', 'NDA_FIRMADO');

-- CreateEnum
CREATE TYPE "EstadoVinculacionEmpresa" AS ENUM ('ACTIVA', 'RETIRADA', 'INACTIVA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "codigo" "RolSistema" NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioRol" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "rolId" INTEGER NOT NULL,

    CONSTRAINT "UsuarioRol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcesoVinculacion" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipoActivo" "TipoActivoVinculable" NOT NULL,
    "sistemaOrigen" TEXT NOT NULL,
    "evaluacionId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "trlInicial" INTEGER,
    "trlActual" INTEGER,
    "estado" "EstadoProceso" NOT NULL,
    "faseActual" "FaseVinculacion" NOT NULL,
    "actividadesTotales" INTEGER NOT NULL DEFAULT 0,
    "actividadesCompletadas" INTEGER NOT NULL DEFAULT 0,
    "actividadesPendientes" INTEGER NOT NULL DEFAULT 0,
    "actividadesObservadas" INTEGER NOT NULL DEFAULT 0,
    "empresasVinculadas" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcesoVinculacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcesoUsuario" (
    "id" SERIAL NOT NULL,
    "procesoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "rolProceso" "RolProceso" NOT NULL,
    "asignadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcesoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaseProceso" (
    "id" SERIAL NOT NULL,
    "procesoId" INTEGER NOT NULL,
    "fase" "FaseVinculacion" NOT NULL,
    "estado" "EstadoFase" NOT NULL DEFAULT 'ABIERTA',
    "responsableId" INTEGER,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "observaciones" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaseProceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActividadFase" (
    "id" SERIAL NOT NULL,
    "procesoId" INTEGER NOT NULL,
    "fase" "FaseVinculacion" NOT NULL,
    "faseProcesoId" INTEGER NOT NULL,
    "tipo" "TipoActividad" NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoActividad" NOT NULL DEFAULT 'CREADA',
    "obligatoria" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLimite" TIMESTAMP(3),
    "fechaCierre" TIMESTAMP(3),
    "observaciones" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActividadFase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioActividad" (
    "id" SERIAL NOT NULL,
    "actividadId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "rol" "RolActividad" NOT NULL,
    "asignadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioActividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenciaActividad" (
    "id" SERIAL NOT NULL,
    "actividadId" INTEGER NOT NULL,
    "tipoEvidencia" "TipoEvidencia" NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "tamaño" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "fase" "FaseVinculacion" NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoEvidencia" NOT NULL DEFAULT 'PENDIENTE',
    "comentarioRevision" TEXT,
    "fechaRevision" TIMESTAMP(3),
    "subidoPorId" INTEGER NOT NULL,
    "revisadoPorId" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenciaActividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReunionActividad" (
    "id" SERIAL NOT NULL,
    "actividadId" INTEGER NOT NULL,
    "fechaProgramada" TIMESTAMP(3) NOT NULL,
    "duracionMinutos" INTEGER NOT NULL DEFAULT 60,
    "googleEventId" TEXT,
    "meetLink" TEXT,
    "calendarLink" TEXT,
    "resumen" TEXT,
    "acuerdos" JSONB,
    "realizada" BOOLEAN NOT NULL DEFAULT false,
    "fechaRealizacion" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReunionActividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipanteReunion" (
    "id" SERIAL NOT NULL,
    "reunionId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "nombre" TEXT,
    "email" TEXT NOT NULL,
    "rol" TEXT,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "asistio" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParticipanteReunion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionFase" (
    "id" SERIAL NOT NULL,
    "procesoId" INTEGER NOT NULL,
    "faseId" INTEGER NOT NULL,
    "fase" "FaseVinculacion" NOT NULL,
    "decision" "DecisionFaseTipo" NOT NULL,
    "justificacion" TEXT NOT NULL,
    "decididorId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionFase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetoTecnologico" (
    "id" SERIAL NOT NULL,
    "procesoId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "problema" TEXT NOT NULL,
    "objetivos" TEXT,
    "fichaTecnica" JSONB NOT NULL,
    "resultadosEsperados" TEXT,
    "restricciones" TEXT,
    "timelineEstimado" INTEGER,
    "nivelConfidencialidad" TEXT NOT NULL DEFAULT 'PUBLICO',
    "prioridad" INTEGER NOT NULL DEFAULT 3,
    "areasAcademicas" JSONB,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetoTecnologico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convocatoria" (
    "id" SERIAL NOT NULL,
    "retoId" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estatus" "EstatusConvocatoria" NOT NULL DEFAULT 'BORRADOR',
    "fechaApertura" TIMESTAMP(3) NOT NULL,
    "fechaCierre" TIMESTAMP(3) NOT NULL,
    "criteriosSeleccion" JSONB,
    "requisitosPostulacion" JSONB,
    "esRelanzamiento" BOOLEAN NOT NULL DEFAULT false,
    "convocatoriaOriginalId" INTEGER,
    "numeroRelanzamiento" INTEGER NOT NULL DEFAULT 1,
    "motivoRelanzamiento" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Convocatoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoInvestigacion" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "facultad" TEXT NOT NULL,
    "departamentoAcademico" TEXT,
    "coordinador" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "lineasInvestigacion" JSONB,
    "equipamiento" JSONB,
    "infraestructura" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrupoInvestigacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MiembroGrupo" (
    "id" SERIAL NOT NULL,
    "grupoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "email" TEXT,
    "especialidad" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MiembroGrupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostulacionGrupo" (
    "id" SERIAL NOT NULL,
    "retoId" INTEGER NOT NULL,
    "grupoId" INTEGER NOT NULL,
    "convocatoriaId" INTEGER NOT NULL,
    "notaInteres" TEXT NOT NULL,
    "capacidadesTecnicas" TEXT NOT NULL,
    "propuestaTecnica" TEXT,
    "cronogramaPropuesto" JSONB,
    "presupuestoEstimado" DOUBLE PRECISION,
    "equipoDisponible" JSONB,
    "documentosUrl" JSONB,
    "seleccionado" BOOLEAN NOT NULL DEFAULT false,
    "motivoRechazo" TEXT,
    "fechaPostulacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEvaluacion" TIMESTAMP(3),
    "puntajeTotal" DOUBLE PRECISION,
    "puntajesDetalle" JSONB,
    "observaciones" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostulacionGrupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "nombreComercial" TEXT,
    "sector" TEXT,
    "tamaño" TEXT,
    "departamento" TEXT,
    "provincia" TEXT,
    "distrito" TEXT,
    "direccion" TEXT,
    "contactoPrincipal" TEXT,
    "cargoContacto" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "verificada" BOOLEAN NOT NULL DEFAULT false,
    "fechaVerificacion" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcesoEmpresa" (
    "id" SERIAL NOT NULL,
    "procesoId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "rolEmpresa" "RolEmpresa" NOT NULL,
    "interesConfirmado" BOOLEAN NOT NULL DEFAULT false,
    "ndaFirmado" BOOLEAN NOT NULL DEFAULT false,
    "ndaFechaFirma" TIMESTAMP(3),
    "ndaArchivoUrl" TEXT,
    "cartaIntencionFirmada" BOOLEAN NOT NULL DEFAULT false,
    "cartaIntencionFecha" TIMESTAMP(3),
    "cartaIntencionArchivoUrl" TEXT,
    "fechaVinculacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canalVinculacion" TEXT,
    "estado" "EstadoVinculacionEmpresa" NOT NULL DEFAULT 'ACTIVA',
    "fechaRetiro" TIMESTAMP(3),
    "motivoRetiro" TEXT,
    "observaciones" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcesoEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Financiamiento" (
    "id" SERIAL NOT NULL,
    "procesoId" INTEGER NOT NULL,
    "tipoFinanciamiento" "TipoFinanciamiento" NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "capex" DOUBLE PRECISION,
    "opex" DOUBLE PRECISION,
    "fuenteDetalle" TEXT,
    "numeroConvocatoria" TEXT,
    "estadoGestion" "EstadoGestionFinanciamiento" NOT NULL DEFAULT 'PROPUESTO',
    "fuenteSistemaExterno" BOOLEAN NOT NULL DEFAULT false,
    "sistemaExternoId" TEXT,
    "fechaAprobacion" TIMESTAMP(3),
    "fechaDesembolso" TIMESTAMP(3),
    "observaciones" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Financiamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialTRL" (
    "id" SERIAL NOT NULL,
    "procesoId" INTEGER NOT NULL,
    "fase" "FaseVinculacion" NOT NULL,
    "trlAnterior" INTEGER,
    "trlNuevo" INTEGER NOT NULL,
    "justificacion" TEXT,
    "modificadoPor" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialTRL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialEstadoProceso" (
    "id" SERIAL NOT NULL,
    "procesoId" INTEGER NOT NULL,
    "estadoAnterior" "EstadoProceso",
    "estadoNuevo" "EstadoProceso" NOT NULL,
    "motivo" TEXT,
    "modificadoPor" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialEstadoProceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialFaseProceso" (
    "id" SERIAL NOT NULL,
    "procesoId" INTEGER NOT NULL,
    "faseAnterior" "FaseVinculacion",
    "faseNueva" "FaseVinculacion" NOT NULL,
    "motivo" TEXT,
    "modificadoPor" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialFaseProceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialEmpresaProceso" (
    "id" SERIAL NOT NULL,
    "procesoId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "accion" "AccionEmpresaProceso" NOT NULL,
    "rolAnterior" "RolEmpresa",
    "rolNuevo" "RolEmpresa",
    "motivo" TEXT,
    "modificadoPor" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialEmpresaProceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialActividad" (
    "id" SERIAL NOT NULL,
    "procesoId" INTEGER NOT NULL,
    "actividadId" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "estadoAnterior" TEXT,
    "estadoNuevo" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "metadata" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialActividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_activo_idx" ON "Usuario"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_codigo_key" ON "Rol"("codigo");

-- CreateIndex
CREATE INDEX "Rol_codigo_idx" ON "Rol"("codigo");

-- CreateIndex
CREATE INDEX "UsuarioRol_usuarioId_idx" ON "UsuarioRol"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioRol_rolId_idx" ON "UsuarioRol"("rolId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioRol_usuarioId_rolId_key" ON "UsuarioRol"("usuarioId", "rolId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_usuarioId_idx" ON "RefreshToken"("usuarioId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ProcesoVinculacion_codigo_key" ON "ProcesoVinculacion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ProcesoVinculacion_evaluacionId_key" ON "ProcesoVinculacion"("evaluacionId");

-- CreateIndex
CREATE INDEX "ProcesoVinculacion_tipoActivo_estado_idx" ON "ProcesoVinculacion"("tipoActivo", "estado");

-- CreateIndex
CREATE INDEX "ProcesoVinculacion_estado_deletedAt_idx" ON "ProcesoVinculacion"("estado", "deletedAt");

-- CreateIndex
CREATE INDEX "ProcesoVinculacion_sistemaOrigen_evaluacionId_idx" ON "ProcesoVinculacion"("sistemaOrigen", "evaluacionId");

-- CreateIndex
CREATE INDEX "ProcesoVinculacion_codigo_idx" ON "ProcesoVinculacion"("codigo");

-- CreateIndex
CREATE INDEX "ProcesoVinculacion_faseActual_idx" ON "ProcesoVinculacion"("faseActual");

-- CreateIndex
CREATE INDEX "ProcesoUsuario_procesoId_idx" ON "ProcesoUsuario"("procesoId");

-- CreateIndex
CREATE INDEX "ProcesoUsuario_usuarioId_idx" ON "ProcesoUsuario"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcesoUsuario_procesoId_usuarioId_rolProceso_key" ON "ProcesoUsuario"("procesoId", "usuarioId", "rolProceso");

-- CreateIndex
CREATE INDEX "FaseProceso_procesoId_estado_idx" ON "FaseProceso"("procesoId", "estado");

-- CreateIndex
CREATE INDEX "FaseProceso_responsableId_idx" ON "FaseProceso"("responsableId");

-- CreateIndex
CREATE INDEX "FaseProceso_procesoId_fase_deletedAt_idx" ON "FaseProceso"("procesoId", "fase", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FaseProceso_procesoId_fase_key" ON "FaseProceso"("procesoId", "fase");

-- CreateIndex
CREATE INDEX "ActividadFase_procesoId_fase_idx" ON "ActividadFase"("procesoId", "fase");

-- CreateIndex
CREATE INDEX "ActividadFase_procesoId_fase_estado_idx" ON "ActividadFase"("procesoId", "fase", "estado");

-- CreateIndex
CREATE INDEX "ActividadFase_procesoId_obligatoria_idx" ON "ActividadFase"("procesoId", "obligatoria");

-- CreateIndex
CREATE INDEX "ActividadFase_procesoId_fase_deletedAt_idx" ON "ActividadFase"("procesoId", "fase", "deletedAt");

-- CreateIndex
CREATE INDEX "ActividadFase_estado_idx" ON "ActividadFase"("estado");

-- CreateIndex
CREATE INDEX "ActividadFase_estado_fechaLimite_idx" ON "ActividadFase"("estado", "fechaLimite");

-- CreateIndex
CREATE INDEX "ActividadFase_faseProcesoId_idx" ON "ActividadFase"("faseProcesoId");

-- CreateIndex
CREATE INDEX "UsuarioActividad_actividadId_idx" ON "UsuarioActividad"("actividadId");

-- CreateIndex
CREATE INDEX "UsuarioActividad_usuarioId_idx" ON "UsuarioActividad"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioActividad_actividadId_usuarioId_rol_key" ON "UsuarioActividad"("actividadId", "usuarioId", "rol");

-- CreateIndex
CREATE INDEX "EvidenciaActividad_actividadId_idx" ON "EvidenciaActividad"("actividadId");

-- CreateIndex
CREATE INDEX "EvidenciaActividad_subidoPorId_idx" ON "EvidenciaActividad"("subidoPorId");

-- CreateIndex
CREATE INDEX "EvidenciaActividad_revisadoPorId_idx" ON "EvidenciaActividad"("revisadoPorId");

-- CreateIndex
CREATE INDEX "EvidenciaActividad_estado_idx" ON "EvidenciaActividad"("estado");

-- CreateIndex
CREATE INDEX "EvidenciaActividad_actividadId_estado_deletedAt_idx" ON "EvidenciaActividad"("actividadId", "estado", "deletedAt");

-- CreateIndex
CREATE INDEX "EvidenciaActividad_fase_estado_idx" ON "EvidenciaActividad"("fase", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "ReunionActividad_actividadId_key" ON "ReunionActividad"("actividadId");

-- CreateIndex
CREATE INDEX "ReunionActividad_actividadId_idx" ON "ReunionActividad"("actividadId");

-- CreateIndex
CREATE INDEX "ReunionActividad_fechaProgramada_idx" ON "ReunionActividad"("fechaProgramada");

-- CreateIndex
CREATE INDEX "ReunionActividad_realizada_idx" ON "ReunionActividad"("realizada");

-- CreateIndex
CREATE INDEX "ParticipanteReunion_reunionId_idx" ON "ParticipanteReunion"("reunionId");

-- CreateIndex
CREATE INDEX "ParticipanteReunion_usuarioId_idx" ON "ParticipanteReunion"("usuarioId");

-- CreateIndex
CREATE INDEX "ParticipanteReunion_email_idx" ON "ParticipanteReunion"("email");

-- CreateIndex
CREATE INDEX "DecisionFase_procesoId_idx" ON "DecisionFase"("procesoId");

-- CreateIndex
CREATE INDEX "DecisionFase_faseId_idx" ON "DecisionFase"("faseId");

-- CreateIndex
CREATE INDEX "DecisionFase_procesoId_fase_idx" ON "DecisionFase"("procesoId", "fase");

-- CreateIndex
CREATE INDEX "DecisionFase_decididorId_idx" ON "DecisionFase"("decididorId");

-- CreateIndex
CREATE INDEX "DecisionFase_procesoId_fecha_idx" ON "DecisionFase"("procesoId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "RetoTecnologico_procesoId_key" ON "RetoTecnologico"("procesoId");

-- CreateIndex
CREATE INDEX "RetoTecnologico_procesoId_idx" ON "RetoTecnologico"("procesoId");

-- CreateIndex
CREATE INDEX "RetoTecnologico_nivelConfidencialidad_idx" ON "RetoTecnologico"("nivelConfidencialidad");

-- CreateIndex
CREATE INDEX "RetoTecnologico_prioridad_idx" ON "RetoTecnologico"("prioridad");

-- CreateIndex
CREATE UNIQUE INDEX "Convocatoria_codigo_key" ON "Convocatoria"("codigo");

-- CreateIndex
CREATE INDEX "Convocatoria_retoId_idx" ON "Convocatoria"("retoId");

-- CreateIndex
CREATE INDEX "Convocatoria_estatus_fechaCierre_idx" ON "Convocatoria"("estatus", "fechaCierre");

-- CreateIndex
CREATE INDEX "Convocatoria_codigo_idx" ON "Convocatoria"("codigo");

-- CreateIndex
CREATE INDEX "Convocatoria_convocatoriaOriginalId_idx" ON "Convocatoria"("convocatoriaOriginalId");

-- CreateIndex
CREATE INDEX "Convocatoria_retoId_estatus_deletedAt_idx" ON "Convocatoria"("retoId", "estatus", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GrupoInvestigacion_codigo_key" ON "GrupoInvestigacion"("codigo");

-- CreateIndex
CREATE INDEX "GrupoInvestigacion_facultad_activo_idx" ON "GrupoInvestigacion"("facultad", "activo");

-- CreateIndex
CREATE INDEX "GrupoInvestigacion_codigo_idx" ON "GrupoInvestigacion"("codigo");

-- CreateIndex
CREATE INDEX "GrupoInvestigacion_activo_deletedAt_idx" ON "GrupoInvestigacion"("activo", "deletedAt");

-- CreateIndex
CREATE INDEX "MiembroGrupo_grupoId_activo_idx" ON "MiembroGrupo"("grupoId", "activo");

-- CreateIndex
CREATE INDEX "MiembroGrupo_grupoId_idx" ON "MiembroGrupo"("grupoId");

-- CreateIndex
CREATE INDEX "PostulacionGrupo_retoId_seleccionado_idx" ON "PostulacionGrupo"("retoId", "seleccionado");

-- CreateIndex
CREATE INDEX "PostulacionGrupo_grupoId_idx" ON "PostulacionGrupo"("grupoId");

-- CreateIndex
CREATE INDEX "PostulacionGrupo_convocatoriaId_idx" ON "PostulacionGrupo"("convocatoriaId");

-- CreateIndex
CREATE INDEX "PostulacionGrupo_seleccionado_idx" ON "PostulacionGrupo"("seleccionado");

-- CreateIndex
CREATE INDEX "PostulacionGrupo_retoId_convocatoriaId_deletedAt_idx" ON "PostulacionGrupo"("retoId", "convocatoriaId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_ruc_key" ON "Empresa"("ruc");

-- CreateIndex
CREATE INDEX "Empresa_ruc_idx" ON "Empresa"("ruc");

-- CreateIndex
CREATE INDEX "Empresa_sector_idx" ON "Empresa"("sector");

-- CreateIndex
CREATE INDEX "Empresa_verificada_idx" ON "Empresa"("verificada");

-- CreateIndex
CREATE INDEX "Empresa_deletedAt_idx" ON "Empresa"("deletedAt");

-- CreateIndex
CREATE INDEX "ProcesoEmpresa_procesoId_idx" ON "ProcesoEmpresa"("procesoId");

-- CreateIndex
CREATE INDEX "ProcesoEmpresa_empresaId_idx" ON "ProcesoEmpresa"("empresaId");

-- CreateIndex
CREATE INDEX "ProcesoEmpresa_rolEmpresa_idx" ON "ProcesoEmpresa"("rolEmpresa");

-- CreateIndex
CREATE INDEX "ProcesoEmpresa_estado_idx" ON "ProcesoEmpresa"("estado");

-- CreateIndex
CREATE INDEX "ProcesoEmpresa_interesConfirmado_idx" ON "ProcesoEmpresa"("interesConfirmado");

-- CreateIndex
CREATE INDEX "ProcesoEmpresa_ndaFirmado_idx" ON "ProcesoEmpresa"("ndaFirmado");

-- CreateIndex
CREATE INDEX "ProcesoEmpresa_procesoId_estado_deletedAt_idx" ON "ProcesoEmpresa"("procesoId", "estado", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProcesoEmpresa_procesoId_empresaId_key" ON "ProcesoEmpresa"("procesoId", "empresaId");

-- CreateIndex
CREATE INDEX "Financiamiento_procesoId_estadoGestion_idx" ON "Financiamiento"("procesoId", "estadoGestion");

-- CreateIndex
CREATE INDEX "Financiamiento_procesoId_idx" ON "Financiamiento"("procesoId");

-- CreateIndex
CREATE INDEX "Financiamiento_estadoGestion_idx" ON "Financiamiento"("estadoGestion");

-- CreateIndex
CREATE INDEX "Financiamiento_fuenteSistemaExterno_idx" ON "Financiamiento"("fuenteSistemaExterno");

-- CreateIndex
CREATE INDEX "Financiamiento_procesoId_deletedAt_idx" ON "Financiamiento"("procesoId", "deletedAt");

-- CreateIndex
CREATE INDEX "HistorialTRL_procesoId_idx" ON "HistorialTRL"("procesoId");

-- CreateIndex
CREATE INDEX "HistorialTRL_procesoId_fecha_idx" ON "HistorialTRL"("procesoId", "fecha");

-- CreateIndex
CREATE INDEX "HistorialTRL_modificadoPor_idx" ON "HistorialTRL"("modificadoPor");

-- CreateIndex
CREATE INDEX "HistorialEstadoProceso_procesoId_idx" ON "HistorialEstadoProceso"("procesoId");

-- CreateIndex
CREATE INDEX "HistorialEstadoProceso_procesoId_fecha_idx" ON "HistorialEstadoProceso"("procesoId", "fecha");

-- CreateIndex
CREATE INDEX "HistorialEstadoProceso_modificadoPor_idx" ON "HistorialEstadoProceso"("modificadoPor");

-- CreateIndex
CREATE INDEX "HistorialFaseProceso_procesoId_idx" ON "HistorialFaseProceso"("procesoId");

-- CreateIndex
CREATE INDEX "HistorialFaseProceso_procesoId_fecha_idx" ON "HistorialFaseProceso"("procesoId", "fecha");

-- CreateIndex
CREATE INDEX "HistorialFaseProceso_modificadoPor_idx" ON "HistorialFaseProceso"("modificadoPor");

-- CreateIndex
CREATE INDEX "HistorialEmpresaProceso_procesoId_idx" ON "HistorialEmpresaProceso"("procesoId");

-- CreateIndex
CREATE INDEX "HistorialEmpresaProceso_empresaId_idx" ON "HistorialEmpresaProceso"("empresaId");

-- CreateIndex
CREATE INDEX "HistorialEmpresaProceso_procesoId_fecha_idx" ON "HistorialEmpresaProceso"("procesoId", "fecha");

-- CreateIndex
CREATE INDEX "HistorialActividad_procesoId_fecha_idx" ON "HistorialActividad"("procesoId", "fecha");

-- CreateIndex
CREATE INDEX "HistorialActividad_actividadId_idx" ON "HistorialActividad"("actividadId");

-- CreateIndex
CREATE INDEX "HistorialActividad_usuarioId_idx" ON "HistorialActividad"("usuarioId");

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcesoUsuario" ADD CONSTRAINT "ProcesoUsuario_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoVinculacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcesoUsuario" ADD CONSTRAINT "ProcesoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaseProceso" ADD CONSTRAINT "FaseProceso_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoVinculacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaseProceso" ADD CONSTRAINT "FaseProceso_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActividadFase" ADD CONSTRAINT "ActividadFase_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoVinculacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActividadFase" ADD CONSTRAINT "ActividadFase_faseProcesoId_fkey" FOREIGN KEY ("faseProcesoId") REFERENCES "FaseProceso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioActividad" ADD CONSTRAINT "UsuarioActividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "ActividadFase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioActividad" ADD CONSTRAINT "UsuarioActividad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenciaActividad" ADD CONSTRAINT "EvidenciaActividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "ActividadFase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenciaActividad" ADD CONSTRAINT "EvidenciaActividad_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenciaActividad" ADD CONSTRAINT "EvidenciaActividad_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReunionActividad" ADD CONSTRAINT "ReunionActividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "ActividadFase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteReunion" ADD CONSTRAINT "ParticipanteReunion_reunionId_fkey" FOREIGN KEY ("reunionId") REFERENCES "ReunionActividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteReunion" ADD CONSTRAINT "ParticipanteReunion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionFase" ADD CONSTRAINT "DecisionFase_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoVinculacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionFase" ADD CONSTRAINT "DecisionFase_faseId_fkey" FOREIGN KEY ("faseId") REFERENCES "FaseProceso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionFase" ADD CONSTRAINT "DecisionFase_decididorId_fkey" FOREIGN KEY ("decididorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetoTecnologico" ADD CONSTRAINT "RetoTecnologico_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoVinculacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convocatoria" ADD CONSTRAINT "Convocatoria_retoId_fkey" FOREIGN KEY ("retoId") REFERENCES "RetoTecnologico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convocatoria" ADD CONSTRAINT "Convocatoria_convocatoriaOriginalId_fkey" FOREIGN KEY ("convocatoriaOriginalId") REFERENCES "Convocatoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MiembroGrupo" ADD CONSTRAINT "MiembroGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoInvestigacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostulacionGrupo" ADD CONSTRAINT "PostulacionGrupo_retoId_fkey" FOREIGN KEY ("retoId") REFERENCES "RetoTecnologico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostulacionGrupo" ADD CONSTRAINT "PostulacionGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoInvestigacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostulacionGrupo" ADD CONSTRAINT "PostulacionGrupo_convocatoriaId_fkey" FOREIGN KEY ("convocatoriaId") REFERENCES "Convocatoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcesoEmpresa" ADD CONSTRAINT "ProcesoEmpresa_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoVinculacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcesoEmpresa" ADD CONSTRAINT "ProcesoEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financiamiento" ADD CONSTRAINT "Financiamiento_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoVinculacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialTRL" ADD CONSTRAINT "HistorialTRL_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoVinculacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialTRL" ADD CONSTRAINT "HistorialTRL_modificadoPor_fkey" FOREIGN KEY ("modificadoPor") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstadoProceso" ADD CONSTRAINT "HistorialEstadoProceso_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoVinculacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstadoProceso" ADD CONSTRAINT "HistorialEstadoProceso_modificadoPor_fkey" FOREIGN KEY ("modificadoPor") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialFaseProceso" ADD CONSTRAINT "HistorialFaseProceso_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoVinculacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialFaseProceso" ADD CONSTRAINT "HistorialFaseProceso_modificadoPor_fkey" FOREIGN KEY ("modificadoPor") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEmpresaProceso" ADD CONSTRAINT "HistorialEmpresaProceso_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoVinculacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEmpresaProceso" ADD CONSTRAINT "HistorialEmpresaProceso_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEmpresaProceso" ADD CONSTRAINT "HistorialEmpresaProceso_modificadoPor_fkey" FOREIGN KEY ("modificadoPor") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialActividad" ADD CONSTRAINT "HistorialActividad_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "ProcesoVinculacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialActividad" ADD CONSTRAINT "HistorialActividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "ActividadFase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialActividad" ADD CONSTRAINT "HistorialActividad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
