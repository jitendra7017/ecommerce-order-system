import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export interface JwtUserPayload {
  id: number;
  role: string;
  firstName?: string;
  lastName?: string;
}

export type JwtExpiresIn = jwt.SignOptions["expiresIn"];

export const extractBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
};

export const signUserToken = (
  payload: JwtUserPayload,
  secret: string,
  expiresIn: JwtExpiresIn = "7d",
): string => jwt.sign(payload, secret, { expiresIn });

export const verifyUserToken = (token: string, secret: string): JwtUserPayload =>
  jwt.verify(token, secret) as JwtUserPayload;

export const DEFAULT_PASSWORD_SALT_ROUNDS = 10;

export const hashPassword = async (
  password: string,
  saltRounds: number = DEFAULT_PASSWORD_SALT_ROUNDS,
): Promise<string> => bcrypt.hash(password, saltRounds);

export const verifyPassword = async (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);
