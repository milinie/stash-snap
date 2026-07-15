cat > /mnt/user-data/outputs/AuthContext.jsx << 'ENDOFFILE'
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Increments on SIGNED_IN and USER_UPDATED specifically. Data hooks
  // (useFabricStash, useBundles) watch this to force a cloud re-fetch on
  // those events even when user.id itself hasn't changed — e.g. after a
  // password update via supabase.auth.updateUser(), which fires
  // USER_UPDATED without changing the user's id.
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.error("[AuthContext] getSession() returned an error:", error);
        }
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("[AuthContext] getSession() threw:", err);
        setSession(null);
        setUser(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setAuthLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;

      switch (event) {
        case "SIGNED_IN":
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          setRefreshSignal((prev) => prev + 1);
          break;
        case "TOKEN_REFRESHED":
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          break;
        case "USER_UPDATED":
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          setRefreshSignal((prev) => prev + 1);
          break;
        case "SIGNED_OUT":
          setSession(null);
          setUser(null);
          break;
        default:
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
      }

      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signInWithMagicLink = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    return { data, error };
  };

  const value = {
    session,
    user,
    authLoading,
    isLoggedIn: Boolean(user),
    refreshSignal,
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
ENDOFFILE
echo done