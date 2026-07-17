/**
 * ZES API Configuration
 * Centralizes all API endpoint URLs for easy configuration
 */

export const API = {
  // Flask API base
  flask: process.env.NEXT_PUBLIC_FLASK_API_URL || "http://127.0.0.1:5002",

  // Service endpoints
  health: () => `${API.flask}/api/health`,
  summary: () => `${API.flask}/api/summary`,
  services: () => `${API.flask}/api/services`,
  system: () => `${API.flask}/api/system`,
  processes: () => `${API.flask}/api/processes`,
  processKill: (pid) => `${API.flask}/api/processes/${pid}/kill`,
  network: () => `${API.flask}/api/network`,
  webServices: () => `${API.flask}/api/web-services`,
  battery: () => `${API.flask}/api/battery`,

  // Memory Hub
  memoryStatus: () => `${API.flask}/api/zes/memory/status`,
  memoryList: (limit = 20) => `${API.flask}/api/zes/memory/list?limit=${limit}`,
  memorySearch: (q) => `${API.flask}/api/zes/memory/search?q=${encodeURIComponent(q)}`,

  // amux
  amuxSessions: () => `${API.flask}/api/amux/sessions`,
  amuxStart: () => `${API.flask}/api/amux/start`,
  amuxStop: () => `${API.flask}/api/amux/stop`,

  // Service control
  serviceStart: () => `${API.flask}/api/service/start`,
  serviceStop: () => `${API.flask}/api/service/stop`,
  serviceRestart: (name) => `${API.flask}/api/services/${name}/restart`,
};

/**
 * WebSocket connection manager for real-time updates
 */
export class ZESWebSocket {
  constructor(url = "ws://127.0.0.1:5002/ws") {
    this.url = url;
    this.ws = null;
    this.listeners = new Map();
    this.reconnectTimer = null;
    this.shouldReconnect = true;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const type = data.type || "message";
          const handlers = this.listeners.get(type) || [];
          handlers.forEach(fn => fn(data.payload || data));
        } catch {}
      };
      this.ws.onclose = () => {
        if (this.shouldReconnect) {
          this.reconnectTimer = setTimeout(() => this.connect(), 5000);
        }
      };
      this.ws.onerror = () => this.ws?.close();
    } catch {}
  }

  on(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
    return () => {
      const handlers = this.listeners.get(type)?.filter(h => h !== handler);
      if (handlers?.length) this.listeners.set(type, handlers);
      else this.listeners.delete(type);
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

// Singleton instance
export const zesWs = new ZESWebSocket();
