import multer from 'multer';
import path from 'path';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const allowedMimes = {
  DOCUMENTO: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  IMAGEN: ['image/jpeg', 'image/png', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm'],
  ACTA: ['application/pdf'],
  INFORME: ['application/pdf'],
  PRESENTACION: [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ],
  OTRO: [] // sin restricción
};

const storage = multer.diskStorage({
  destination: 'uploads/evidencias/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  }
});

export const uploadEvidencia = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    const tipo = req.body.tipoEvidencia;

    if (!tipo) {
      return cb(new Error('tipoEvidencia es requerido antes de subir el archivo'));
    }

    const allowed = allowedMimes[tipo] || [];

    if (allowed.length && !allowed.includes(file.mimetype)) {
      return cb(
        new Error(`Tipo de archivo no permitido para ${tipo}`)
      );
    }

    cb(null, true);
  }
});
