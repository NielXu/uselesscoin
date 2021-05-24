import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PeerService {
  constructor(private http: HttpClient) {}

  getPeers(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.backendUrl}/peers`);
  }

  createWs(): WebSocketSubject<any> {
    return webSocket(environment.socketUrl);
  }
}
