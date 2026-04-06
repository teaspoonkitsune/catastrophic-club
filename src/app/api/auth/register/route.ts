import { NextResponse } from 'next/server';
import { writeAuthSessionToResponse } from '@/shared/auth';
import { KeycloakAuthError, loginWithKeycloakPassword, registerKeycloakUser } from '@/shared/auth/keycloak';

export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/', request.url));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<{
    name: string;
    email: string;
    password: string;
  }> | null;
  const name = body?.name?.trim() || null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
  }

  try {
    await registerKeycloakUser({
      email,
      password,
      name,
    });

    const { session, user } = await loginWithKeycloakPassword(email, password, name);
    const response = NextResponse.json({ ok: true, user }, { status: 201 });
    writeAuthSessionToResponse(response, session);
    return response;
  } catch (error) {
    if (error instanceof KeycloakAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Failed to register with Keycloak', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
