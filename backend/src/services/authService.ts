import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { userRepository } from '../repositories/userRepository.js';
import { LoginInput, RegisterInput, CreateUserInput } from '../utils/validation.js';
import { UnauthorizedError, ConflictError } from '../utils/errors.js';
import { JwtPayload } from '../types/index.js';

export const authService = {
  async login({ email, password }: LoginInput) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '8h' } as jwt.SignOptions);

    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  },

  async register({ email, password, name }: RegisterInput) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
    const user = await userRepository.create({ email, passwordHash, name, role: 'admin' });

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '8h' } as jwt.SignOptions);

    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  },

  async createUser({ email, password, name, role }: CreateUserInput) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
    const user = await userRepository.create({ email, passwordHash, name, role });

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '8h' } as jwt.SignOptions);

    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  },
};