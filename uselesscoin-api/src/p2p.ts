import * as WebSocket from 'ws';
import { Server } from 'ws';
import { Block, BlockChain } from './blockchain';

enum MessageType {
  QUERY_LATEST = 0,
  QUERY_ALL = 1,
  RESPONSE_BLOCKCHAIN = 2,
}

class Message {
  type: MessageType;
  data: any;
}

class P2PNetwork {
  sockets: WebSocket[];
  p2pServer: Server;
  blockchain: BlockChain;

  constructor(blockchain: BlockChain) {
    this.sockets = [];
    this.blockchain = blockchain;
  }

  /**
   * Initialize the P2P Server on the given port
   */
  initP2PServer(port: number) {
    this.p2pServer = new WebSocket.Server({ port });
    this.p2pServer.on("connection", (ws: WebSocket) => {
      this.initConnection(ws);
    });
    console.log(`Listening websocket p2p port on: ${port}`);
  }

  /**
   * Initialize connection in the network
   */
  initConnection(ws: WebSocket) {
    this.sockets.push(ws);
  }

  initMessageHandler(ws: WebSocket) {
    ws.on('message', (data: string) => {
      const message: Message = this.JSONToObject<Message>(data);
      if (message === null) {
        return;
      }
      switch (message.type) {
        case MessageType.QUERY_LATEST:
          this.write(ws, this.responseLatestMsg());
          break;
        case MessageType.QUERY_ALL:
          this.write(ws, this.responseChainMsg());
          break;
        case MessageType.RESPONSE_BLOCKCHAIN:
          const receivedBlocks: Block[] = this.JSONToObject<Block[]>(message.data);
          if (receivedBlocks === null) {
            break;
          }
          this.handleBlockchainResponse(receivedBlocks);
          break;
      }
    });
  }

  /**
   * Handle the request blockchain's response by validating the blockchain received
   */
  handleBlockchainResponse(receivedBlocks: Block[]) {
    if (receivedBlocks.length === 0) {
      return;
    }
    const newBlockChain = new BlockChain(receivedBlocks);
    const latestBlockReceived = newBlockChain.getLatestBlock();
    if (!newBlockChain.isValidBlockStructure(latestBlockReceived)) {
      return;
    }
    const latestBlockHeld: Block = this.blockchain.getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
      if (latestBlockHeld.hash === latestBlockReceived.prevHash) {
        if (this.blockchain.addBlockToChain(latestBlockReceived)) {
          this.broadcast(this.responseLatestMsg());
        }
      }
      else if (receivedBlocks.length === 1) {
        this.broadcast(this.queryAllMsg());
      }
      else {
        this.blockchain.replaceChain(receivedBlocks);
      }
    }
  }

  /**
   * Return the message with type: `QUERY_ALL` and with data null
   */
  queryAllMsg(): Message {
    return {
      type: MessageType.QUERY_ALL,
      data: null
    }
  }

  /**
   * Return the message with type: `RESPONSE_BLOCKCHAIN` and with
   * data the whole blockchain
   */
  responseChainMsg(): Message {
    return {
      type: MessageType.RESPONSE_BLOCKCHAIN,
      data: JSON.stringify(this.blockchain.blockchain),
    }
  }

  /**
   * Return the message with type: `RESPONSE_BLOCKCHAIN` and with
   * data the latest block of the blockchain
   */
  responseLatestMsg(): Message {
    return {
      type: MessageType.RESPONSE_BLOCKCHAIN,
      data: JSON.stringify([this.blockchain.getLatestBlock()]),
    }
  }

  /**
   * Write (Send) message in the websocket
   */
  write(ws: WebSocket, message: Message): void {
    ws.send(JSON.stringify(message));
  }

  /**
   * Broadcast a message by sending it to all the connected sockets
   */
  broadcast(message: Message): void {
    this.sockets.forEach((socket) => this.write(socket, message));
  }

  /**
   * Broadcast the current copy of the blockchain
   */
  broadcastLatest(): void {
    this.broadcast(this.responseLatestMsg());
  }

  /**
   * Make connection with the peers
   */
  connectToPeers(newPeer: string): void {
    const ws: WebSocket = new WebSocket(newPeer);
    ws.on('open', () => {
      this.initConnection(ws);
    });
  }

  /**
   * Try to parse from the data string into Message type,
   * return null if failed
   */
  private JSONToObject<T>(data: string): T {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export { MessageType, Message, P2PNetwork };
