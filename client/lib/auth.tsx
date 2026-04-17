import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, getApiUrl } from "@/lib/query-client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "client" | "designer";
  avatarUrl?: string | null;
  credits: number;
  isOnline: boolean;
  sessionToken?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "@auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const parsed: User = JSON.parse(storedUser);
        setUser(parsed);
        // Refresh user data from server. The user endpoint intentionally
        // strips `sessionToken` for security, so we keep the locally cached
        // token attached to the refreshed object — it was issued by the
        // server at login time and is the authoritative copy on the client.
        try {
          const res = await fetch(new URL(`/api/users/${parsed.id}`, getApiUrl()).toString());
          if (res.ok) {
            const freshUser: User = await res.json();
            const merged: User = { ...freshUser, sessionToken: parsed.sessionToken ?? null };
            setUser(merged);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged));
          }
        } catch {
          // Use cached data if server unreachable
        }
      }
    } catch (error) {
      console.error("Failed to load stored user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await res.json();
    setUser(data.user);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await apiRequest("POST", "/api/auth/register", { email, password, name });
    const data = await res.json();
    setUser(data.user);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  };

  const logout = async () => {
    try {
      if (user?.sessionToken) {
        // The server authenticates logout via the session token header so
        // an unauth caller can't invalidate someone else's token. Use a
        // raw fetch because apiRequest doesn't pass custom headers.
        await fetch(new URL("/api/auth/logout", getApiUrl()).toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": user.sessionToken,
          },
          body: JSON.stringify({}),
        });
      }
    } catch {
      // Continue with logout even if API fails
    }
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const res = await apiRequest("PATCH", `/api/users/${user.id}`, data);
    const updatedUser: User = await res.json();
    // Preserve the locally cached sessionToken — the user endpoint strips
    // it for security, so the merged copy keeps admin access intact after
    // profile edits.
    const merged: User = { ...updatedUser, sessionToken: user.sessionToken ?? null };
    setUser(merged);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged));
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await fetch(new URL(`/api/users/${user.id}`, getApiUrl()).toString());
      if (res.ok) {
        const freshUser: User = await res.json();
        // Preserve the locally cached sessionToken — the user endpoint
        // strips it for security, but our local copy is still valid.
        const merged: User = { ...freshUser, sessionToken: user.sessionToken ?? null };
        setUser(merged);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
