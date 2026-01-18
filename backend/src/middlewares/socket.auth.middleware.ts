import type { TypedSocket } from '../types/socket.d.js';
import { verifyToken } from '../lib/verifyToken.js';
import cookie from 'cookie';

export async function socketAuthMiddleware(socket: TypedSocket, next: (err?: Error) => void) {
  try {
    // Extract token from cookies or handshake auth
    const cookies = socket.request.headers.cookie;
    let token: string | undefined;

    if (cookies) {
      const parsed = cookie.parse(cookies);
      token = parsed.auth_token;
    }

    // Fallback to handshake auth
    if (!token && socket.handshake.auth?.token) {
      token = socket.handshake.auth.token;
    }

    if (!token) {
      console.warn('[SOCKET_AUTH] No token provided', { socketId: socket.id });
      return next(new Error('Authentication required'));
    }

    // Verify JWT using existing infrastructure
    const decoded = await verifyToken({ token });

    // Attach user to socket data
    socket.data.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    console.info('[SOCKET_AUTH] Authenticated', {
      socketId: socket.id,
      userId: decoded.userId,
    });

    next();
  } catch (error) {
    console.error('[SOCKET_AUTH] Authentication failed', {
      socketId: socket.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(new Error('Invalid token'));
  }
}

// Rate limiter for socket events
const eventLimits = new Map<string, { count: number; resetAt: number }>();

export function socketRateLimiter(socket: TypedSocket, next: (err?: Error) => void) {
  const userId = socket.data.user?.id;
  if (!userId) return next();

  const now = Date.now();
  const key = `${userId}:${socket.id}`;
  const limit = eventLimits.get(key);

  // 10 events per minute
  const maxEvents = 10;
  const windowMs = 60 * 1000;

  if (limit && limit.resetAt > now) {
    if (limit.count >= maxEvents) {
      console.warn('[SOCKET_RATE_LIMIT] Limit exceeded', { userId, socketId: socket.id });
      return next(new Error('Rate limit exceeded'));
    }
    limit.count++;
  } else {
    eventLimits.set(key, { count: 1, resetAt: now + windowMs });
  }

  next();
}
