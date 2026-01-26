import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import prisma from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedError('Usuario no encontrado o inactivo');
    }

    req.user = {
      id: usuario.id,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      roles: usuario.roles.map(ur => ur.rol.codigo)
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("ROLES DE USUARIO:")
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));

    console.log(req.user.roles)

    if (!hasRole && !req.user.roles.includes('ADMIN_SISTEMA')) {
      return next(new ForbiddenError('No tiene permisos para realizar esta acción'));
    }

    next();
  };
};