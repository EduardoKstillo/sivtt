import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

class AuthService {
  // Helper interno: obtener roles y permisos de sistema del usuario
  async _getRolesYPermisos(usuarioId) {
    const usuarioRoles = await prisma.usuarioRol.findMany({
      // ✅ Filtro activo en el where del findMany, no dentro del include
      where: {
        usuarioId,
        rol: { activo: true }
      },
      include: {
        rol: {
          include: {
            permisos: {
              include: { permiso: true }
            }
          }
        }
      }
    });

    const roles = [];
    const permisosSet = new Set();

    for (const ur of usuarioRoles) {
      if (!ur.rol) continue; // rol inactivo
      roles.push(ur.rol.codigo);
      for (const rp of ur.rol.permisos) {
        permisosSet.add(rp.permiso.codigo);
      }
    }

    return { roles, permisos: Array.from(permisosSet) };
  }

  async login(email, password) {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario || !usuario.activo || usuario.deletedAt) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isPasswordValid = await comparePassword(password, usuario.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const { roles, permisos } = await this._getRolesYPermisos(usuario.id);

    const payload = {
      id: usuario.id,
      email: usuario.email,
      roles,
      permisos
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ id: usuario.id, email: usuario.email });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        usuarioId: usuario.id,
        expiresAt
      }
    });

    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        roles,
        permisos
      }
    };
  }

  async refresh(token) {
    const decoded = verifyRefreshToken(token);

    const storedToken = await prisma.refreshToken.findUnique({ where: { token } });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id }
    });

    if (!usuario || !usuario.activo || usuario.deletedAt) {
      throw new UnauthorizedError('Usuario no encontrado o inactivo');
    }

    // Recalcular roles y permisos al refrescar (captura cambios recientes)
    const { roles, permisos } = await this._getRolesYPermisos(usuario.id);

    const payload = {
      id: usuario.id,
      email: usuario.email,
      roles,
      permisos
    };

    const accessToken = generateAccessToken(payload);

    return { accessToken };
  }

  async logout(token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
}

export default new AuthService();