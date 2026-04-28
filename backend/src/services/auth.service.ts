import bcrypt from 'bcrypt';
import * as userRepo from '../repositories/user.repository.js';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function login(email: string, password: string) {
  const user = await userRepo.findUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function getProfile(userId: string) {
  const user = await userRepo.findUserById(userId);

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
