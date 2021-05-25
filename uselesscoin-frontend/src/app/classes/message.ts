export enum MessageType {
  QUERY_LATEST = 0,
  QUERY_ALL = 1,
  RESPONSE_BLOCKCHAIN = 2,
}

export interface Message {
  type: MessageType;
  data: any;
}
