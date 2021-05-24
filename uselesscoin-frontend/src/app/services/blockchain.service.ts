import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Block } from '../classes/block';

@Injectable({
  providedIn: 'root',
})
export class BlockChainService {
  constructor(private http: HttpClient) {}

  getAllBlocks(): Observable<{ blockchain: Block[] }> {
    return this.http.get<{ blockchain: Block[] }>(`${environment.backendUrl}/blocks`);
  }

}