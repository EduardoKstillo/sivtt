import multer from 'multer';
import path from 'path';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const allowedMimes = {
  DOCUMENTO: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', // Agregado txt por si acaso
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // xlsx
  ],
  IMAGEN: ['image/jpeg', 'image/png', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/x-msvideo'],
  ACTA: ['application/pdf'],
  INFORME: ['application/pdf'],
  PRESENTACION: [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ],
  // 🔥 AGREGADO: Para evitar crash si allowedMimes['ENLACE'] es undefined
  ENLACE: [], 
  OTRO: [] // sin restricción
};

const storage = multer.diskStorage({
  destination: 'uploads/evidencias/',
  filename: (req, file, cb) => {
    // Asegurarse de limpiar el nombre de caracteres raros
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + ext);
  }
});

export const uploadEvidencia = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    const tipo = req.body.tipoEvidencia;

    // Si no mandan tipo, error
    if (!tipo) {
      return cb(new Error('tipoEvidencia es requerido antes de subir el archivo'));
    }

    // Si el tipo es ENLACE, en teoría no debería venir archivo, 
    // pero si viene, lo dejamos pasar o lo bloqueamos. Aquí lo dejamos pasar (array vacío en allowedMimes).
    const allowed = allowedMimes[tipo] || [];

    // Si la lista de permitidos tiene algo, validamos. Si está vacía (OTRO, ENLACE), pasa todo.
    if (allowed.length > 0 && !allowed.includes(file.mimetype)) {
      return cb(
        new Error(`Tipo de archivo no permitido para ${tipo} (${file.mimetype})`)
      );
    }

    cb(null, true);
  }
});