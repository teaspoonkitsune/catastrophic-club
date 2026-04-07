import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { getAuthSecret } from './config';
import { decryptPayload, encryptPayload } from './crypto';

const SESSION_COOKIE_NAME = 'catastrophic_club_session';
const OAUTH_STATE_COOKIE_NAME = 'catastrophic_club_oauth_state';

type AuthUser = {
  subject: string;
  email: string;
  name: string | null;
};

type AuthSession = {
  user: AuthUser;
  idToken: string | null;
  expiresAt: string;
};

type OauthState = {
  state: string;
  codeVerifier: string;
  returnTo: string;
};

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function decodeValue<T>(value: string): T | null {
  try {
    return parseJson<T>(decryptPayload(value, getAuthSecret()));
  } catch {
    // Treat stale, tampered, or key-rotated cookies as an anonymous session.
    return null;
  }
}

function encodeValue(value: unknown) {
  return encryptPayload(JSON.stringify(value), getAuthSecret());
}

function deleteCookie(response: NextResponse, name: string) {
  response.cookies.set(name, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  const session = decodeValue<AuthSession>(value);

  if (!session) {
    return null;
  }

  if (Date.parse(session.expiresAt) <= Date.now()) {
    return null;
  }

  return session;
}

export async function writeAuthSession(session: AuthSession) {
  const cookieStore = await cookies();
  const maxAge = Math.max(
    60,
    Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1000),
  );

  cookieStore.set(SESSION_COOKIE_NAME, encodeValue(session), getCookieOptions(maxAge));
}

export function writeAuthSessionToResponse(
  response: NextResponse,
  session: AuthSession,
) {
  const maxAge = Math.max(
    60,
    Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1000),
  );

  response.cookies.set(
    SESSION_COOKIE_NAME,
    encodeValue(session),
    getCookieOptions(maxAge),
  );
}

export async function clearAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function clearAuthSessionFromResponse(response: NextResponse) {
  deleteCookie(response, SESSION_COOKIE_NAME);
}

export async function getOauthState(): Promise<OauthState | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  return decodeValue<OauthState>(value);
}

export async function writeOauthState(state: OauthState) {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE_NAME, encodeValue(state), getCookieOptions(60 * 10));
}

export function writeOauthStateToResponse(response: NextResponse, state: OauthState) {
  response.cookies.set(
    OAUTH_STATE_COOKIE_NAME,
    encodeValue(state),
    getCookieOptions(60 * 10),
  );
}

export async function clearOauthState() {
  const cookieStore = await cookies();
  cookieStore.delete(OAUTH_STATE_COOKIE_NAME);
}

export function clearOauthStateFromResponse(response: NextResponse) {
  deleteCookie(response, OAUTH_STATE_COOKIE_NAME);
}

export type { AuthSession, AuthUser };
