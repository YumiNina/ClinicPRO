import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  email: string;
  rol: string;
}

export const generateAccessToken = (payload: TokenPayload) => {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    }
  );
};

export const generateRefreshToken = (payload: TokenPayload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    }
  );
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