// hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';

const useWebSocket = (sessionId, onMessage) => {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const messageQueueRef = useRef([]);

  const connectWebSocket = useCallback(() => {
    if (!sessionId) return;

    const token = localStorage.getItem('access_token');
    const wsUrl = token 
      ? `ws://127.0.0.1:8000/ws/assistance/${sessionId}/?token=${token}`
      : `ws://127.0.0.1:8000/ws/assistance/${sessionId}/`;

    console.log('Connecting to WebSocket:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
      setReconnectCount(0);
      
      // Send queued messages
      if (messageQueueRef.current.length > 0) {
        messageQueueRef.current.forEach(msg => {
          if (wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
          }
        });
        messageQueueRef.current = [];
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket Disconnected:', event.code, event.reason);
      setIsConnected(false);
      
      // Attempt to reconnect
      if (reconnectCount < 5) {
        const delay = 3000 * Math.pow(1.5, reconnectCount);
        console.log(`Reconnecting in ${delay}ms...`);
        
        setTimeout(() => {
          setReconnectCount(prev => prev + 1);
          connectWebSocket();
        }, delay);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  }, [sessionId, reconnectCount, onMessage]);

  useEffect(() => {
    if (sessionId) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId, connectWebSocket]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      // Queue message for when connection is restored
      messageQueueRef.current.push(message);
      console.log('WebSocket not ready, message queued:', message);
      return false;
    }
  }, []);

  return { isConnected, sendMessage };
};

export default useWebSocket;