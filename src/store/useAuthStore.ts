"use client";

import { create } from "zustand";
import { DbUser } from "@/types/db";
import { fetchCurrentUser, loginApi, registerApi, logoutApi } from "@/lib/api";

interface AuthState {
  user: DbUser | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<DbUser>;
  register: (email: string, password: string, name?: string) => Promise<DbUser>;
  logout: () => Promise<void>;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isAuthModalOpen: false,
  authModalMode: "login",

  checkAuth: async () => {
    try {
      const user = await fetchCurrentUser();
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const res = await loginApi({ email, password });
      if (res.user) {
        set({ user: res.user, isAuthModalOpen: false, loading: false });
        return res.user;
      }
      throw new Error(res.message || "Не удалось войти в аккаунт");
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ loading: true });
    try {
      const res = await registerApi({ email, password, name });
      if (res.user) {
        set({ user: res.user, isAuthModalOpen: false, loading: false });
        return res.user;
      }
      throw new Error(res.message || "Не удалось зарегистрироваться");
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await logoutApi();
      set({ user: null, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  openAuthModal: (mode = "login") => {
    set({ isAuthModalOpen: true, authModalMode: mode });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false });
  },
}));
