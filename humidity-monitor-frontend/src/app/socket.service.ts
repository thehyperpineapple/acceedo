import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly SOCKET_URL = 'http://localhost:3000'; // Replace with your server's URL

  constructor() {
    this.socket = io(this.SOCKET_URL);
  }

  // Connect to the server
  connect(): void {
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });
  }

  // Disconnect from the server
  disconnect(): void {
    this.socket.disconnect();
  }

  // Listen for data updates from the server
  listenForUpdates(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      });
    });
  }

  // Emit an event to the server
  emitEvent(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }
}