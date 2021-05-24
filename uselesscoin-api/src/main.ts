import { BlockChain } from './blockchain';
import { P2PNetwork } from './p2p';
import { HttpNetwork } from './http';

const HTTP_PORT: number = parseInt(process.env.HTTP_PORT) || 3001;
const P2P_PORT: number = parseInt(process.env.P2P_PORT) || 6001;

const blockchain = new BlockChain();
const p2pNetwork = new P2PNetwork(blockchain);
const httpNetwork = new HttpNetwork(blockchain, p2pNetwork);

httpNetwork.initHttpServer(HTTP_PORT);
p2pNetwork.initP2PServer(P2P_PORT);
