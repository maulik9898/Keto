export interface Dbc {
  params: Param[];
  problems: any[];
}

export interface DbcKey {
  [key: string]: Param;
}

export interface Param {
  canId: number;
  pgn: number;
  source: number;
  name: string;
  priority: number;
  label: string;
  isExtendedFrame: boolean;
  dlc: number;
  comment: null;
  signals: Signal[];
  lineInDbc: number;
  problems: any[];
}

export interface Signal {
  name: string;
  label: string;
  startBit: number;
  bitLength: number;
  isLittleEndian: boolean;
  isSigned: boolean;
  factor: number;
  offset: number;
  sourceUnit?: string;
  dataType: DataType;
  choking: boolean;
  visibility: boolean;
  value?: any;
  data?: string; // TODO Remove this
  interval: number;
  category: string;
  lineInDbc: number;
  problems: any[];
  postfixMetric?: string;
  min?: number;
  max?: number;
  states?: State[];
  comment?: string;
  postfixImperial?: string;
}

export enum DataType {
  Int = 'int',
}

export interface State {
  value: number;
  state: string;
}
