export interface Block {
  // General data about this block
  index: number;
  hash: string;
  data: string;
  prevHash: string;
  timestamp: number;
  // Mining
  difficulty: number;
  nonce: number;
}
