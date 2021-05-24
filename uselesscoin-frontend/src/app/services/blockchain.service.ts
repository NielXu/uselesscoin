// Angular
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

// rxjs
import { Observable } from 'rxjs';

// environment
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class BlockChainService {
  constructor(private http: HttpClient) {}

  getAllBlocks() {
    return this.http.get(`${environment.backendUrl}/blocks`);
  }

}