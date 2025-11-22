# Hyperliquid Risk Manager

A private, personal dashboard to monitor your Hyperliquid portfolio risk and calculate position sizes.

## Features
- **Portfolio Overview**: View account value, margin usage, and total unrealized PnL.
- **Risk Analysis**: Visualize "Risk at Stop" by matching open positions with stop-loss orders.
- **Position Sizing**: Built-in calculator to determine exact position sizes based on risk percentage.
- **Private**: Runs entirely in your browser. No API keys required.

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser.

## Privacy Note
This application queries the public Hyperliquid API directly from your browser. Your address and data are never sent to any other server.
