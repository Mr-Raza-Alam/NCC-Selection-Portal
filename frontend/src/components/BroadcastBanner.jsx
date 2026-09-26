import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';

const BroadcastBanner = () => {
  const [messages, setMessages] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchBroadcast = async () => {
      try {
        const res = await api.get('/public/broadcast');
        const enrollment = res.data.enrollment || {};
        const rank = res.data.rank || {};

        const isRankPage = location.pathname.includes('/rank');
        const isDashboard = location.pathname.includes('dashboard') || location.pathname.includes('test');
        const isLanding = !isDashboard;

        const collected = [];

        if (isRankPage && isDashboard) {
          // Rank dashboard: show only rank broadcasts targeting dashboard or both
          if (rank.broadcastMessage && (rank.broadcastTarget === 'dashboard' || rank.broadcastTarget === 'both')) {
            collected.push(rank.broadcastMessage);
          }
        } else if (isDashboard) {
          // Enrollment dashboard: show only enrollment broadcasts targeting dashboard or both
          if (enrollment.broadcastMessage && (enrollment.broadcastTarget === 'dashboard' || enrollment.broadcastTarget === 'both')) {
            collected.push(enrollment.broadcastMessage);
          }
        } else if (isLanding) {
          // Landing page (common): show both enrollment and rank broadcasts targeting landing or both
          if (enrollment.broadcastMessage && (enrollment.broadcastTarget === 'landing' || enrollment.broadcastTarget === 'both')) {
            collected.push(enrollment.broadcastMessage);
          }
          if (rank.broadcastMessage && (rank.broadcastTarget === 'landing' || rank.broadcastTarget === 'both')) {
            // Avoid duplicates if both messages are exactly the same
            if (!collected.includes(rank.broadcastMessage)) {
              collected.push(rank.broadcastMessage);
            }
          }
        }

        setMessages(collected);
      } catch (err) {
        console.error('Failed to fetch broadcast');
      }
    };
    
    fetchBroadcast();
  }, [location.pathname]);

  if (messages.length === 0) return null;

  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {messages.map((msg, i) => (
          <span key={i}>⚠️ {msg} ⚠️{i < messages.length - 1 ? '   |   ' : ''}</span>
        ))}
      </div>
    </div>
  );
};

export default BroadcastBanner;
