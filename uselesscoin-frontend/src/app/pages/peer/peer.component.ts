import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';

import { PeerService } from '../../services/peer.service';

@Component({
  selector: 'app-peer',
  templateUrl: './peer.component.html',
  styleUrls: ['./peer.component.scss']
})
export class PeerComponent implements OnInit{

  websocket: WebSocketSubject<any>;
  peers: string[];

  constructor(private peerService: PeerService) {}

  ngOnInit() {
    this.connect();
    this.getPeers();
  }

  getPeers() {
    this.peers = [];
    this.peerService
      .getPeers()
      .subscribe(
        (result) => {
          this.peers = result;
        }
      )
  }

  connect() {
    this.websocket = this.peerService.createWs();
    this.websocket.subscribe(
      msg => this.handleRecvMsg(msg),
      err => this.handleError(err),
      () => this.handleComplete(),
    );
  }

  handleRecvMsg(msg: any) {
    console.log(msg);
  }

  handleError(err: any) {
    console.log(err);
  }

  handleComplete() {
    console.log("Complete");
  }
}
