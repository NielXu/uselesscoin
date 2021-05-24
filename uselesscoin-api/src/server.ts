import { BlockChain } from './blockchain';
import * as express from 'express';

const HTTP_PORT: number = parseInt(process.env.HTTP_PORT) || 3001;

const initHttpServer = (port: number) => {
  const app = express();
  const blockchain = new BlockChain();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.get("/blocks", (req, res) => {
    res.send(blockchain);
  });

  app.post("/mine", (req, res) => {
    const newBlock = blockchain.getBlock(req.body.data);
    console.log(`Block #${newBlock.index} created`);
    console.log(`Hash: ${newBlock.hash}\n`);
    blockchain.addBlock(newBlock);
    res.send(newBlock);
  });

  app.listen(port, () => {
    console.log(`Listening http on port: ${port}`);
  });
}

initHttpServer(HTTP_PORT);
