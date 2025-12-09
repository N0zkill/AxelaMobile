import { supabase } from './supabase';

const SUPABASE_URL = 'https://zpybzbudxdznzehulgyx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jubAtV8I0rlrw_6FkIyx9Q_qH-HF8lo';

/**
 * Get list of active desktop instances for the authenticated user
 */
export const listDesktopInstances = async (session) => {
  try {
    if (!session?.access_token) {
      throw new Error('No session token available');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/list-desktop-instances`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to list desktop instances: ${error}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error listing desktop instances:', error);
    return { data: null, error };
  }
};

/**
 * Send a remote command to desktop client(s)
 * @param {Object} params - Command parameters
 * @param {string} params.command_type - "chat" | "ai" | "agent" | "manual" | "script"
 * @param {string} params.command_text - Command text (required for chat/ai/agent/manual)
 * @param {string} params.script_id - Script ID (required for script type)
 * @param {string} params.mode - "chat" | "ai" | "agent" | "manual" (optional)
 * @param {string} params.desktop_instance_id - Target specific desktop (optional, omit for broadcast)
 * @param {Object} session - Supabase session with access_token
 */
export const sendRemoteCommand = async (params, session) => {
  try {
    if (!session?.access_token) {
      throw new Error('No session token available');
    }

    const { command_type, command_text, script_id, mode, desktop_instance_id } = params;

    // Validate required fields based on command type
    if (command_type === 'script' && !script_id) {
      throw new Error('script_id is required for script command type');
    }
    if (command_type !== 'script' && !command_text) {
      throw new Error('command_text is required for non-script command types');
    }

    const body = {
      command_type,
    };

    // Only include mode for non-script commands (mode constraint doesn't allow 'script')
    // For script commands, do NOT include mode at all
    if (command_type !== 'script') {
      // For non-script commands, use provided mode or default to command_type
      body.mode = mode || command_type;
    }
    // Explicitly do NOT set mode for script commands

    if (command_text) {
      body.command_text = command_text;
    }
    if (script_id) {
      body.script_id = script_id;
    }
    if (desktop_instance_id) {
      body.desktop_instance_id = desktop_instance_id;
    }

    // Debug: Log the body to verify mode is not included for scripts
    if (command_type === 'script') {
      console.log('Sending script command, body:', JSON.stringify(body));
      // Ensure mode is definitely not in the body
      delete body.mode;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-remote-command`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send remote command: ${error}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error sending remote command:', error);
    return { data: null, error };
  }
};

