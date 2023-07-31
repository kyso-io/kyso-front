import { WebSocketEvent } from '@kyso-io/kyso-model';
import io, { Socket } from 'socket.io-client';

class Websocket {
  private socket!: Socket;

  public connect(token: string): void {
    let baseUrl: string = window.location.host;
    let pathName: string = '/api/v1';
    let protocol: string = window.location.protocol === 'https:' ? 'wss' : 'ws';
    if (process.env.KYSO_API) {
      baseUrl = new URL(process.env.KYSO_API).host;
      pathName = new URL(process.env.KYSO_API).pathname;
      protocol = new URL(process.env.KYSO_API).protocol === 'https:' ? 'wss' : 'ws';
    } else if (process.env.NEXT_PUBLIC_API_URL) {
      baseUrl = new URL(process.env.NEXT_PUBLIC_API_URL).host;
      pathName = new URL(process.env.NEXT_PUBLIC_API_URL).pathname;
      protocol = new URL(process.env.NEXT_PUBLIC_API_URL).protocol === 'https:' ? 'wss' : 'ws';
    }
    this.socket = io(`${protocol}://${baseUrl}`, {
      path: `${pathName}/ws`,
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    });
    this.socket.on('connect', () => {
      console.log('Connected to websocket');
    });
    this.socket.on('disconnect', () => {
      console.log('Disconnected from websocket');
    });
    this.socket.on('connect_error', (error: any) => {
      console.log('Error connecting to websocket', error);
    });
  }

  get isConnected(): boolean {
    return this.socket?.connected === true;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  public on(event: WebSocketEvent, callback: (data: any) => void): void {
    this.socket.on(event, callback);
  }

  public emit(event: WebSocketEvent, data: any): void {
    this.socket.emit(event, data);
  }

  public once(event: WebSocketEvent, callback: (data: any) => void): void {
    this.socket.once(event, callback);
  }

  public off(event: WebSocketEvent, callback?: (data: any) => void): void {
    this.socket.off(event, callback);
  }

  public removeListener(event: WebSocketEvent, callback: (data: any) => void): void {
    this.socket.removeListener(event, callback);
  }

  public removeAllListeners(event: WebSocketEvent): void {
    this.socket.removeAllListeners(event);
  }

  public listeners(event: WebSocketEvent): Function[] {
    return this.socket.listeners(event);
  }

  public hasListeners(event: WebSocketEvent): boolean {
    return this.socket.hasListeners(event);
  }

  public connected(): boolean {
    return this.socket.connected;
  }

  public disconnected(): boolean {
    return this.socket.disconnected;
  }
}

export const websocket: Websocket = new Websocket();
