import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  fetchMessages,
  createMessage,
  fetchScripts,
  updateScript,
  fetchMobileSettings,
  updateMobileSettings,
} from '../lib/database';

const AxelaContext = createContext();

export const AxelaProvider = ({ children }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [mobileSettings, setMobileSettings] = useState(null);
  const [isConnected, setIsConnected] = useState(true); // Supabase is always connected
  const [mode, setMode] = useState('ai');
  const [loading, setLoading] = useState(true);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      setScripts([]);
      setMobileSettings(null);
      setLoading(false);
    }
  }, [user]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation?.id && user) {
      loadMessages(currentConversation.id);
    } else {
      setMessages([]);
    }
  }, [currentConversation?.id, user]);

  const loadAllData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([
        loadConversations(),
        loadScripts(),
        loadMobileSettings(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    if (!user) return;

    const { data, error } = await fetchConversations(user.id);
    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    // Filter out any duplicates (in case of race conditions)
    const uniqueConversations = (data || []).filter((conv, index, self) =>
      index === self.findIndex((c) => c.id === conv.id)
    );

    // Clean up: If there are multiple empty "New Conversation" entries, keep only the most recent one
    const emptyNewConversations = uniqueConversations.filter(
      (conv) => conv.title === 'New Conversation'
    );

    if (emptyNewConversations.length > 1) {
      // Sort by updated_at, keep the most recent one
      emptyNewConversations.sort((a, b) =>
        new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
      );

      // Delete the older empty conversations
      const toDelete = emptyNewConversations.slice(1);
      for (const conv of toDelete) {
        // Check if conversation has messages before deleting
        const { data: messages } = await fetchMessages(conv.id);
        if (!messages || messages.length === 0) {
          await deleteConversation(conv.id);
        }
      }

      // Reload after cleanup
      const { data: reloadedData } = await fetchConversations(user.id);
      if (reloadedData) {
        const cleaned = reloadedData.filter((conv, index, self) =>
          index === self.findIndex((c) => c.id === conv.id)
        );
        setConversations(cleaned);

        if (cleaned && cleaned.length > 0 && !currentConversation) {
          setCurrentConversation(cleaned[0]);
        }
        return;
      }
    }

    setConversations(uniqueConversations);

    // Set first conversation as current if none selected
    if (uniqueConversations && uniqueConversations.length > 0 && !currentConversation) {
      setCurrentConversation(uniqueConversations[0]);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;

    const { data, error } = await fetchMessages(conversationId);
    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const loadScripts = async () => {
    if (!user) return;

    const { data, error } = await fetchScripts(user.id);
    if (error) {
      console.error('Error loading scripts:', error);
      return;
    }

    setScripts(data || []);
  };

  const loadMobileSettings = async () => {
    if (!user) return;

    const { data, error } = await fetchMobileSettings(user.id);
    if (error) {
      console.error('Error loading mobile settings:', error);
      return;
    }

    if (data) {
      setMobileSettings(data);
      // Update config from mobile settings
      setConfig({
        app: { mode: mode },
        voice: { enabled: data.notifications_enabled },
        custom: { auto_speak_responses: data.sound_enabled },
        security: { enable_logging: true },
      });
    }
  };

  const createNewConversation = async () => {
    if (!user) return null;

    const { data, error } = await createConversation(user.id, 'New Conversation');
    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    if (data) {
      // Add to conversations list
      setConversations(prev => {
        // Check if it already exists (shouldn't, but just in case)
        if (prev.find(c => c.id === data.id)) {
          return prev;
        }
        return [data, ...prev];
      });
      setCurrentConversation(data);
      setMessages([]);
    }
    return data;
  };

  const saveMessage = async (conversationId, role, content, success = null, data = null) => {
    if (!conversationId) return null;

    const { data: messageData, error } = await createMessage(conversationId, role, content, success, data);
    if (error) {
      console.error('Error saving message:', error);
      return null;
    }

    // Update conversation title if it's still "New Conversation" and this is the first user message
    if (currentConversation?.title === 'New Conversation' && role === 'user' && content.length > 0) {
      const title = content.substring(0, 30);
      await updateConversation(conversationId, { title });
      await loadConversations();
    } else {
      // Just update conversation timestamp
      await updateConversation(conversationId, {});
    }

    // Reload messages
    await loadMessages(conversationId);

    return messageData;
  };

  const executeCommand = async (command, commandMode = null) => {
    // This would typically call your backend API
    // For now, return a mock response
    return {
      success: true,
      message: `Command executed: ${command}`,
    };
  };

  const updateConfig = async (section, settings) => {
    // Update local config
    setConfig({
      ...config,
      [section]: { ...config?.[section], ...settings },
    });

    // If updating mobile settings, save to database
    if (section === 'mobile' && user) {
      await updateMobileSettings(user.id, settings);
      await loadMobileSettings();
    }
  };

  const updateSettings = async (settings) => {
    if (!user) return;

    const { error } = await updateMobileSettings(user.id, settings);
    if (error) {
      console.error('Error updating settings:', error);
      return;
    }

    await loadMobileSettings();
  };

  const startScript = async (scriptId) => {
    try {
      const { error } = await updateScript(scriptId, { is_active: true });
      if (error) {
        console.error('Error starting script:', error);
        return;
      }
      await loadScripts();
    } catch (error) {
      console.error('Error starting script:', error);
    }
  };

  const stopScript = async (scriptId) => {
    try {
      const { error } = await updateScript(scriptId, { is_active: false });
      if (error) {
        console.error('Error stopping script:', error);
        return;
      }
      await loadScripts();
    } catch (error) {
      console.error('Error stopping script:', error);
    }
  };

  const deleteCurrentConversation = async (conversationId) => {
    if (!conversationId) {
      return { error: new Error('No conversation ID provided') };
    }

    try {
      // Store current state before deletion
      const wasCurrentConversation = currentConversation?.id === conversationId;
      const currentIndex = conversations.findIndex(conv => conv.id === conversationId);
      const remainingAfterDelete = conversations.filter(conv => conv.id !== conversationId);

      // Delete from database first
      const result = await deleteConversation(conversationId);
      if (result?.error) {
        console.error('Error deleting conversation:', result.error);
        return { error: result.error };
      }

      // Update conversations list immediately - create new array reference to ensure React detects change
      const updatedConversations = [...remainingAfterDelete];
      setConversations(updatedConversations);

      // Handle current conversation selection
      if (wasCurrentConversation) {
        // Clear messages first
        setMessages([]);

        // If there are other conversations, select the next one (or first one)
        if (remainingAfterDelete.length > 0) {
          // Try to select the one at the same index, or the previous one, or just the first
          const nextIndex = currentIndex >= 0 ? Math.min(currentIndex, remainingAfterDelete.length - 1) : 0;
          const nextConversation = remainingAfterDelete[nextIndex] || remainingAfterDelete[0];
          setCurrentConversation(nextConversation);
        } else {
          // No conversations left - clear current but DON'T auto-create
          // User must click "New Chat" to create one
          setCurrentConversation(null);
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return { error };
    }
  };

  const value = {
    config,
    conversations,
    currentConversation,
    messages,
    scripts,
    mobileSettings,
    isConnected,
    mode,
    loading,
    setMode,
    setConversations,
    setCurrentConversation,
    setScripts,
    executeCommand,
    updateConfig,
    updateSettings,
    loadConversations,
    loadScripts,
    loadMobileSettings,
    createNewConversation,
    saveMessage,
    loadAllData,
    startScript,
    stopScript,
    deleteCurrentConversation,
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
