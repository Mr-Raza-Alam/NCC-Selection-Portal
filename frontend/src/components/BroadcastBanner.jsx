import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';

const BroadcastBanner = () => {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('none');
  const location = useLocation();

  useEffect(() => {
    const fetchBroadcast = async () => {
      try {
        const res = await api.get('/public/broadcast');
        setBroadcastMessage(res.data.broadcastMessage || '');
        setBroadcastTarget(res.data.broadcastTarget || 'none');
      } catch (err) {
        console.error('Failed to fetch broadcast');
      }
    };
    
    fetchBroadcast();
  }, []);

  if (!broadcastMessage || broadcastTarget === 'none') return null;

  let pageType = 'landing';
  if (location.pathname.includes('dashboard') || location.pathname.includes('test')) {
    pageType = 'dashboard';
  }

  if (broadcastTarget !== 'both' && broadcastTarget !== pageType) return null;

  return (
    <div className="marquee-container">
      <div className="marquee-content">
        ⚠️ {broadcastMessage} ⚠️
      </div>
    </div>
  );
};

export default BroadcastBanner;
