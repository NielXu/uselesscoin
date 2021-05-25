import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { Message } from '../classes/message';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PeerService {
  constructor(private http: HttpClient) {}

  createWs(url: string): WebSocketSubject<any> {
    return webSocket(url);
  }

  addPeer(backendUrl: string, wsUrl: string): Observable<{ success: boolean}> {
    return this.http.post<{ success: boolean }>(`${backendUrl}/addPeer`, { peer: wsUrl });
  }

  getPeers(backendUrl: string): Observable<string[]> {
    return this.http.get<string[]>(`${backendUrl}/peers`);
  }

  sendMsg(ws: WebSocketSubject<any>, msg: Message) {
    ws.next(msg);
  }
}
