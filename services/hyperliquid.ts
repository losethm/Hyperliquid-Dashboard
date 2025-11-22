import { HLClearinghouseState, HLOrder, FormattedPosition } from '../types';

const API_URL = 'https://api.hyperliquid.xyz/info';

export const fetchAccountState = async (address: string): Promise<HLClearinghouseState | null> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'clearinghouseState',
        user: address,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch account state');
    }

    const data = await response.json();
    // API can return null for new/invalid addresses
    return data as HLClearinghouseState; 
  } catch (error) {
    console.error('Error fetching account state:', error);
    return null;
  }
};

export const fetchOpenOrders = async (address: string): Promise<HLOrder[]> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'openOrders',
        user: address,
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data as HLOrder[];
  } catch (error) {
    console.error('Error fetching open orders:', error);
    return [];
  }
};

// Helper to process raw positions into UI friendly format
// Note: To get accurate Mark Price, we ideally fetch metaAndAssetCtxs, but we can estimate current Mark from Unrealized PnL + Entry Px
export const processPositions = (state: HLClearinghouseState, orders: HLOrder[]): FormattedPosition[] => {
  if (!state || !state.assetPositions) return [];

  return state.assetPositions
    .map((item): FormattedPosition | null => {
      const pos = item.position;
      const size = parseFloat(pos.szi);
      if (size === 0) return null;

      const entryPx = parseFloat(pos.entryPx);
      const pnl = parseFloat(pos.unrealizedPnl);
      const side: 'Long' | 'Short' = size > 0 ? 'Long' : 'Short';
      
      // Reverse engineering mark price approx: 
      // Long PnL = Size * (Mark - Entry) -> Mark = (PnL / Size) + Entry
      // Short PnL = Size * (Entry - Mark) -> Mark = Entry - (PnL / Size)
      let markPx = 0;
      if (size > 0) {
        markPx = (pnl / size) + entryPx;
      } else {
        markPx = entryPx - (pnl / Math.abs(size));
      }

      const notional = Math.abs(size) * markPx;
      const pnlPercent = (pnl / (Math.abs(size) * entryPx)) * 100 * (pos.leverage.value || 1); // This is simplified ROE logic
      // Better ROE calculation from HL API usually is: returnOnEquity * 100
      const roe = parseFloat(pos.returnOnEquity) * 100;

      // Find potential stop loss in open orders
      // A stop loss for a LONG is a SELL order below current price (or specific trigger)
      // A stop loss for a SHORT is a BUY order above current price
      // Note: Public API 'openOrders' usually returns Limit orders. Triggers might not be visible without auth.
      // We will best-effort match standard limit orders that look like stops or TPs.
      
      const relatedOrders = orders.filter(o => o.coin === pos.coin);
      
      let matchedStopPrice: number | undefined = undefined;
      
      // Simple heuristic: 
      // For LONG: Looking for a SELL (A) order with price < markPx (Stop Loss logic, though technically a Limit Sell below price is a taker, so usually Stops are triggers)
      // If the user has a proper 'Stop Loss' trigger, it might not show in 'openOrders' endpoint easily.
      // We check for orders that reduce size.
      
      const reduceOnlyOrders = relatedOrders.filter(o => {
        // Check if side is opposite
        return (side === 'Long' && o.side === 'A') || (side === 'Short' && o.side === 'B');
      });

      // For display purposes, we take the order closest to entry that is "in loss territory" as the Stop Loss.
      if (reduceOnlyOrders.length > 0) {
        const prices = reduceOnlyOrders.map(o => parseFloat(o.limitPx));
        if (side === 'Long') {
          // Stop should be below entry/mark
          const stops = prices.filter(p => p < markPx);
          if (stops.length > 0) matchedStopPrice = Math.max(...stops); // Highest price below mark is the first stop hit
        } else {
           // Stop should be above entry/mark
           const stops = prices.filter(p => p > markPx);
           if (stops.length > 0) matchedStopPrice = Math.min(...stops); // Lowest price above mark
        }
      }

      let riskAtStop = 0;
      if (matchedStopPrice) {
          const dist = Math.abs(entryPx - matchedStopPrice);
          riskAtStop = dist * Math.abs(size); // Rough calc: size * distance
      }

      return {
        ticker: pos.coin,
        size: size,
        entryPrice: entryPx,
        markPrice: markPx,
        pnl: pnl,
        pnlPercent: roe,
        liquidationPrice: pos.liquidationPx ? parseFloat(pos.liquidationPx) : null,
        side: side,
        notional: notional,
        leverage: pos.leverage.value,
        matchedStopPrice,
        riskAtStop
      };
    })
    .filter((p): p is FormattedPosition => p !== null);
};
