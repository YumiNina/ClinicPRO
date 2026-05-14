import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  email: string;
  rol: string;
}

export const generateAccessToken = (payload: TokenPayload) => {
  const secret = process.env.JWT_ACCESS_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (payload: TokenPayload) => {
  const secret = process.env.JWT_REFRESH_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET as string
  );
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET as string
  );
};
