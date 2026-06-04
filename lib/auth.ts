// PhoneLab — Admin oturum JWT yardımcıları (jose, edge-uyumlu).
// Access (15m) + Refresh (7d) ikili token; ikisi de httpOnly cookie. localStorage yok.
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export const ACCESS_COOKIE = 'pl_admin';
export const REFRESH_COOKIE = 'pl_refresh';

export const ACCESS_MAX_AGE = 15 * 60; // 15 dakika
export const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7 gün

// Refresh cookie yalnızca auth endpoint'lerine gönderilsin (exposure azaltma)
export const REFRESH_PATH = '/api/admin/auth';

type TokenType = 'access' | 'refresh';

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET tanımsız veya 32 karakterden kısa');
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload extends JWTPayload {
  username: string;
  type: TokenType;
}

interface AdminIdentity {
  id: number;
  username: string;
}

function signToken(input: AdminIdentity, type: TokenType, expiresIn: string): Promise<string> {
  return new SignJWT({ username: input.username, type })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(input.id))
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey());
}

export function createAccessToken(input: AdminIdentity): Promise<string> {
  return signToken(input, 'access', '15m');
}

export function createRefreshToken(input: AdminIdentity): Promise<string> {
  return signToken(input, 'refresh', '7d');
}

export async function verifyToken(token: string, expected: TokenType): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, secretKey());
  if (payload.type !== expected) {
    throw new Error('Beklenmeyen token türü');
  }
  return payload as SessionPayload;
}

// NextResponse.cookies.set ile kullanılacak ortak seçenekler
export function cookieOptions(maxAge: number, path = '/') {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path,
    maxAge,
  };
}
