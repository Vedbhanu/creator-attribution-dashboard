'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthListener() {
  useEffect(() => {
    if (!supabase) return;

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const name = session.user.user_metadata?.full_name || email.split('@')[0];
        
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_name', name);
        
        if (email.toLowerCase().includes('ved') || email === 'abdbhanu1212@gmail.com') {
          localStorage.setItem('user_role', 'admin');
        } else {
          localStorage.setItem('user_role', 'client');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
