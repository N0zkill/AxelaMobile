import { supabase } from './supabase';

// ==================== CONVERSATIONS ====================

/**
 * Fetch all conversations for the current user
 */
export const fetchConversations = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { data: null, error };
  }
};

/**
 * Create a new conversation
 */
export const createConversation = async (userId, title = 'New Conversation') => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          title,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating conversation:', error);
    return { data: null, error };
  }
};

/**
 * Update a conversation
 */
export const updateConversation = async (conversationId, updates) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating conversation:', error);
    return { data: null, error };
  }
};

/**
 * Delete a conversation and all its messages
 */
export const deleteConversation = async (conversationId) => {
  try {
    // First, delete all messages in the conversation
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      // Continue anyway - might be a permissions issue or messages already deleted
      // If CASCADE is set up, this might not be necessary
    }

    // Then delete the conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return { error };
  }
};

// ==================== MESSAGES ====================

/**
 * Fetch all messages for a conversation
 */
export const fetchMessages = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { data: null, error };
  }
};

/**
 * Create a new message
 */
export const createMessage = async (conversationId, role, content, success = null, data = null) => {
  try {
    const { data: messageData, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          role,
          content,
          success,
          data,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data: messageData, error: null };
  } catch (error) {
    console.error('Error creating message:', error);
    return { data: null, error };
  }
};

// ==================== PROFILE ====================

/**
 * Fetch user profile
 */
export const fetchProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
};

// ==================== SCRIPTS ====================

/**
 * Fetch all scripts for the current user
 */
export const fetchScripts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching scripts:', error);
    return { data: null, error };
  }
};

/**
 * Create a new script
 */
export const createScript = async (scriptData) => {
  try {
    const { data, error } = await supabase
      .from('scripts')
      .insert([scriptData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating script:', error);
    return { data: null, error };
  }
};

/**
 * Update a script
 */
export const updateScript = async (scriptId, updates) => {
  try {
    const { data, error } = await supabase
      .from('scripts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scriptId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating script:', error);
    return { data: null, error };
  }
};

/**
 * Delete a script
 */
export const deleteScript = async (scriptId) => {
  try {
    const { error } = await supabase
      .from('scripts')
      .delete()
      .eq('id', scriptId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting script:', error);
    return { error };
  }
};

// ==================== MOBILE SETTINGS ====================

/**
 * Fetch mobile settings for the current user
 */
export const fetchMobileSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('mobile_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If settings don't exist, create default settings
      if (error.code === 'PGRST116') {
        return await createMobileSettings(userId);
      }
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching mobile settings:', error);
    return { data: null, error };
  }
};

/**
 * Create default mobile settings for a user
 */
export const createMobileSettings = async (userId) => {
  try {
    const defaultSettings = {
      user_id: userId,
      theme: 'auto',
      notifications_enabled: true,
      sound_enabled: true,
      vibration_enabled: true,
      auto_sync: true,
      sync_interval: 5,
    };

    const { data, error } = await supabase
      .from('mobile_settings')
      .insert([defaultSettings])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating mobile settings:', error);
    return { data: null, error };
  }
};

/**
 * Update mobile settings
 */
export const updateMobileSettings = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('mobile_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating mobile settings:', error);
    return { data: null, error };
  }
};

