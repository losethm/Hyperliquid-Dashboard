import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, AlertTriangle, DollarSign, Percent, Target, ArrowRight } from 'lucide-react';

interface Props {
  accountBalance?: number;
}

export const PositionCalculator: React.FC<Props> = ({ accountBalance = 1000 }) => {
  const [balance, setBalance] = useState<string>(accountBalance.toString());
  const [riskPct, setRiskPct] = useState<string>('1.0');
  const [entry, setEntry] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  
  // Sync prop balance if it changes (e.g. fetched from API)
  useEffect(() => {
    if (accountBalance) {
      setBalance(accountBalance.toFixed(2));
    }
  }, [accountBalance]);

  const results = useMemo(() => {
    const balNum = parseFloat(balance) || 0;
    const riskNum = parseFloat(riskPct) || 0;
    const entryNum = parseFloat(entry) || 0;
    const slNum = parseFloat(stopLoss) || 0;
    const targetNum = parseFloat(target) || 0;

    if (balNum <= 0 || entryNum <= 0 || slNum <= 0) return null;

    const riskAmount = balNum * (riskNum / 100);
    const priceDiff = Math.abs(entryNum - slNum);
    const priceDiffPct = priceDiff / entryNum;

    if (priceDiffPct === 0) return null;

    const positionSizeNotional = riskAmount / priceDiffPct;
    const positionSizeCoins = positionSizeNotional / entryNum;
    const leverage = positionSizeNotional / balNum;

    let reward = 0;
    let rr = 0;

    if (targetNum > 0) {
      const targetDiff = Math.abs(targetNum - entryNum);
      const targetDiffPct = targetDiff / entryNum;
      reward = positionSizeNotional * targetDiffPct;
      rr = reward / riskAmount;
    }

    const isLong = entryNum > slNum;

    return {
      riskAmount,
      positionSizeNotional,
      positionSizeCoins,
      leverage,
      reward,
      rr,
      isLong
    };
  }, [balance, riskPct, entry, stopLoss, target]);

  return (
    <div className="bg-hl-card border border-hl-border rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-hl-accent" />
        <h2 className="text-lg font-semibold text-white">Position Sizer</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-hl-muted uppercase font-bold mb-1">Account Balance ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-hl-muted" />
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-hl-bg border border-hl-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-hl-accent text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-hl-muted uppercase font-bold mb-1">Risk (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-2.5 w-4 h-4 text-hl-muted" />
                <input
                  type="number"
                  value={riskPct}
                  onChange={(e) => setRiskPct(e.target.value)}
                  className="w-full bg-hl-bg border border-hl-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-hl-accent text-white"
                  placeholder="1.0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-hl-muted uppercase font-bold mb-1">Entry Price</label>
            <input
              type="number"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="w-full bg-hl-bg border border-hl-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-hl-accent text-white"
              placeholder="e.g. 2500.50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-hl-muted uppercase font-bold mb-1 text-hl-danger">Stop Loss</label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-hl-bg border border-hl-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-hl-danger/50 text-white"
                placeholder="e.g. 2450.00"
              />
            </div>
            <div>
              <label className="block text-xs text-hl-muted uppercase font-bold mb-1 text-hl-accent">Target (Optional)</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-hl-bg border border-hl-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-hl-accent/50 text-white"
                placeholder="e.g. 2700.00"
              />
            </div>
          </div>

        </div>

        {/* Results */}
        <div className="bg-hl-bg rounded-lg p-4 border border-hl-border flex flex-col justify-between relative overflow-hidden">
          {!results ? (
            <div className="flex-1 flex flex-col items-center justify-center text-hl-muted opacity-50">
              <Target className="w-12 h-12 mb-2" />
              <p className="text-sm">Enter trade parameters to see sizing</p>
            </div>
          ) : (
            <>
              <div className="absolute top-0 right-0 p-2 opacity-10">
                 <Target className="w-24 h-24" />
              </div>

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${results.isLong ? 'bg-hl-accent/10 text-hl-accent' : 'bg-hl-danger/10 text-hl-danger'}`}>
                      {results.isLong ? 'LONG' : 'SHORT'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-hl-muted uppercase">Account Risk</p>
                    <p className="text-lg font-mono font-bold text-hl-danger">-${results.riskAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between items-center border-b border-hl-border pb-2">
                      <span className="text-sm text-hl-muted">Position Size (USD)</span>
                      <span className="font-mono font-bold text-white">${results.positionSizeNotional.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-hl-border pb-2">
                      <span className="text-sm text-hl-muted">Position Size (Coins)</span>
                      <span className="font-mono text-white">{results.positionSizeCoins.toFixed(4)}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-hl-border pb-2">
                      <span className="text-sm text-hl-muted">Leverage</span>
                      <span className={`font-mono font-bold ${results.leverage > 20 ? 'text-hl-danger' : results.leverage > 10 ? 'text-yellow-500' : 'text-hl-accent'}`}>
                        {results.leverage.toFixed(1)}x
                      </span>
                   </div>
                   {results.reward > 0 && (
                     <div className="flex justify-between items-center pt-1">
                        <span className="text-sm text-hl-muted">Risk : Reward</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-hl-muted">1 : {results.rr.toFixed(2)}</span>
                          <span className="font-mono font-bold text-hl-accent">+${results.reward.toFixed(2)}</span>
                        </div>
                     </div>
                   )}
                </div>
              </div>

              {results.leverage > 50 && (
                <div className="mt-4 flex items-start gap-2 text-xs text-hl-danger bg-hl-danger/10 p-2 rounded">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>High leverage detected. Be extremely careful with liquidation risk.</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};