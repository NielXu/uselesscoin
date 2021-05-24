// Angular
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

// rxjs
import { Observable } from 'rxjs';

// environment
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