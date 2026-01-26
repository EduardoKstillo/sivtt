import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { UnauthorizedError, ConflictError } from '../utils/errors.js';

class AuthService {
  async login(email, password) {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isPasswordValid = await comparePassword(password, usuario.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const payload = {
      id: usuario.id,
      email: usuario.email,
      roles: usuario.roles.map(ur => ur.rol.codigo)
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

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
        roles: usuario.roles.map(ur => ur.rol.codigo)
      }
    };
  }

  async refresh(token) {
    const decoded = verifyRefreshToken(token);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }

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

    const payload = {
      id: usuario.id,
      email: usuario.email,
      roles: usuario.roles.map(ur => ur.rol.codigo)
    };

    const accessToken = generateAccessToken(payload);

    return { accessToken };
  }

  async logout(token) {
    await prisma.refreshToken.deleteMany({
      where: { token }
    });
  }
}

export default new AuthService();