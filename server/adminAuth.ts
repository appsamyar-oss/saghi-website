import type { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import firebaseConfig from '../firebase-applet-config.json';

// Firebase ID tokens are signed by Google's securetoken service.
// https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;

function getAdminUids(): string[] {
  return (process.env.ADMIN_UIDS || '')
    .split(',')
    .map((uid) => uid.trim())
    .filter(Boolean);
}

export async function verifyFirebaseIdToken(token: string): Promise<{ uid: string; email?: string }> {
  const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ['RS256'],
  });
  if (!payload.sub) throw new Error('Token has no subject');
  return { uid: payload.sub, email: typeof payload.email === 'string' ? payload.email : undefined };
}

/**
 * Express middleware: only lets through requests carrying a valid Firebase ID
 * token for a user whose UID is listed in the ADMIN_UIDS environment variable.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminUids = getAdminUids();
  if (adminUids.length === 0) {
    return res.status(503).json({ success: false, error: 'Admin access is not configured on the server (ADMIN_UIDS)' });
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const user = await verifyFirebaseIdToken(token);
    if (!adminUids.includes(user.uid)) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    (req as any).adminUser = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired session' });
  }
}
