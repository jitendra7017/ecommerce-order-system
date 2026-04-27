import { signUserToken, verifyUserToken, type JwtUserPayload } from "@repo/auth";
import { env } from "../config/env.js";

export const issueAccessToken = (payload: JwtUserPayload): string =>
  signUserToken(payload, env.jwtSecret, env.jwtExpiresIn);

export const decodeAccessToken = (token: string): JwtUserPayload =>
  verifyUserToken(token, env.jwtSecret);
