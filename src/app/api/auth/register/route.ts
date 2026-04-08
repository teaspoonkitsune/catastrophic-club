import { NextResponse } from 'next/server';
import { writeAuthSessionToResponse } from '@/shared/auth';
import { KeycloakAuthError, loginWithKeycloakPassword, registerKeycloakUser } from '@/shared/auth/keycloak';
import { getRequestI18n } from '@/shared/i18n/server';

export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/', request.url));
}

export async function POST(request: Request) {
  const { messages } = await getRequestI18n();
  const body = (await request.json().catch(() => null)) as Partial<{
    name: string;
    email: string;
    password: string;
  }> | null;
  const name = body?.name?.trim() || null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ error: messages.auth.errors.missingEmailPassword }, { status: 400 });
  }

  if (!email.includes('@')) {
    return NextResponse.json({ error: messages.auth.errors.invalidEmail }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: messages.auth.errors.shortPassword }, { status: 400 });
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
      const localizedError =
        error.status === 409
          ? messages.auth.errors.accountExists
          : error.status === 502
            ? messages.auth.errors.loadAccountFailed
            : messages.auth.errors.genericCreateFailed;

      return NextResponse.json({ error: localizedError }, { status: error.status });
    }

    console.error('Failed to register with Keycloak', error);
    return NextResponse.json({ error: messages.auth.errors.genericCreateFailed }, { status: 500 });
  }
}
