import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/auth';

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check cookies
  const token = request.cookies.get('token')?.value;
  return token || null;
}

export function authenticateRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export function requireAuth(
  request: NextRequest
): { user: JWTPayload } | { error: string; status: number } {
  const user = authenticateRequest(request);
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  return { user };
}

export function requireAdmin(
  request: NextRequest
): { user: JWTPayload } | { error: string; status: number } {
  const authResult = requireAuth(request);
  if ('error' in authResult) {
    return authResult;
  }

  if (authResult.user.role !== 'ADMIN') {
    return { error: 'Forbidden - Admin access required', status: 403 };
  }

  return authResult;
}

