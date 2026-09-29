# NexusTrade — Full-Stack AI Paper Trading & Automated Bot Platform

A professional, institutional-grade, full-stack cryptocurrency paper trading terminal and automated bot simulation platform. Built with **React 19**, **Vite**, **Tailwind CSS**, **Recharts**, **Node.js**, **Express**, **Socket.IO**, and **MongoDB / Mongoose** with an automatic resilient in-memory fallback layer.

> **Note:** This application operates in **100% Simulation / Paper Trading Mode** with virtual funds (₹10,000 / $10,000). No real-money trading, no real exchange execution, and no real API keys are required.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture & Folder Structure](#architecture--folder-structure)
5. [Prerequisites & Installation](#prerequisites--installation)
6. [Environment Variables](#environment-variables)
7. [Running the Application](#running-the-application)
8. [Demo Account & Quick Access](#demo-account--quick-access)
9. [How the Automated Bot Engine Works](#how-the-automated-bot-engine-works)
10. [How the Backtesting Engine Works](#how-the-backtesting-engine-works)
11. [REST API Documentation](#rest-api-documentation)
12. [Future Improvements](#future-improvements)

---

## 1. Project Overview
NexusTrade bridges the gap between simulated practice and real-world quantitative trading software. It empowers traders to test algorithmic strategies, evaluate risk management circuit breakers, execute manual and limit orders, and observe live bot performance under realistic Brownian motion price conditions without financial risk.

---

## 2. Key Features

- **Real-Time Market Simulation Engine:**
  - High-frequency tick generator using Geometric Brownian Motion with Mean Reversion for 7 major crypto pairs: `BTC/USDT`, `ETH/USDT`, `SOL/USDT`, `BNB/USDT`, `XRP/USDT`, `ADA/USDT`, `DOGE/USDT`.
  - Sub-second streaming via WebSockets / Socket.IO.
  - Realistic 24h high, low, volume, and continuous OHLCV candle updates.

- **Professional Trading Terminal:**
  - Interactive Candlestick / Price area charts powered by Recharts.
  - Live technical indicator overlays: SMA(14), EMA(50), and Bollinger Bands (20, 2).
  - Multi-order panel supporting **Market**, **Limit**, and **Stop** orders with quantity presets (25%, 50%, 75%, 100%).
  - Stop Loss and Take Profit parameter integration.
  - Live estimation of order value, fees (0.1%), and remaining virtual cash balance.

- **Automated Bot Engine:**
  - Deploy multiple 24/7 autonomous trading bots with independent capital allocation and risk configurations.
  - 6 Built-in Algorithmic Strategies:
    1. *Moving Average Crossover (SMA 9 / 21)*
    2. *RSI Mean Reversion (14-period, oversold < 30, overbought > 70)*
    3. *MACD Momentum Divergence (12, 26, 9)*
    4. *Bollinger Bands Volatility Breakout (20, 2)*
    5. *Price Rate-of-Change Momentum (ROC 10)*
    6. *Exponential Trend Following (EMA 20/50/200)*
  - Bot lifecycle controls: **Start**, **Stop**, **Pause**, **Resume**, **Edit**, **Delete**.

- **Dynamic Backtesting Lab:**
  - Historical simulation across 150–400 candle bars with dynamic calculations (no hardcoded data).
  - Metrics: Starting & Ending Capital, Total Return %, Total Trades, Win Rate %, Average Win / Loss, Profit Factor, Max Drawdown %.
  - Visual Equity Curve and individual trade execution logs.

- **Institutional Risk Management:**
  - Configurable Risk Per Trade %, Maximum Concurrent Positions, and Default Stop Loss / Take Profit.
  - **Emergency Circuit Breaker:** If daily losses breach the maximum daily loss threshold, all active bots are automatically halted and high-priority alerts are issued.

- **Complete Financial & Order Ledger:**
  - Portfolios with mark-to-market valuations and asset allocation breakdown.
  - Open Positions with one-click Market Exit capability.
  - Orders ledger tracking `PENDING`, `OPEN`, `FILLED`, `CANCELLED`, and `REJECTED` states.
  - Trade History with CSV export.
  - Financial Ledger recording `DEPOSIT`, `WITHDRAWAL`, `BUY`, `SELL`, `FEE`, and `RESET`.

- **Comprehensive Administrative Portal:**
  - Role-based access control (`USER` vs `ADMIN`).
  - System KPIs: Total Users, Active Bots, Order Count, System Uptime, Node.js Memory usage.
  - User management with search and role promotion.
  - System activity audit logs and global bot fleet monitoring.

- **User Convenience:**
  - 1-Click Instant Demo Login for **Demo Trader** and **Admin Demo**.
  - One-click **Reset Demo Account** (restores balance to ₹10,000 and clears test orders).
  - Global `Ctrl+K` Search modal covering all assets, pages, bots, and strategies.
  - Dark Mode and Light Mode theme toggle.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19 + Vite 8
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS v3.4 + Custom Fintech Glassmorphic Theme
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Real-Time Client:** Socket.IO Client

### Backend
- **Runtime:** Node.js (v20+)
- **Server Framework:** Express.js
- **Real-Time Server:** Socket.IO
- **Security:** JSON Web Tokens (JWT), bcryptjs, express-rate-limit, CORS
- **Database ORM:** Mongoose 8 (with resilient in-memory fallback layer)

---

## 4. Architecture & Folder Structure

```
Trading Bot/
├── backend/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── app.js                   # Express application setup & middleware
│       ├── server.js                # Server entry point, Socket.IO & engine loops
│       ├── config/
│       │   └── db.js                # MongoDB connection handler
│       ├── models/                  # 14 Mongoose Schema Models
│       │   ├── User.js
│       │   ├── Portfolio.js
│       │   ├── Asset.js
│       │   ├── Order.js
│       │   ├── Trade.js
│       │   ├── Position.js
│       │   ├── Bot.js
│       │   ├── Strategy.js
│       │   ├── Alert.js
│       │   ├── Notification.js
│       │   ├── Backtest.js
│       │   ├── Watchlist.js
│       │   ├── Transaction.js
│       │   └── ActivityLog.js
│       ├── middleware/
│       │   ├── auth.js              # JWT verification & role authorization
│       │   └── errorHandler.js      # Centralized error handler
│       ├── controllers/             # REST API business logic controllers
│       ├── routes/                  # Express route definitions
│       ├── services/
│       │   ├── marketSimulator.js   # Brownian motion price generator
│       │   ├── orderEngine.js       # Order execution, fills & positions
│       │   ├── botEngine.js         # Real-time strategy evaluator
│       │   ├── backtestEngine.js    # Historical simulation calculator
│       │   └── riskService.js       # Risk limits & bot circuit breakers
│       └── utils/
│           ├── indicators.js        # Pure mathematical indicators (SMA, EMA, RSI, MACD, BB)
│           └── memoryStore.js       # Resilient in-memory fallback layer
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx                  # Main router connecting 30+ pages
│       ├── index.css                # Tailwind directives, fonts, flash animations
│       ├── main.jsx                 # React root mount
│       ├── components/              # Shared UI components
│       │   ├── Navbar.jsx           # Live crypto ticker, search, notifications, profile
│       │   ├── Sidebar.jsx          # Categorized sidebar navigation
│       │   ├── SearchModal.jsx      # Global Ctrl+K spotlight search
│       │   ├── ResetDemoModal.jsx   # Demo account reset confirmation
│       │   └── ProtectedRoute.jsx   # Auth and admin route guards
│       ├── context/                 # React Context Providers
│       │   ├── AuthContext.jsx      # JWT session & demo login
│       │   ├── MarketContext.jsx    # Real-time WebSocket prices
│       │   ├── NotificationContext.jsx # Floating toasts & alerts
│       │   └── ThemeContext.jsx     # Dark & Light mode
│       ├── layouts/
│       │   ├── AppLayout.jsx        # Authenticated app shell
│       │   └── PublicLayout.jsx     # Landing and auth pages shell
│       ├── pages/                   # All Application & Public pages
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── ResetPassword.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Markets.jsx
│       │   ├── TradingTerminal.jsx
│       │   ├── Portfolio.jsx
│       │   ├── Positions.jsx
│       │   ├── Orders.jsx
│       │   ├── TradeHistory.jsx
│       │   ├── Watchlist.jsx
│       │   ├── BotManager.jsx
│       │   ├── BotDetails.jsx
│       │   ├── Strategies.jsx
│       │   ├── Backtesting.jsx
│       │   ├── Analytics.jsx
│       │   ├── RiskManagement.jsx
│       │   ├── Alerts.jsx
│       │   ├── NotificationsPage.jsx
│       │   ├── NewsFeed.jsx
│       │   ├── Transactions.jsx
│       │   ├── Profile.jsx
│       │   ├── Settings.jsx
│       │   ├── Docs.jsx
│       │   └── admin/               # Admin Portal Pages
│       │       ├── AdminDashboard.jsx
│       │       ├── UserManagement.jsx
│       │       ├── SystemActivity.jsx
│       │       ├── BotMonitoring.jsx
│       │       └── SystemSettings.jsx
│       └── services/
│           └── api.js               # Axios instance with interceptors
└── package.json
```

---

## 5. Prerequisites & Installation

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Optional (MongoDB Server running locally at `127.0.0.1:27017` or MongoDB Atlas URI. If unavailable, the platform automatically engages its resilient memory fallback layer).

### Step 1: Install Dependencies
Open your terminal in the project root:

```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

---

## 6. Environment Variables

Create `.env` inside `backend/` (or copy from `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/trading_bot
JWT_SECRET=super_secret_trading_bot_jwt_key_2026_demo_secure!
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
DEFAULT_BALANCE=10000
```

---

## 7. Running the Application

### Option A: Run Backend & Frontend in Two Terminals

**Terminal 1 (Backend):**
```bash
cd backend
npm start
# or for watch mode:
npm run dev
```
*Backend will start on `http://localhost:5000` and announce WebSocket connectivity.*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*Frontend dev server will start on `http://localhost:5173`.*

---

## 8. Demo Account & Quick Access

To allow instantaneous demonstration during interviews or reviews, the platform includes **1-Click Quick Demo Sign-in**:

1. Navigate to `http://localhost:5173/login` (or click **Explore Demo** on the Landing Page).
2. Click **Demo Trader** to immediately log in as *Alex Mercer* with ₹10,000 virtual balance and user permissions.
3. Click **Admin Demo** to immediately log in as *Admin Demonstrator* with full administrative privileges to `/admin`.
4. To reset your demo balance at any time, click **Reset Demo** in the top navigation bar and confirm.

---

## 9. How the Automated Bot Engine Works

1. **Market Subscription:** When started, the bot registers an interest in its configured asset (e.g., `BTC/USDT`).
2. **Tick Stream:** Every 1.5 seconds, the `MarketSimulator` emits a new price tick and builds candle bars.
3. **Indicator Calculation:** The bot passes the candle series into `indicators.js` to compute SMA, EMA, RSI, MACD, or Bollinger Bands.
4. **Signal Generation:** If entry conditions are satisfied (e.g., fast SMA crosses above slow SMA), a `BUY` signal is generated. If exit conditions are met, a `SELL` signal is generated.
5. **Risk Validation:** The signal passes to `RiskService` to confirm cash availability, position size limits, and daily loss thresholds.
6. **Order Placement:** If cleared, `OrderEngine.createOrder()` executes a simulated market order.
7. **Mark-to-Market:** Portfolio balances, positions, transaction ledgers, and notifications are updated in real time.

---

## 10. How the Backtesting Engine Works

The backtesting lab does **not** use static or faked numbers. When you click **Run Algorithmic Backtest**:
1. The engine constructs a historical sequence of 150–400 simulated candle bars.
2. It simulates step-by-step trading through time, enforcing your custom starting capital, risk per trade %, stop loss %, and take profit %.
3. It records every entry, exit, fee, and P&L.
4. It dynamically calculates total return, win rate, average win/loss, profit factor, max drawdown, and outputs an equity curve rendered via Recharts.

---

## 11. REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate user & return JWT |
| `POST` | `/api/auth/demo` | 1-Click demo trader or admin session |
| `GET` | `/api/auth/me` | Fetch authenticated profile & risk rules |
| `POST` | `/api/auth/reset-demo` | Reset virtual demo account to ₹10,000 |
| `GET` | `/api/markets` | Fetch all 7 crypto assets with 24h stats |
| `GET` | `/api/markets/:symbol` | Fetch asset with live calculated indicators |
| `GET` | `/api/markets/:symbol/candles` | Fetch historical candle bars |
| `POST` | `/api/orders` | Place Market, Limit, or Stop order |
| `GET` | `/api/orders` | Query user order ledger |
| `DELETE` | `/api/orders/:id` | Cancel open limit/stop order |
| `GET` | `/api/portfolio` | Real-time mark-to-market portfolio & holdings |
| `GET` | `/api/positions` | Get open & closed positions |
| `POST` | `/api/positions/:id/close` | Execute market exit on open position |
| `GET` | `/api/bots` | List user automated trading bots |
| `POST` | `/api/bots` | Deploy new algorithmic trading bot |
| `POST` | `/api/bots/:id/start` | Start bot execution |
| `POST` | `/api/bots/:id/stop` | Stop bot execution |
| `POST` | `/api/bots/:id/pause` | Pause bot execution |
| `POST` | `/api/backtests` | Run dynamic historical backtest |
| `GET` | `/api/analytics` | Fetch performance analytics & metrics |
| `GET` | `/api/admin/stats` | Admin platform metrics & server health |
| `GET` | `/api/admin/users` | Admin user account directory |

---

## 12. Future Improvements
- Multi-exchange simulated arbitrage strategy engine.
- Machine Learning (LSTM / XGBoost) price prediction signal layer.
- Webhook alert integrations (Discord / Telegram bot alerts).
- Advanced order types: Trailing Stop Loss, OCO (One-Cancels-the-Other), and Iceberg orders.

---

## License
MIT License. Created for education, portfolio demonstration, and quantitative paper simulation.
