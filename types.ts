// API Response Types

export interface HLPosition {
  coin: string;
  szi: string; // size in generic units (string to handle precision)
  entryPx: string;
  positionValue: string;
  unrealizedPnl: string;
  returnOnEquity: string;
  liquidationPx: string | null;
  leverage: {
    type: string;
    value: number;
  };
  marginUsed: string;
}

export interface HLAssetPosition {
  position: {
    coin: string;
    szi: string;
    entryPx: string;
    positionValue: string;
    unrealizedPnl: string;
    returnOnEquity: string;
    liquidationPx: string | null;
    leverage: {
      type: string;
      value: number;
    };
    marginUsed: string;
    maxLeverage: number;
    cumFunding: {
      allTime: string;
      sinceOpen: string;
      sinceChange: string;
    };
  };
  type: "oneWay" | "hedge";
}

export interface HLClearinghouseState {
  assetPositions: HLAssetPosition[];
  crossMarginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
  marginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
}

export interface HLOrder {
  oid: number;
  ordId: number;
  coin: string;
  side: "B" | "A"; // Bid or Ask
  limitPx: string;
  sz: string;
  szPx: string; // Notional
  timestamp: number;
  isTrigger?: boolean;
  triggerCondition?: string;
  triggerPx?: string;
}

// Internal Types
export interface FormattedPosition {
  ticker: string;
  size: number;
  entryPrice: number;
  markPrice: number; // We might need to fetch market data or infer from pnl/entry
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number | null;
  side: 'Long' | 'Short';
  notional: number;
  leverage: number;
  matchedStopPrice?: number; // If we find an open order acting as stop
  riskAtStop?: number;
}

export interface CalculatorState {
  accountSize: number;
  riskPercent: number;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number | null;
}

export interface CalculatorResult {
  riskAmount: number;
  positionSizeNotional: number;
  positionSizeCoins: number;
  leverageRequired: number;
  rewardAmount: number | null;
  riskRewardRatio: number | null;
  isValid: boolean;
  error?: string;
}
