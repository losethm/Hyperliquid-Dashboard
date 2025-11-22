import React, { useState, useEffect } from 'react';
import { Search, Shield, ExternalLink } from 'lucide-react';
import { fetchAccountState, fetchOpenOrders, processPositions } from './services/hyperliquid';
import { HLClearinghouseState, HLOrder, FormattedPosition } from './types';
import { AccountOverview } from './components/AccountOverview';
import { PositionTable } from './components/PositionTable';
import { PositionCalculator } from './components/PositionCalculator';

function App() {
  const [address, setAddress] = useState('');
  const [debouncedAddress, setDebouncedAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState<HLClearinghouseState | null>(null);
  const [orders, setOrders] = useState<HLOrder[]>([]);
  const [positions, setPositions] = useState<FormattedPosition[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAddress(address);
    }, 800);
    return () => clearTimeout(timer);
  }, [address]);

  // Fetch data effect
  useEffect(() => {
    if (!debouncedAddress || debouncedAddress.length < 40) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [stateData, ordersData] = await Promise.all([
          fetchAccountState(debouncedAddress),
          fetchOpenOrders(debouncedAddress)
        ]);

        setAccountData(stateData);
        setOrders(ordersData);

        if (stateData) {
          setPositions(processPositions(stateData, ordersData));
        } else {
            setPositions([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Optional: Poll every 15 seconds if viewing an address
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [debouncedAddress]);

  // Helper to sum unrealized pnl
  const totalUnrealizedPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const accountValue = accountData?.marginSummary.accountValue || '0';
  const marginUsed = accountData?.marginSummary.totalMarginUsed || '0';

  return (
    <div className="min-h-screen bg-hl-bg text-hl-text font-sans selection:bg-hl-accent selection:text-black pb-20">
      
      {/* Header */}
      <header className="border-b border-hl-border bg-hl-bg sticky top-0 z-50 bg-opacity-95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-hl-accent/10 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-hl-accent" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Hyper<span className="text-hl-accent">Size</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://hyperliquid.xyz" target="_blank" rel="noreferrer" className="text-xs text-hl-muted hover:text-white flex items-center gap-1 transition-colors">
              Hyperliquid <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Address Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-hl-accent to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center">
               <Search className="absolute left-4 text-hl-muted w-5 h-5" />
               <input 
                 type="text" 
                 placeholder="Enter Arbitrum/Hyperliquid Address (0x...)" 
                 className="w-full bg-hl-card border border-hl-border text-white py-4 pl-12 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-hl-accent/50 transition-all font-mono shadow-xl"
                 value={address}
                 onChange={(e) => setAddress(e.target.value)}
               />
            </div>
          </div>
          <p className="text-center text-xs text-hl-muted mt-3">
            Paste an address to view positions, risk metrics, and simulate stop losses.
          </p>
        </div>

        {/* Dashboard Content */}
        {debouncedAddress.length >= 40 && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left Col: Account & Positions */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                     <h2 className="text-lg font-semibold text-white">Portfolio Overview</h2>
                     {loading && <span className="text-xs text-hl-accent animate-pulse">Refreshing...</span>}
                  </div>
                  
                  <AccountOverview 
                    accountValue={accountValue} 
                    marginUsed={marginUsed} 
                    unrealizedPnl={totalUnrealizedPnl} 
                  />
                  
                  <div>
                    <h3 className="text-sm font-bold text-hl-muted uppercase mb-3">Active Positions</h3>
                    <PositionTable positions={positions} loading={loading && positions.length === 0} />
                  </div>
                </div>

                {/* Right Col: Calculator */}
                <div className="lg:w-[400px] shrink-0">
                   <div className="sticky top-24">
                     <PositionCalculator accountBalance={parseFloat(accountValue)} />
                   </div>
                </div>

              </div>
           </div>
        )}

        {/* Empty State / Intro */}
        {debouncedAddress.length < 40 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
             <div className="bg-hl-card border border-hl-border p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-2">Risk Management</h3>
                <p className="text-hl-muted text-sm leading-relaxed">
                  Visualize your "Risk at Stop" across your entire portfolio. We scan your active positions and try to match them with open limit orders to estimate your potential downside if stops are triggered.
                </p>
             </div>
             <div className="bg-hl-card border border-hl-border p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-2">Position Sizing</h3>
                <p className="text-hl-muted text-sm leading-relaxed">
                  Stop guessing your leverage. Use the built-in calculator to determine the exact position size based on your account balance, entry, stop loss, and desired risk percentage (e.g., 1% per trade).
                </p>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
