// src/services/socketService.js
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  connect(user) {
    try {
      const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.setupEventListeners(user);
      
    } catch (error) {
      console.error('Error connecting to Socket.IO:', error);
      toast.error('Failed to establish real-time connection');
    }
  }

  setupEventListeners(user) {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', this.socket.id);
      this.isConnected = true;
      
      if (user) {
        this.socket.emit('join-room', {
          userId: user._id,
          role: user.role,
          name: user.name
        });
      }
      
      toast.success('Real-time connection established');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      this.isConnected = false;
      toast.warning('Real-time connection lost');
    });

    this.socket.on('content-refresh', (data) => {
      console.log('📢 Content refresh received:', data);
      this.notifyEventListeners('content-refresh', data);
    });

    this.socket.on('current-content-broadcast', (data) => {
      console.log('📺 Current content broadcast:', data);
      this.notifyEventListeners('current-content-broadcast', data);
    });

    this.socket.on('current-content-response', (data) => {
      console.log('📋 Current content response:', data);
      this.notifyEventListeners('current-content-response', data);
    });

    this.socket.on('schedule-created', (data) => {
      console.log('📅 Schedule created:', data);
      this.notifyEventListeners('schedule-created', data);
      toast.info(`New schedule created: ${data.schedule?.name}`);
    });
  }

  requestCurrentContent() {
    return this.emit('request-current-content', {
      timestamp: new Date(),
      requestId: Date.now()
    });
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
    
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
      return true;
    }
    return false;
  }

  notifyEventListeners(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  cleanup() {
    this.eventListeners.clear();
    this.disconnect();
  }
}

const socketService = new SocketService();
export default socketService;

