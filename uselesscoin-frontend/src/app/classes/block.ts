export interface Block {
  index: number;
  hash: string;
  data: string;
  prevHash: string;
  timestamp: number;
}
