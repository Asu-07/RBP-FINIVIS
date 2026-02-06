import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useAdminAccess() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isForexAdmin, setIsForexAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsForexAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user has admin role
        const { data: adminData, error: adminError } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (adminError) {
          console.error('Error checking admin access:', adminError);
          setIsAdmin(false);
        } else {
          setIsAdmin(adminData === true);
        }

        // Check if user has forex_admin role
        const { data: forexAdminData, error: forexAdminError } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'forex_admin'
        });

        if (forexAdminError) {
          console.error('Error checking forex admin access:', forexAdminError);
          setIsForexAdmin(false);
        } else {
          setIsForexAdmin(forexAdminData === true);
        }
      } catch (err) {
        console.error('Admin check failed:', err);
        setIsAdmin(false);
        setIsForexAdmin(false);
      }

      setLoading(false);
    };

    checkAdminAccess();
  }, [user]);

  return { isAdmin, isForexAdmin, loading };
}
