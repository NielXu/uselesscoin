import { BlockChain } from './blockchain';
import { P2PNetwork } from './p2p';
import { HttpNetwork } from './http';

function createCluster(nodes: number, initialHttpPort=3001, initialSocketPort=6001) {
  for (let i = 0; i < nodes; i++) {
    const HTTP_PORT = initialHttpPort + i;
    const P2P_PORT = initialSocketPort + i;
    
    const blockchain = new BlockChain();
    const p2pNetwork = new P2PNetwork(blockchain);
    const httpNetwork = new HttpNetwork(blockchain, p2pNetwork);
    
    httpNetwork.initHttpServer(HTTP_PORT);
    p2pNetwork.initP2PServer(P2P_PORT);
  }
}

if (process.argv.length > 2) {
  createCluster(Number(process.argv[2]));
}
