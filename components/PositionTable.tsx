import React from 'react';
import { FormattedPosition } from '../types';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  positions: FormattedPosition[];
  loading: boolean;
}

export const PositionTable: React.FC<Props> = ({ positions, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-hl-muted">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-2 w-24 bg-hl-border rounded mb-2"></div>
          <span className="text-sm">Loading positions...</span>
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="w-full h-32 flex flex-col items-center justify-center text-hl-muted bg-hl-card/50 rounded-xl border border-hl-border border-dashed">
        <span className="text-sm">No active positions found</span>
      </div>
    );
  }

  // Calculate total risk across all positions where a stop was found
  const totalRiskAtStop = positions.reduce((acc, pos) => acc + (pos.riskAtStop || 0), 0);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-hl-border bg-hl-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-hl-bg text-hl-muted uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3 text-right">Size</th>
              <th className="px-4 py-3 text-right">Entry</th>
              <th className="px-4 py-3 text-right">Mark</th>
              <th className="px-4 py-3 text-right">Liq. Price</th>
              <th className="px-4 py-3 text-right">PnL (ROE)</th>
              <th className="px-4 py-3 text-right" title="Estimated based on visible open reducing orders">Risk @ Stop*</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hl-border">
            {positions.map((pos) => (
              <tr key={pos.ticker} className="hover:bg-hl-bg/50 transition-colors">
                <td className="px-4 py-3 font-bold font-mono">{pos.ticker}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${pos.side === 'Long' ? 'bg-hl-accent/10 text-hl-accent' : 'bg-hl-danger/10 text-hl-danger'}`}>
                    {pos.side}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  <div className="text-white">{Math.abs(pos.size).toFixed(4)}</div>
                  <div className="text-xs text-hl-muted">${pos.notional.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-white">{pos.entryPrice.toFixed(pos.entryPrice < 1 ? 5 : 2)}</td>
                <td className="px-4 py-3 text-right font-mono text-hl-muted">{pos.markPrice.toFixed(pos.markPrice < 1 ? 5 : 2)}</td>
                <td className="px-4 py-3 text-right font-mono text-orange-400">
                  {pos.liquidationPrice ? pos.liquidationPrice.toFixed(pos.liquidationPrice < 1 ? 5 : 2) : '-'}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  <div className={pos.pnl >= 0 ? 'text-hl-accent' : 'text-hl-danger'}>
                    {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                  </div>
                  <div className={`text-xs ${pos.pnlPercent >= 0 ? 'text-hl-accent' : 'text-hl-danger'}`}>
                    {pos.pnlPercent.toFixed(2)}%
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                   {pos.riskAtStop ? (
                     <span className="text-hl-danger font-bold">-${pos.riskAtStop.toFixed(2)}</span>
                   ) : (
                     <span className="text-hl-muted text-xs italic">No stop found</span>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalRiskAtStop > 0 && (
        <div className="flex justify-end">
           <div className="bg-hl-danger/10 border border-hl-danger/20 rounded-lg px-4 py-2 flex items-center gap-3">
             <AlertCircle className="w-4 h-4 text-hl-danger" />
             <span className="text-sm text-hl-danger">Total Detected Risk at Stops: <span className="font-bold font-mono ml-1">-${totalRiskAtStop.toFixed(2)}</span></span>
           </div>
        </div>
      )}
      
      <p className="text-xs text-hl-muted italic text-right">* "Risk @ Stop" is estimated from public open Limit orders that reduce position size. Trigger orders (stop-market) are often hidden from public API.</p>
    </div>
  );
};
