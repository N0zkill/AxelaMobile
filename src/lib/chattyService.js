import { supabase } from './supabaseClient';

// Backend API URL - update this to match your backend server
const BACKEND_URL = 'http://localhost:8000';

/**
 * Create a new conversation
 * @param {string} userId - The user ID
 * @param {string} title - Optional conversation title
 * @returns {Promise<Object>} The created conversation
 */
export async function createConversation(userId, title = 'New Conversation') {
    if (!userId) {
        throw new Error('userId is required');
    }

    try {
        const response = await fetch(`${BACKEND_URL}/conversations/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                title,
            }),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to create conversation');
        }

        return result.data;
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
}

/**
 * Send a message to a conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} content - The message content
 * @param {string} role - Message role (user, assistant, system)
 * @param {Object} data - Optional additional data
 * @returns {Promise<Object>} The created message
 */
export async function sendMessage(conversationId, content, role = 'user', data = {}) {
    if (!conversationId) {
        throw new Error('conversationId is required');
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        throw new Error('Content is required and must be a non-empty string');
    }

    try {
        const response = await fetch(`${BACKEND_URL}/messages/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: conversationId,
                content: content.trim(),
                role,
                success: true,
                data,
            }),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to send message');
        }

        return result.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

/**
 * Send a message with automatic retry on failure
 * @param {string} conversationId - The conversation ID
 * @param {string} content - The message content
 * @param {string} role - Message role
 * @param {Object} data - Optional additional data
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @returns {Promise<Object>} The created message
 */
export async function sendMessageWithRetry(conversationId, content, role = 'user', data = {}, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await sendMessage(conversationId, content, role, data);
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt} failed:`, error.message);

            // Wait before retrying (exponential backoff)
            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Fetch conversations for a user
 * @param {string} userId - The user ID to filter by
 * @param {number} limit - Maximum number of conversations to fetch
 * @returns {Promise<Array>} Array of conversations
 */
export async function fetchConversations(userId, limit = 50) {
    try {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (userId) {
            params.append('user_id', userId);
        }

        const response = await fetch(`${BACKEND_URL}/conversations?${params}`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch conversations');
        }

        return result.data || [];
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
}

/**
 * Fetch messages for a specific conversation
 * @param {string} conversationId - The conversation ID
 * @param {number} limit - Maximum number of messages to fetch
 * @returns {Promise<Array>} Array of messages
 */
export async function fetchMessages(conversationId, limit = 100) {
    if (!conversationId) {
        throw new Error('conversationId is required');
    }

    try {
        const response = await fetch(`${BACKEND_URL}/messages/${conversationId}?limit=${limit}`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch messages');
        }

        return result.data || [];
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}

/**
 * Subscribe to real-time message updates for a conversation
 * @param {string} conversationId - The conversation ID to subscribe to
 * @param {Function} callback - Callback function to handle new messages
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToMessages(conversationId, callback) {
    const channel = supabase
        .channel(`messages-${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
                callback(payload.new);
            }
        )
        .subscribe();

    return {
        unsubscribe: () => {
            supabase.removeChannel(channel);
        },
    };
}

/**
 * Subscribe to real-time conversation updates
 * @param {string} userId - The user ID to filter conversations
 * @param {Function} callback - Callback function to handle conversation changes
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToConversations(userId, callback) {
    const channel = supabase
        .channel('conversations-changes')
        .on(
            'postgres_changes',
            {
                event: '*', // INSERT, UPDATE, DELETE
                schema: 'public',
                table: 'conversations',
                filter: userId ? `user_id=eq.${userId}` : undefined,
            },
            (payload) => {
                callback(payload);
            }
        )
        .subscribe();

    return {
        unsubscribe: () => {
            supabase.removeChannel(channel);
        },
    };
}

export default {
    createConversation,
    sendMessage,
    sendMessageWithRetry,
    fetchConversations,
    fetchMessages,
    subscribeToMessages,
    subscribeToConversations,
};
