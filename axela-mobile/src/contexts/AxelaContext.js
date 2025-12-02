import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AxelaContext = createContext();

// Configure your backend URL (update this to your backend address)
const API_BASE_URL = 'http://192.168.1.100:8000'; // Change to your computer's IP

export const AxelaProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [mode, setMode] = useState('ai');

  useEffect(() => {
    loadConfig();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/config`, { timeout: 3000 });
      setIsConnected(response.status === 200);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/config`, { timeout: 3000 });
      setConfig(response.data.config);
      setMode(response.data.config.mode || 'ai');
    } catch (error) {
      console.log('Backend not connected, using default config');
      // Set default config when backend is unavailable
      setConfig({
        app: { mode: 'ai' },
        voice: { enabled: true },
        custom: { auto_speak_responses: false },
        security: { enable_logging: true }
      });
    }
  };

  const executeCommand = async (command, commandMode = null) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/execute`, {
        command,
        mode: commandMode || mode,
      });
      return response.data;
    } catch (error) {
      console.error('Command execution failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to execute command',
      };
    }
  };

  const updateConfig = async (section, settings) => {
    try {
      await axios.put(`${API_BASE_URL}/config`, { section, settings });
      await loadConfig();
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  const value = {
    config,
    conversations,
    currentConversation,
    isConnected,
    mode,
    setMode,
    setConversations,
    setCurrentConversation,
    executeCommand,
    updateConfig,
    loadConfig,
    checkConnection,
  };

  return <AxelaContext.Provider value={value}>{children}</AxelaContext.Provider>;
};

export const useAxela = () => {
  const context = useContext(AxelaContext);
  if (!context) {
    throw new Error('useAxela must be used within AxelaProvider');
  }
  return context;
};
