import { supabase } from './supabase';

export const subscribeToCommandResponse = (commandId, callback) => {
  if (!commandId) {
    console.error('No command ID provided for subscription');
    return null;
  }

  const subscription = supabase
    .channel(`command_response_${commandId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'command_responses',
        filter: `command_id=eq.${commandId}`,
      },
      (payload) => {
        console.log('Command response received:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};


export const pollCommandResponse = async (commandId, maxAttempts = 30) => {
  if (!commandId) return { data: null, error: null };

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const { data, error } = await supabase
        .from('command_responses')
        .select('*')
        .eq('command_id', commandId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error polling command response:', error);
        // Continue polling on error
      }

      if (data && data.length > 0) {
        return { data: data[0], error: null };
      }

      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error in poll loop:', error);
      break;
    }
  }

  return { data: null, error: new Error('Timeout waiting for response') };
};

/**
 * Get command response by command ID
 */
export const getCommandResponse = async (commandId) => {
  try {
    const { data, error } = await supabase
      .from('command_responses')
      .select('*')
      .eq('command_id', commandId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error getting command response:', error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      // No response yet
      return { data: null, error: null };
    }

    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error getting command response:', error);
    return { data: null, error };
  }
};

