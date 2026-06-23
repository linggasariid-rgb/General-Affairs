import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.email);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.email);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  async function fetchProfile(email) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      if (data.success) setProfile(data.data);
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  }

  async function login() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  function hasRole(roles) {
    if (!profile) return false;
    return roles.includes(profile.roles?.kode);
  }

  function can(permission) {
    if (!profile) return false;
    const roleCode = profile.roles?.kode;
    if (roleCode === 'SA') return true;
    return false;
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, hasRole, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
