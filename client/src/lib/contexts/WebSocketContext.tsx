import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { toast } from "sonner";

interface WebSocketContextType {
  wsRef: React.MutableRefObject<WebSocket | null>;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    console.log("WebSocket connect called");
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return; // Already connected
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/multiplayer`;
    console.log("Connecting to WebSocket:", wsUrl);

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected successfully");
      setIsConnected(true);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Failed to connect to server");
    };
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  // Auto-connect when the provider mounts
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{ wsRef, isConnected, connect, disconnect }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
