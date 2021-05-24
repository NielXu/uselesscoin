import { BlockChain } from './blockchain';
import { P2PNetwork } from './p2p';
import * as express from 'express';

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
  
    app.get("/blocks", (req, res) => {
      res.send(this.blockchain);
    });
  
    app.post("/mine", (req, res) => {
      const newBlock = this.blockchain.getBlock(req.body.data);
      console.log(`Block #${newBlock.index} created`);
      console.log(`Hash: ${newBlock.hash}\n`);
      this.blockchain.addBlockToChain(newBlock);
      res.send(newBlock);
    });
  
    app.get('/peers', (req, res) => {
      res.send(this.p2pNetwork.sockets.map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
  
    app.post('/addPeer', (req, res) => {
      this.p2pNetwork.connectToPeers(req.body.peer);
      res.send();
    });
  
    app.listen(port, () => {
      console.log(`Listening http on port: ${port}`);
    });
  }
}

export { HttpNetwork };
