import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Guarantee authLoading always resolves to false, even if getSession()
    // rejects outright (network failure, corrupted stored token, etc).
    // Previously this had no .catch(), so a rejection left the app stuck
    // on the loading screen indefinitely — the root cause of the blank
    // screen after magic-link redirects.
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

    // Registered synchronously on mount, alongside getSession() above —
    // not nested inside it — so we never miss an early SIGNED_IN event
    // (e.g. from a magic-link redirect that resolves while getSession()
    // is still in flight).
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;

      // No async Supabase calls happen in this callback (e.g. no
      // supabase.auth.getUser() here) — calling those directly inside
      // onAuthStateChange is a known source of deadlocks in supabase-js,
      // since the auth client holds an internal lock while emitting
      // this event. All work below is synchronous state updates only.
      switch (event) {
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
        case "USER_UPDATED":
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          break;
        case "SIGNED_OUT":
          setSession(null);
          setUser(null);
          break;
        default:
          // Covers any other events (e.g. PASSWORD_RECOVERY, INITIAL_SESSION)
          // by still reflecting whatever session Supabase reports, so we
          // never silently ignore a state change.
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
      }

      // onAuthStateChange can fire before the initial getSession() resolves
      // (e.g. immediately on a magic-link redirect), so also clear loading
      // here rather than relying solely on the getSession() chain above.
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