import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [socketConnected, setSocketConnected] = useState(false);
  const [priceFlashes, setPriceFlashes] = useState({});
  const [lastTickTimes, setLastTickTimes] = useState({});
  const socketRef = useRef(null);

  // Initial fetch of markets via REST API as immediate baseline
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await api.get('/markets');
        if (res.data.success && res.data.data.length > 0) {
          setAssets(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch initial markets:', err);
      }
    };
    fetchMarkets();
  }, []);

  // Socket.IO real-time connection
  useEffect(() => {
    const socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      if (user?.id) {
        socket.emit('join_user', user.id);
      }
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('initial_market_data', (initialAssets) => {
      if (initialAssets && initialAssets.length > 0) {
        setAssets(initialAssets);
      }
    });

    socket.on('market_ticks', (ticks) => {
      setAssets((prevAssets) => {
        const next = [...prevAssets];
        const newFlashes = {};

        ticks.forEach((tick) => {
          const idx = next.findIndex((a) => a.symbol === tick.symbol);
          if (idx !== -1) {
            const oldPrice = next[idx].price;
            if (tick.price > oldPrice) {
              newFlashes[tick.symbol] = 'up';
            } else if (tick.price < oldPrice) {
              newFlashes[tick.symbol] = 'down';
            }
            next[idx] = { ...next[idx], ...tick };
          } else {
            next.push(tick);
          }
        });

        if (Object.keys(newFlashes).length > 0) {
          setPriceFlashes((prev) => ({ ...prev, ...newFlashes }));
          // Clear flash after 800ms
          setTimeout(() => {
            setPriceFlashes((prev) => {
              const cleaned = { ...prev };
              Object.keys(newFlashes).forEach((k) => delete cleaned[k]);
              return cleaned;
            });
          }, 800);
        }

        return next;
      });
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user?.id]);

  const currentAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0] || null;

  return (
    <MarketContext.Provider
      value={{
        assets,
        selectedSymbol,
        setSelectedSymbol,
        currentAsset,
        socketConnected,
        priceFlashes,
        socket: socketRef.current,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
