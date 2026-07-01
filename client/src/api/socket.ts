import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token?: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.token = token || localStorage.getItem('token');

    this.socket = io('/api', {
      auth: this.token ? { token: this.token } : undefined,
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${reason}`);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    // Nation events
    this.socket.on('nation:joined', (data: any) => {
      console.log('Joined nation:', data);
      this.emitToHandlers('nation:joined', data);
    });

    this.socket.on('nation:update', (data: any) => {
      this.emitToHandlers('nation:update', data);
    });

    // World events
    this.socket.on('world:update', (data: any) => {
      this.emitToHandlers('world:update', data);
    });
  }

  private handlers: Map<string, Set<Function>> = new Map();

  on(event: string, callback: Function): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(callback);
    }
  }

  private emitToHandlers(event: string, data: any): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in handler for ${event}:`, error);
        }
      });
    }
  }

  // Nation methods
  joinNation(nationId: string): void {
    this.socket?.emit('nation:join', nationId);
  }

  leaveNation(nationId: string): void {
    this.socket?.emit('nation:leave', nationId);
  }

  // World methods
  subscribeChunk(chunkX: number, chunkY: number): void {
    this.socket?.emit('world:subscribe', chunkX, chunkY);
  }

  unsubscribeChunk(chunkX: number, chunkY: number): void {
    this.socket?.emit('world:unsubscribe', chunkX, chunkY);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketClient = new SocketClient();
export default socketClient;