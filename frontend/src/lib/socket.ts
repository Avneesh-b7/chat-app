import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl: string;

  constructor() {
    this.serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3003';
  }

  connect(userId: string, token?: string): void {
    if (this.socket?.connected) {
      console.log('[SOCKET] Already connected');
      return;
    }

    this.socket = io(this.serverUrl, {
      withCredentials: true, // Send cookies
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('[SOCKET] Connected', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SOCKET] Connection error', error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn('[SOCKET] Not connected, cannot emit', event);
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
