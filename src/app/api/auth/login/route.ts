import { NextResponse } from 'next/server';
import { writeAuthSessionToResponse } from '@/shared/auth';
import { KeycloakAuthError, loginWithKeycloakPassword } from '@/shared/auth/keycloak';

export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/', request.url));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<{
    username: string;
    password: string;
  }> | null;
  const username = body?.username?.trim();
  const password = body?.password;

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  try {
    const { session, user } = await loginWithKeycloakPassword(username, password);
    const response = NextResponse.json({ ok: true, user });
    writeAuthSessionToResponse(response, session);
    return response;
  } catch (error) {
    if (error instanceof KeycloakAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Failed to sign in with Keycloak', error);
    return NextResponse.json({ error: 'Failed to sign in' }, { status: 500 });
  }
}
