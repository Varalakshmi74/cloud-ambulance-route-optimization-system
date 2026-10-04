class WebSocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectTimeout = null;
    this.channel = "all";
  }

  connect(channel = "all") {
    this.channel = channel;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws?channel=${channel}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`[WebSocket] Connected to Cloud Emergency Channel: ${channel}`);
        this.reconnectAttempts = 0;
        this.notifyListeners({ type: "WS_CONNECTED" });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (e) {
          console.warn("[WebSocket] Received non-JSON payload:", event.data);
        }
      };

      this.socket.onclose = () => {
        console.log("[WebSocket] Connection closed. Attempting reconnect...");
        this.scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.warn("[WebSocket] Error:", err);
      };
    } catch (err) {
      console.error("[WebSocket] Exception during connection:", err);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
      this.reconnectAttempts++;
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(() => {
        this.connect(this.channel);
      }, delay);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.error("[WebSocket Listener Error]", err);
      }
    });
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }

  disconnect() {
    clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.close();
    }
  }
}

export const wsClient = new WebSocketClient();
