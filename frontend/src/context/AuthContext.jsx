import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Restore session on load
    const storedToken = localStorage.getItem('lira_token')
    const storedUser = localStorage.getItem('lira_user')
    
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('lira_token')
        localStorage.removeItem('lira_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    setError(null)
    setLoading(true)
    try {
      const response = await api.post('/auth/login', { username, password })
      const { access_token, role, username: resUsername } = response.data
      
      const userData = { username: resUsername, role }
      
      localStorage.setItem('lira_token', access_token)
      localStorage.setItem('lira_user', JSON.stringify(userData))
      
      setUser(userData)
      setLoading(false)
      return true
    } catch (err) {
      setLoading(false)
      const message = err.response?.data?.detail || 'Falha ao autenticar. Verifique sua conexão.'
      setError(message)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('lira_token')
    localStorage.removeItem('lira_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
