import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts & Guard
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Docs from './pages/Docs';

// App Pages
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import TradingTerminal from './pages/TradingTerminal';
import Portfolio from './pages/Portfolio';
import Positions from './pages/Positions';
import Orders from './pages/Orders';
import TradeHistory from './pages/TradeHistory';
import Watchlist from './pages/Watchlist';
import BotManager from './pages/BotManager';
import BotDetails from './pages/BotDetails';
import Strategies from './pages/Strategies';
import Backtesting from './pages/Backtesting';
import Analytics from './pages/Analytics';
import RiskManagement from './pages/RiskManagement';
import Alerts from './pages/Alerts';
import NotificationsPage from './pages/NotificationsPage';
import NewsFeed from './pages/NewsFeed';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemActivity from './pages/admin/SystemActivity';
import BotMonitoring from './pages/admin/BotMonitoring';
import SystemSettings from './pages/admin/SystemSettings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MarketProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/docs" element={<Docs />} />
                </Route>

                {/* Protected Application Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/markets" element={<Markets />} />
                    <Route path="/trade" element={<TradingTerminal />} />
                    <Route path="/trade/:symbol" element={<TradingTerminal />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/positions" element={<Positions />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/history" element={<TradeHistory />} />
                    <Route path="/trades" element={<TradeHistory />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/bots" element={<BotManager />} />
                    <Route path="/bots/:id" element={<BotDetails />} />
                    <Route path="/strategies" element={<Strategies />} />
                    <Route path="/backtesting" element={<Backtesting />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/risk" element={<RiskManagement />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/news" element={<NewsFeed />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />

                    {/* Admin Protected Routes */}
                    <Route element={<ProtectedRoute requireAdmin={true} />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route path="/admin/activity" element={<SystemActivity />} />
                      <Route path="/admin/bots" element={<BotMonitoring />} />
                      <Route path="/admin/settings" element={<SystemSettings />} />
                    </Route>
                  </Route>
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </MarketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
