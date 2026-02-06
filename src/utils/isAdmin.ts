import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the current user is an admin.
 * Uses the secure `has_role` RPC function for server-side verification.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data, error } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error('Admin check failed:', err);
    return false;
  }
}

/**
 * Check if the current user is a forex admin.
 * Forex admins have access to the "Set Rates" feature to manage currency exchange rates.
 */
export async function isForexAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data, error } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'forex_admin'
    });

    if (error) {
      console.error('Error checking forex admin status:', error);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error('Forex admin check failed:', err);
    return false;
  }
}