import * as CryptoJS from 'crypto-js';
import { hexToBinary } from './util';
import { BLOCK_GENERATION_INTERVAL, DIFFICULTY_ADJUSTMENT_INTERVAL } from './config';

class Block {
  // General data about this block
  index: number;
  prevHash: string;
  timestamp: number;
  data: string;
  hash: string;
  // Mining
  difficulty: number;
  nonce: number;

  constructor(index: number, prevHash: string, timestamp: number,
    data: string, hash: string, difficulty: number, nonce: number) {
    this.index = index;
    this.prevHash = prevHash.toString();
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}

class BlockChain {
  blockchain: Block[];

  constructor(blockchain?: Block[]) {
    this.blockchain = blockchain || [this.getGenesisBlock()];
  }

  /** Difficulty of the current blockchain */
  get difficulty() {
    const latestBlock = this.getLatestBlock();
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
      return this.getAdjustedDifficulty(latestBlock);
    } else {
      return latestBlock.difficulty;
    }
  }

  /**
   * Validate if the hash matches the difficulty by comparing
   * how many leadning zeros in the hash.
   */
  hashMatchesDifficulty(hash: string, difficulty: number): boolean {
    const hashInBinary: string = hexToBinary(hash);
    console.log(hashInBinary);
    const requiredPrefix: string = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
  }

  /**
   * Get adjusted difficulty based on the fixed difficulty setting and inverval checking
   */
  getAdjustedDifficulty(latestBlock: Block) {
    const prevAdjustmentBlock: Block = this.blockchain[this.blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken: number = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
      return prevAdjustmentBlock.difficulty + 1;
    }
    else if (timeTaken > timeExpected * 2) {
      return prevAdjustmentBlock.difficulty - 1;
    }
    else {
      return prevAdjustmentBlock.difficulty;
    }
  };

  /**
   * Mine a block, i.e. using the trail and error method to compute the correct nonce so that
   * the hash of the block starts with some number of zeros
   */
  mineBlock(data: string): Block {
    const lastBlock = this.getLatestBlock();
    const index = lastBlock.index + 1;
    const timestamp = new Date().getTime();
    let nonce = 0;
    console.log(this.difficulty);
    while (true) {
      const hash: string = this.calcHash(index, lastBlock.hash, timestamp, data, this.difficulty, nonce);
      if (this.hashMatchesDifficulty(hash, this.difficulty)) {
        return new Block(index, lastBlock.hash, timestamp, data, hash, this.difficulty, nonce);
      }
      nonce++;
    }
  }

  /**
   * Calculate the hash value based on the block information
   */
  calcHash(index: number, prevHash: string, timestamp: number, data: string, difficulty: number, nonce: number): string {
    return CryptoJS.SHA256(index + prevHash + timestamp + data + difficulty + nonce).toString();
  }

  /**
   * Calculate the hash value based on the given block
   */
  calcBlockHash(block: Block): string {
    return this.calcHash(block.index, block.prevHash, block.timestamp, block.data, block.difficulty, block.nonce).toString();
  }

  /**
   * Get the latest block of the blockchain
   */
  getLatestBlock(): Block {
    return this.blockchain[this.blockchain.length - 1];
  }

  /**
   * Get the genesis block, i.e. first block of the blockchain
   */
  getGenesisBlock(): Block {
    const timestamp = 1621805758983;
    const message = "UselessCoin";
    return new Block(
      0,
      "0",
      1621805758983,
      message,
      this.calcHash(0, "0", timestamp, message, 0, 0),
      0,
      0
    );
  }

  /**
   * Append a block into the blockchain
   */
  addBlockToChain(block: Block): { success: boolean, error?: string } {
    const { success, error } = this.isValidBlock(block, this.getLatestBlock());
    if (success) {
      this.blockchain.push(block);
      return { success };
    } else {
      return { success, error };
    }
  }

  /**
   * Validate if the given block is valid based on its information and its previous block
   */
  isValidBlock(newBlock: Block, prevBlock: Block): { success: boolean, error?: string } {
    if (prevBlock.index + 1 !== newBlock.index) {
      return { success: false, error: "Invalid index" }
    }
    else if (prevBlock.hash !== newBlock.prevHash) {
      return { success: false, error: "Invalid previous block hash" }
    }
    else if (!this.isValidTimestamp(newBlock, prevBlock)) {
      return { success: false, error: "Invalid timestamp" }
    }
    else if (this.calcBlockHash(newBlock) !== newBlock.hash) {
      return {
        success: false,
        error: `Invalid hash, expected: ${this.calcBlockHash(newBlock)}, actual: ${newBlock.hash}`
      }
    }
    return { success: true }
  }

  /**
   * Validate the timestamp of the block:
   * 1. A block is valid, if the timestamp is at most 1 min in the future from the time we perceive.
   * 2. A block in the chain is valid, if the timestamp is at most 1 min in the past of the previous block.
   */
  isValidTimestamp(newBlock: Block, previousBlock: Block): boolean {
    return (previousBlock.timestamp - 60 * 1000 < newBlock.timestamp)
      && newBlock.timestamp - 60 * 1000 < new Date().getTime();
  }

  /**
   * Replace the current blockchain with the new blockchain, the one that has
   * a higher accumulated difficulty is correct
   */
  replaceChain(newChain: Block[]): { success: boolean, error?: string } {
    if (this.isValidChain(newChain) &&
      this.getAccumulatedDifficulty(newChain) > this.getAccumulatedDifficulty(this.blockchain)) {
      this.blockchain = newChain;
      return { success: true }
    } else {
      return { success: false, error: "Invalid chain" }
    }
  }

  /**
   * Validate a blockchain based on the current one, including validating the
   * genesis block and all of the blocks on the blockchain.
   */
  isValidChain(chain: Block[]): boolean {
    if (JSON.stringify(chain[0]) !== JSON.stringify(this.getGenesisBlock())) {
      return false;
    }
    let tempChain = [chain[0]];
    for (var i = 1; i < chain.length; i++) {
      if (this.isValidBlock(chain[i], chain[i - 1])) {
        tempChain.push(chain[i]);
      } else {
        return false;
      }
    }
    return true;
  }

  /**
   * Get the accumulated difficulty of a blockchain by `2^difficulty`
   */
  getAccumulatedDifficulty(chain: Block[]): number {
    return chain
      .map((block) => block.difficulty)
      .map((difficulty) => Math.pow(2, difficulty))
      .reduce((a, b) => a + b);
  }

  /**
   * Validating if the block structure is correct by checking
   * all of the types
   */
  isValidBlockStructure(block: Block): boolean {
    return typeof block.index === 'number'
      && typeof block.hash === 'string'
      && typeof block.prevHash === 'string'
      && typeof block.timestamp === 'number'
      && typeof block.data === 'string';
  }
}

export { Block, BlockChain };
