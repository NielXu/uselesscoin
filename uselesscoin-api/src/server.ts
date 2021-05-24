import { BlockChain } from './blockchain';
import { P2PNetwork } from './p2p';
import * as express from 'express';

const HTTP_PORT: number = parseInt(process.env.HTTP_PORT) || 3001;
const P2P_PORT: number = parseInt(process.env.P2P_PORT) || 6001;

const blockchain = new BlockChain();
const p2pnetwork = new P2PNetwork(blockchain);

const initHttpServer = (port: number) => {
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.get("/blocks", (req, res) => {
    res.send(blockchain);
  });

  app.post("/mine", (req, res) => {
    const newBlock = blockchain.getBlock(req.body.data);
    console.log(`Block #${newBlock.index} created`);
    console.log(`Hash: ${newBlock.hash}\n`);
    blockchain.addBlockToChain(newBlock);
    res.send(newBlock);
  });

  app.listen(port, () => {
    console.log(`Listening http on port: ${port}`);
  });
}

initHttpServer(HTTP_PORT);
p2pnetwork.initP2PServer(P2P_PORT);
