import { create } from 'zustand'

export const useStore = create((set) => ({
  user: null,
  profile: null,
  tenant: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setTenant: (tenant) => set({ tenant }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, profile: null, tenant: null }),
}))
