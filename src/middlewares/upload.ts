import multer from 'multer';

// Configuración para almacenamiento en memoria (opcional: podrías usar disco)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (file.mimetype !== 'application/json') {
      return cb(new Error('Solo se permiten archivos JSON'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // Máximo 2MB
  }
});
