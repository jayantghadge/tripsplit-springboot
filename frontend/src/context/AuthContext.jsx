import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.me()
        .then(u => setUser({ id: u.userId, name: u.name, email: u.email, role: u.role }))
        .catch(() => { localStorage.removeItem('token'); setToken(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password)
    localStorage.setItem('token', data.token)
    setToken(data.token)
    const u = { id: data.userId, name: data.name, email: data.email, role: data.role }
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (name, email, password) => {
    const data = await api.register(name, email, password)
    localStorage.setItem('token', data.token)
    setToken(data.token)
    const u = { id: data.userId, name: data.name, email: data.email, role: data.role }
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const data = await api.me()
    const u = { id: data.userId, name: data.name, email: data.email, role: data.role }
    setUser(u)
    return u
  }, [])

  const isAdmin = user?.role === 'ROLE_ADMIN'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, isAuthenticated: !!token, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
