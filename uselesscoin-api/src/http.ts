import { BlockChain } from './blockchain';
import { P2PNetwork } from './p2p';
import * as express from 'express';
import * as cors from 'cors';

class HttpNetwork {
  blockchain: BlockChain;
  p2pNetwork: P2PNetwork;

  constructor(blockchain: BlockChain, p2pNetwork: P2PNetwork) {
    this.blockchain = blockchain;
    this.p2pNetwork = p2pNetwork;
  }

  initHttpServer(port: number) {
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors());
  
    app.get("/blocks", (req, res) => {
      res.send(this.blockchain);
    });
  
    app.post("/mine", (req, res) => {
      const newBlock = this.blockchain.mineBlock(req.body.data);
      this.blockchain.addBlockToChain(newBlock);
      this.p2pNetwork.broadcastLatest();
      console.log(`Block #${newBlock.index} mined`);
      console.log(`Hash: ${newBlock.hash}\n`);
      res.send(newBlock);
    });
  
    app.get('/peers', (req, res) => {
      res.send(this.p2pNetwork.sockets.map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
  
    app.post('/addPeer', (req, res) => {
      this.p2pNetwork.addPeer(req.body.peer);
      res.send({ success: true });
    });
  
    app.listen(port, () => {
      console.log(`Listening http on port: ${port}`);
    });
  }
}

export { HttpNetwork };
