import React from 'react';
import { Wallet, Activity, Layers } from 'lucide-react';

interface Props {
  accountValue: string;
  marginUsed: string;
  unrealizedPnl: number;
}

export const AccountOverview: React.FC<Props> = ({ accountValue, marginUsed, unrealizedPnl }) => {
  const av = parseFloat(accountValue);
  const mu = parseFloat(marginUsed);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-hl-card border border-hl-border rounded-xl p-4 flex items-center gap-4">
        <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-hl-muted uppercase font-bold">Account Value</p>
          <p className="text-xl font-mono font-bold text-white">${av.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-hl-card border border-hl-border rounded-xl p-4 flex items-center gap-4">
        <div className="p-3 bg-purple-500/10 rounded-full text-purple-400">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-hl-muted uppercase font-bold">Margin Usage</p>
          <p className="text-xl font-mono font-bold text-white">${mu.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-hl-card border border-hl-border rounded-xl p-4 flex items-center gap-4">
        <div className={`p-3 rounded-full ${unrealizedPnl >= 0 ? 'bg-hl-accent/10 text-hl-accent' : 'bg-hl-danger/10 text-hl-danger'}`}>
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-hl-muted uppercase font-bold">Unrealized PnL</p>
          <p className={`text-xl font-mono font-bold ${unrealizedPnl >= 0 ? 'text-hl-accent' : 'text-hl-danger'}`}>
            {unrealizedPnl >= 0 ? '+' : ''}{unrealizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};