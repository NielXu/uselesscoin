import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';

import { MessageType, Message } from '../../classes/message';
import { Block } from '../../classes/block';
import { PeerService } from '../../services/peer.service';
import { BlockChainService } from '../../services/blockchain.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit{

  loading: boolean = false;
  blocks: Block[] = [];

  nodeUrl: string;
  p2pUrl: string;
  websocket: WebSocketSubject<any>;

  newPeer: string;
  peers: string[] = [];

  error: string;

  constructor(
    private blockChainService: BlockChainService,
    private peerService: PeerService,
  ) {}

  ngOnInit() {
  }

  getAllBlocks() {
    this.loading = true;
    this.blocks = [];
    this.blockChainService
      .getAllBlocks(this.nodeUrl)
      .subscribe(
        (result) => {
          this.blocks = result.blockchain.reverse();
          this.loading = false;
        }
      );
  }

  getPeers() {
    this.peerService
      .getPeers(this.nodeUrl)
      .subscribe(
        (result) => {
          this.peers = result;
        }
      )
  }

  addPeer() {
    if (!this.nodeUrl || !this.p2pUrl) {
      this.error = "Must provide the Node URL and the P2P WebSocket URL";
      return;
    }
    else if (!this.newPeer) {
      this.error = "Must provide the peer WebSocket URL";
      return;
    }
    this.peerService
      .addPeer(this.nodeUrl, this.newPeer)
      .subscribe(
        ({ success }) => {
          if (success) {
            this.getPeers();
          }
        }
      )
  }

  connect() {
    if (!this.nodeUrl || !this.p2pUrl) {
      this.error = "Must provide the Node URL and the P2P WebSocket URL";
      return;
    }
    this.websocket = this.peerService.createWs(this.p2pUrl);
    this.queryBlockChain();
    this.websocket.subscribe(
      msg => this.handleRecvMsg(msg),
      err => this.handleError(err),
      () => this.handleComplete(),
    );
  }

  queryLatestBlock() {
    this.peerService.sendMsg(this.websocket, {
      type: MessageType.QUERY_LATEST,
      data: null,
    });
  }

  queryBlockChain() {
    this.peerService.sendMsg(this.websocket, {
      type: MessageType.QUERY_ALL,
      data: null,
    });
  }

  handleRecvMsg(msg: Message) {
    // Two types: latest block / whole blockchain
    if (msg.type === MessageType.RESPONSE_BLOCKCHAIN) {
      const receivedBlocks: Block[] = JSON.parse(msg.data).reverse();
      this.blocks.unshift(...receivedBlocks);
    }
  }

  handleError(err: any) {
    console.log(err);
  }

  handleComplete() {
    console.log("Complete");
  }
}
